# Implementation Plan — Kiini

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo (React Native) with `expo-router` |
| Auth + DB + Storage + Realtime | Supabase |
| AI | Gemma 4 API (function calling + multimodal) |
| Client state | Zustand |
| UI animations | react-native-reanimated |
| Bottom sheets | @gorhom/bottom-sheet |
| File picking | expo-document-picker, expo-image-picker |

---

## Directory Layout

```
kiini/
├── app/                              # expo-router file-based routing
│   ├── _layout.tsx                   # Root: providers, session gate, theme
│   ├── index.tsx                     # Entry — redirects to onboarding or home
│   │
│   ├── onboarding/
│   │   ├── _layout.tsx               # Onboarding layout (progress bar, step nav)
│   │   ├── welcome.tsx               # Step 0: splash / welcome
│   │   ├── profile.tsx               # Step 1: name, course, year
│   │   ├── units.tsx                 # Step 2: pick units from catalog
│   │   └── room.tsx                  # Step 3: join room code (optional)
│   │
│   ├── (tabs)/                       # Bottom tab navigator
│   │   ├── _layout.tsx               # Tab config: home, units, rooms, events, hub
│   │   ├── home.tsx                  # Dashboard: timetable, reminders, quick cards
│   │   ├── units.tsx                 # Unit list
│   │   ├── rooms.tsx                 # Room list
│   │   ├── events.tsx                # Event feed
│   │   └── hub.tsx                   # Info Hub Q&A
│   │
│   ├── unit/
│   │   └── [id].tsx                  # Unit workspace: files, topics, upload
│   │
│   ├── room/
│   │   └── [id].tsx                  # Room detail: chat, files, members tabs
│   │
│   └── admin/
│       ├── sign-in.tsx               # Magic link sign-in
│       └── console.tsx               # Post event, manage Info Hub docs
│
├── src/
│   ├── components/                   # Reusable UI components
│   │   ├── Stamp.tsx                 # Rubber-stamp badge
│   │   ├── FileRow.tsx               # File display (icon, name, meta, actions)
│   │   ├── ChatBubble.tsx            # Chat message (me / others / Gemma / system)
│   │   ├── BottomSheet.tsx           # Reusable bottom sheet wrapper
│   │   ├── Toast.tsx                 # Toast notification
│   │   ├── Chip.tsx                  # Selectable chip/tag
│   │   ├── TopicChips.tsx            # Horizontal scrollable topic filter
│   │   ├── QuickCard.tsx             # Unit quick-access card (home grid)
│   │   ├── TimetableCard.tsx         # Single timetable slot card
│   │   ├── EventCard.tsx             # Event card with save toggle
│   │   ├── UploadZone.tsx            # Drag-to-attach / tap-to-upload area
│   │   ├── ProcessingCard.tsx        # "Gemma is processing..." animated card
│   │   └── Avatar.tsx                # Colored initial avatar
│   │
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client init (anon key)
│   │   ├── gemma.ts                  # Gemma 4 API client (classify, extract, chat)
│   │   └── store.ts                  # Zustand stores
│   │       ├── useAuthStore          # session, profile, onboarded state
│   │       ├── useUnitStore          # units, current unit, personal files
│   │       ├── useRoomStore          # rooms, current room, messages, room files
│   │       └── useHubStore           # hub messages, docs
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # Anonymous sign-in, profile fetch/upsert
│   │   ├── useUnits.ts               # CRUD units, personal files, upload
│   │   ├── useRoom.ts                # Room messages (realtime sub), members
│   │   ├── useEvents.ts              # Events fetch, save toggle
│   │   ├── useHub.ts                 # Info Hub Q&A, doc upload
│   │   └── useGemma.ts               # Gemma API calls with loading/typing state
│   │
│   ├── types/
│   │   └── index.ts                  # All TypeScript interfaces
│   │       # Profile, Unit, Room, RoomMessage, File, Event, Task, HubDocument, etc.
│   │
│   ├── constants/
│   │   ├── theme.ts                  # Colors, fonts, spacing, radii — lifted from design/
│   │   └── courses.ts                # Shared course name/id map — matches seeded DB values
│   │
│   └── utils/
│       ├── file.ts                   # File type detection, size formatting
│       └── string.ts                 # initials(), truncate(), slugify()
│
├── supabase/
│   └── schema.sql                    # Full DB schema: tables, RLS, indexes, seed data
│
├── design/                           # Static reference files (unchanged)
├── writeup.md                        # Hackathon writeup
├── impl-plan.md                      # This file
├── app.json                          # Expo config
└── package.json
```

---

## Database Schema (Supabase Postgres)

### Tables

```sql
CREATE EXTENSION IF NOT EXISTS citext;

-- Shared course catalog — prevents free-text drift between profiles.course and events.target_courses
CREATE TABLE courses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE
);

-- Allowlisted officials — matched by email via auth.jwt(), not by a pre-guessed UUID
CREATE TABLE officials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       citext NOT NULL UNIQUE,
  name        text NOT NULL,
  added_at    timestamptz DEFAULT now()
);

-- Extends auth.users
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  course_id   uuid REFERENCES courses(id) NOT NULL,
  year        text NOT NULL,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- RLS: user can read/update own profile; anonymous sign-in creates one

CREATE TABLE units (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE student_units (
  student_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  unit_id     uuid REFERENCES units(id) ON DELETE CASCADE,
  joined_at   timestamptz DEFAULT now(),
  PRIMARY KEY (student_id, unit_id)
);

CREATE TABLE rooms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id     uuid REFERENCES units(id) ON DELETE CASCADE NOT NULL,
  join_code   text NOT NULL UNIQUE,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE room_members (
  room_id     uuid REFERENCES rooms(id) ON DELETE CASCADE,
  student_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role        text DEFAULT 'member' CHECK (role IN ('member', 'owner')),
  joined_at   timestamptz DEFAULT now(),
  PRIMARY KEY (room_id, student_id)
);

CREATE TABLE room_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id   uuid REFERENCES profiles(id),
  sender_name text NOT NULL,
  text        text NOT NULL,
  created_at  timestamptz DEFAULT now()
);
-- Realtime: enable replication on room_messages

CREATE TABLE files (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      uuid REFERENCES units(id) ON DELETE CASCADE NOT NULL,
  room_id      uuid REFERENCES rooms(id) ON DELETE CASCADE,
  uploaded_by  uuid REFERENCES profiles(id),
  name         text NOT NULL,
  topic        text NOT NULL,
  type         text CHECK (type IN ('pdf', 'img')),
  size         text,
  storage_path text NOT NULL,
  created_at   timestamptz DEFAULT now()
);
-- If room_id IS NULL => personal file; if room_id IS NOT NULL => shared room file

CREATE TABLE events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  date              date NOT NULL,
  location          text,
  target_course_ids uuid[] NOT NULL DEFAULT '{}',
  is_campus_wide    boolean DEFAULT false,
  published_by      text,              -- official's email (not a FK — officials have no profiles row)
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE saved_events (
  student_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id    uuid REFERENCES events(id) ON DELETE CASCADE,
  saved_at    timestamptz DEFAULT now(),
  PRIMARY KEY (student_id, event_id)
);

CREATE TABLE class_schedule (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id     uuid REFERENCES units(id) ON DELETE CASCADE NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  location    text,
  source      text DEFAULT 'manual' CHECK (source IN ('manual', 'gemma_extracted')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (unit_id, day_of_week, start_time, end_time)
);

CREATE TABLE tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id     uuid REFERENCES units(id) ON DELETE CASCADE,
  title       text NOT NULL,
  due_date    timestamptz,
  done        boolean DEFAULT false,
  source      text DEFAULT 'manual' CHECK (source IN ('manual', 'gemma_extracted')),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE hub_documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  size         text,
  storage_path text NOT NULL,
  added_by     text,                  -- official's email
  added_at     timestamptz DEFAULT now()
);

CREATE TABLE hub_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid REFERENCES profiles(id),
  query       text NOT NULL,
  response    text NOT NULL,
  sources     jsonb,
  created_at  timestamptz DEFAULT now()
);
```

### Storage Buckets

Single unified bucket (`kiini-files`) with path convention `{namespace}/{owner_id}/{unit_id}/`.

| Path pattern | What it stores |
|---|---|
| `personal/{student_id}/{unit_id}/` | Personal files owned by student |
| `room/{room_id}/` | Files shared in a room |
| `hub/{admin_id}/` | School-wide Info Hub documents |

**Share/Save mechanics:** "Share to room" and "Save to my unit" physically copy the storage object to the target path using Supabase Storage's built-in `.copy()` (server-side copy), then insert a new row in the `files` table pointing to the new copy. This avoids cross-bucket RLS complexity and doesn't round-trip file bytes through the device.

### RLS Policies

Every table needs `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` — without it, policies are silently ignored and the table stays open to anyone with the anon key.

```sql
-- ═══════════════════════════════════════════════════════
-- SECURITY DEFINER helper: membership check (bypasses RLS to avoid recursion)
-- ═══════════════════════════════════════════════════════
-- All policies that need to check room membership use this function instead
-- of subquerying room_members directly — that would cause infinite recursion
-- since room_members' own RLS policy would fire on the subquery.

CREATE OR REPLACE FUNCTION public.is_room_member(check_room_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_members.room_id = is_room_member.check_room_id
      AND room_members.student_id = auth.uid()
  );
END;
$$;

-- ═══════════════════════════════════════════════════════
-- RPC: join a room by its code (bypasses RLS so non-members can look up the room)
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.join_room_by_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room public.rooms;
BEGIN
  SELECT * INTO v_room FROM public.rooms WHERE rooms.join_code = upper(p_code);
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Room not found');
  END IF;
  INSERT INTO public.room_members (room_id, student_id)
  VALUES (v_room.id, auth.uid())
  ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('ok', true, 'room_id', v_room.id, 'unit_id', v_room.unit_id);
END;
$$;

-- ═══════════════════════════════════════════════════════
-- RPC: create a room (atomic — insert room + owner row, return generated id)
-- ═══════════════════════════════════════════════════════
-- Can't do two raw client inserts because rooms_select blocks reading the row
-- before the creator is in room_members.

CREATE OR REPLACE FUNCTION public.create_room(p_unit_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id uuid;
  v_code    text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM student_units WHERE unit_id = p_unit_id AND student_id = auth.uid()) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not in this unit');
  END IF;
  v_code := upper(substr(md5(random()::text), 1, 6));
  INSERT INTO rooms (unit_id, join_code) VALUES (p_unit_id, v_code) RETURNING id INTO v_room_id;
  INSERT INTO room_members (room_id, student_id, role) VALUES (v_room_id, auth.uid(), 'owner');
  RETURN jsonb_build_object('ok', true, 'room_id', v_room_id, 'join_code', v_code);
END;
$$;

-- ── courses ────────────────────────────────────────
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_select" ON courses FOR SELECT USING (true);

-- ── officials ─────────────────────────────────────
ALTER TABLE officials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "officials_select_self" ON officials
  FOR SELECT USING (email = (auth.jwt() ->> 'email')::citext);

-- ── profiles ──────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- ── units ─────────────────────────────────────────
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "units_select" ON units FOR SELECT USING (true);

-- ── student_units ─────────────────────────────────
ALTER TABLE student_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_units_own" ON student_units
  FOR ALL USING (auth.uid() = student_id);

-- ── rooms ─────────────────────────────────────────
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
-- Membership-gated: only members can see the room. Join-by-code uses the RPC above.
CREATE POLICY "rooms_select" ON rooms
  FOR SELECT USING (public.is_room_member(id));
-- No INSERT policy — only the SECURITY DEFINER create_room() RPC may create rooms

-- ── room_members ──────────────────────────────────
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
-- Uses the SECURITY DEFINER helper so the subquery doesn't recurse into itself
CREATE POLICY "room_members_select" ON room_members
  FOR SELECT USING (public.is_room_member(room_id));
CREATE POLICY "room_members_insert" ON room_members
  FOR INSERT WITH CHECK (student_id = auth.uid() AND role = 'member');

-- ── room_messages ─────────────────────────────────
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "room_messages_select" ON room_messages
  FOR SELECT USING (public.is_room_member(room_id));
CREATE POLICY "room_messages_insert" ON room_messages
  FOR INSERT WITH CHECK (public.is_room_member(room_id));

-- ── files ─────────────────────────────────────────
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "files_select" ON files
  FOR SELECT USING (
    (room_id IS NULL AND uploaded_by = auth.uid())
    OR
    (room_id IS NOT NULL AND public.is_room_member(room_id))
  );
CREATE POLICY "files_insert_personal" ON files
  FOR INSERT WITH CHECK (room_id IS NULL AND uploaded_by = auth.uid());
CREATE POLICY "files_insert_room" ON files
  FOR INSERT WITH CHECK (
    room_id IS NOT NULL AND public.is_room_member(room_id)
  );

-- ── events ────────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert_official" ON events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM officials WHERE email = (auth.jwt() ->> 'email')::citext)
  );

-- ── saved_events ──────────────────────────────────
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_events_own" ON saved_events
  FOR ALL USING (auth.uid() = student_id);

-- ── class_schedule ────────────────────────────────
ALTER TABLE class_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "class_schedule_select" ON class_schedule
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM student_units WHERE unit_id = class_schedule.unit_id AND student_id = auth.uid())
  );
CREATE POLICY "class_schedule_insert" ON class_schedule
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM student_units WHERE unit_id = class_schedule.unit_id AND student_id = auth.uid())
  );

-- ── tasks ─────────────────────────────────────────
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_own" ON tasks
  FOR ALL USING (auth.uid() = student_id);

-- ── hub_documents ─────────────────────────────────
ALTER TABLE hub_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hub_documents_select" ON hub_documents FOR SELECT USING (true);
CREATE POLICY "hub_documents_insert" ON hub_documents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM officials WHERE email = (auth.jwt() ->> 'email')::citext)
  );

-- ── hub_messages ──────────────────────────────────
ALTER TABLE hub_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hub_messages_own" ON hub_messages
  FOR ALL USING (auth.uid() = student_id);
```

**Note on officials gate:** The real security boundary is the RLS policy above, which checks `officials.email` against the JWT claim. The client-side redirect in Phase 9 is a UX convenience only — never trust it as a security gate.

### Storage RLS

Supabase Storage has its own RLS on `storage.objects`, separate from table-level RLS. Without these policies, all uploads are rejected.

```sql
-- Helper: extract path parts using Supabase's built-in storage functions
-- Path format: personal/{student_id}/...  |  room/{room_id}/...  |  hub/{admin_id}/...

-- Personal files: owner-only access
CREATE POLICY "storage_personal_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kiini-files'
    AND storage.foldername(name)[1] = 'personal'
    AND storage.foldername(name)[2] = auth.uid()::text
  );
CREATE POLICY "storage_personal_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kiini-files'
    AND storage.foldername(name)[1] = 'personal'
    AND storage.foldername(name)[2] = auth.uid()::text
  );
CREATE POLICY "storage_personal_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'kiini-files'
    AND storage.foldername(name)[1] = 'personal'
    AND storage.foldername(name)[2] = auth.uid()::text
  );

-- Room files: visible and writable by room members
CREATE POLICY "storage_room_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kiini-files'
    AND storage.foldername(name)[1] = 'room'
    AND public.is_room_member(storage.foldername(name)[2]::uuid)
  );
CREATE POLICY "storage_room_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kiini-files'
    AND storage.foldername(name)[1] = 'room'
    AND public.is_room_member(storage.foldername(name)[2]::uuid)
  );

-- Hub documents: world-readable, official-writable
CREATE POLICY "storage_hub_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kiini-files' AND storage.foldername(name)[1] = 'hub'
  );
CREATE POLICY "storage_hub_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kiini-files'
    AND storage.foldername(name)[1] = 'hub'
    AND EXISTS (SELECT 1 FROM officials WHERE email = (auth.jwt() ->> 'email')::citext)
  );
```

### Indexes

```sql
CREATE INDEX idx_files_unit_id           ON files (unit_id);
CREATE INDEX idx_files_room_id           ON files (room_id);
CREATE INDEX idx_room_messages_room_id   ON room_messages (room_id);
CREATE INDEX idx_events_target_courses   ON events USING gin (target_course_ids);
CREATE INDEX idx_class_schedule_unit_id  ON class_schedule (unit_id);
CREATE INDEX idx_tasks_student_id        ON tasks (student_id);
CREATE INDEX idx_hub_messages_student_id ON hub_messages (student_id);
```

### Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
```

Client subscribes to `room_messages` filtered by `room_id` via Supabase Realtime's channel API. The table's RLS policies (via `is_room_member()`) are enforced on realtime broadcasts — only room members receive new messages.

---

## Auth Flow

```
App launch
  |
  v
Check supabase.auth.getSession() (restored from localStorage)
  |
  +-- No session --→ signInAnonymously() --→ session with stable user ID
  |                                               |
  v                                               v
Session exists                             Check profiles table
  |                                               |
  v                                               +-- No row → redirect Onboarding
Check profiles table                              |
  |                                          Insert profile row → redirect Home
  +-- Profile exists --→ redirect Home
```

- Anonymous sessions persist in `localStorage` automatically (Supabase JS SDK)
- **Enable anonymous auth** in Supabase dashboard (Settings > Authentication > Providers > Anonymous — not on by default)
- Supabase recommends **invisible CAPTCHA or Cloudflare Turnstile** on anonymous sign-in to prevent endpoint abuse (scripted sign-ins bloat `auth.users`). Roadmap item for production; not needed for demo.
- Officials: separate button in Info Hub → `signInWithOtp({email})` → magic link → **check `officials` table** (email must be allowlisted) → admin console. Magic link alone does not grant admin access.
- RLS on every table uses `auth.uid()` to scope queries

---

## Implementation Phases

### Phase 1 — Scaffold
- `npx create-expo-app@latest kiini --template blank-typescript`
- Install all dependencies
- Set up `expo-router` with `app/` directory
- Create theme constants lifted from `design/css/style.css`
- Set up `src/lib/supabase.ts` with anon key
- Set up `src/lib/store.ts` base with Zustand

### Phase 2 — Auth + Database
- Run `schema.sql` in Supabase SQL editor
- Seed `courses` table (shared enum between profiles and events — prevents free-text drift)
- Seed `units` catalog (code + name pairs)
- Create Supabase storage buckets
- Implement `useAuth` hook (anonymous sign-in, profile upsert)
- Build session gate in `app/_layout.tsx` (if no profile → onboarding, else → tabs)

### Phase 3 — Onboarding
- Welcome screen with "Powered by Gemma 4" stamp
- Profile screen (name, course dropdown, year chips)
- Units screen (catalog chips, toggle selected)
- Room screen (optional code input, skip)
- On completion → upsert profile + `student_units` rows → navigate to tabs/home

### Phase 4 — Home Dashboard
- Hero band with greeting, course, university name
- Timetable cards (from `class_schedule` table, filtered to student's joined units via `student_units`, ordered by day and time)
- Reminders/task list with toggle-done
- Quick-access unit cards grid
- Bottom nav with active state

### Phase 5 — Units + Workspace
- Unit list screen (from `student_units` JOIN `units`)
- Unit workspace screen:
  - Hero with code/name/accent
  - Space toggle: My files / Shared with room
  - Topic filter chips
  - File list (from `files` table, filtered by unit_id and room_id nullable)
  - Upload zone → document picker → upload to Supabase Storage → call Gemma classify → insert file row
  - Share to room / Save from room actions

### Phase 6 — Rooms + Chat
- Rooms list (from `room_members` JOIN `rooms` JOIN `units`)
- Room detail screen with 3 tabs:
  - **Chat:** message list, Supabase Realtime subscription, chat input, quick prompts, @Gemma handling
  - **Files:** shared files list, save-to-personal action
  - **Members:** member list, room code display
- Create room flow (bottom sheet → call `create_room(unit_id)` RPC function → navigate to room)
- Join room flow (bottom sheet → enter code → call `join_room_by_code()` RPC function → navigate to room)

### Phase 7 — Events
- Events list from `events` table
- Filter: "For {course}" vs "All campus events" (an event is campus-wide when `is_campus_wide = true` or `target_course_ids = '{}'` — query checks both: `WHERE is_campus_wide OR course_id = ANY(target_course_ids)`)
- Save toggle → insert/delete `saved_events`
- Events ordered by date

### Phase 8 — Info Hub
- Hero with search bar
- Q&A interface: query → match against `hub_documents` (via Gemma or keyword) → store in `hub_messages`
- Suggested questions (from DB or seeded)
- Document list (from `hub_documents`)
- "I'm a university official →" link to admin sign-in

### Phase 9 — Admin Console
- Magic link sign in (`signInWithOtp`)
- **Gate check:** after magic link, verify email exists in `officials` table before granting admin access
- Post event form (title, date, location, target course — selected from `courses` table)
- Manage Info Hub: upload document → Supabase Storage → insert `hub_documents` row
- View posted events this session

### Phase 10 — Gemma Integration
- `src/lib/gemma.ts` — typed API wrapper with:
  - `classifyDocument(file)` → { topic, type, suggestedFilename }
  - `extractFromDocument(file)` → { deadlines?, events?, keyFacts? }
  - `answerQuestion(roomId, question, context)` → answer string
  - `answerHubQuestion(query, documents)` → answer + sources
- Function calling schemas for structured output
- **Dedup on extraction:** use `ON CONFLICT (unit_id, day_of_week, start_time, end_time) DO NOTHING` when inserting into `class_schedule` — prevents duplicate rows when multiple students upload the same timetable PDF
- Typing indicator simulation while awaiting response

---

## Key Design Decisions

1. **No server proxy for Gemma in v1** — client calls Gemma directly with key in bundle. Acceptable for demo. Hardening step for production: move behind Supabase Edge Function.
2. **Zustand over Context** — simpler for cross-screen state (current unit, current room, typing indicator) without prop drilling or provider nesting.
3. **`expo-router` file conventions** — use `(tabs)` for bottom nav, `[id]` for dynamic routes, `_layout.tsx` for shared layouts.
4. **Files table unifies personal + shared** — `room_id` column distinguishes them. `room_id IS NULL` = personal, `room_id IS NOT NULL` = room-shared. "Share" and "Save" actions physically copy the storage object to the target bucket path then insert a new `files` row — they don't just flip `room_id`.
5. **`class_schedule` is a real table** — recurring weekly classes (day, time, room) live here, populated by Gemma extraction from a timetable PDF. This is structurally different from one-off `tasks`/deadlines. At least one demo unit's schedule should come from a real PDF upload through the Gemma pipeline, not seeded data — that's the visible "wow" moment for judges.
6. **Theme tokens lifted from `design/css/style.css`** — every color, radius, font family, and spacing should match exactly.

---

## Dependencies

Run `npx expo install --fix` rather than hand-picking versions — Expo SDK 56 requires the New Architecture (mandatory since SDK 54) which changes peer deps for `react-native-reanimated` (v4+, with `react-native-worklets`) and other native libraries. The versions below are approximate starting points; `--fix` resolves exact compatible versions.

```json
{
  "expo": "~56",
  "expo-router": "~4",
  "expo-document-picker": "~13",
  "expo-image-picker": "~16",
  "@supabase/supabase-js": "^2",
  "zustand": "^5",
  "@gorhom/bottom-sheet": "^5",
  "react-native-reanimated": "~3",
  "react-native-safe-area-context": "~5",
  "react-native-screens": "~4"
}
```
