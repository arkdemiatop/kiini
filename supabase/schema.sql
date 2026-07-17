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

CREATE TABLE events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  date              date NOT NULL,
  location          text,
  target_course_ids uuid[] NOT NULL DEFAULT '{}',
  is_campus_wide    boolean DEFAULT false,
  published_by      text,
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
  added_by     text,
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

-- ══════════════════════════════════════════════════════════════
-- SECURITY DEFINER helpers
-- ══════════════════════════════════════════════════════════════

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

-- ══════════════════════════════════════════════════════════════
-- RLS policies
-- ══════════════════════════════════════════════════════════════

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_select" ON courses FOR SELECT USING (true);

ALTER TABLE officials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "officials_select_self" ON officials
  FOR SELECT USING (email = (auth.jwt() ->> 'email')::citext);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "units_select" ON units FOR SELECT USING (true);

ALTER TABLE student_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_units_own" ON student_units
  FOR ALL USING (auth.uid() = student_id);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_select" ON rooms
  FOR SELECT USING (public.is_room_member(id));

ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "room_members_select" ON room_members
  FOR SELECT USING (public.is_room_member(room_id));
CREATE POLICY "room_members_insert" ON room_members
  FOR INSERT WITH CHECK (student_id = auth.uid() AND role = 'member');

ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "room_messages_select" ON room_messages
  FOR SELECT USING (public.is_room_member(room_id));
CREATE POLICY "room_messages_insert" ON room_messages
  FOR INSERT WITH CHECK (public.is_room_member(room_id));

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
  FOR INSERT WITH CHECK (room_id IS NOT NULL AND public.is_room_member(room_id));

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert_official" ON events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM officials WHERE email = (auth.jwt() ->> 'email')::citext)
  );

ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_events_own" ON saved_events
  FOR ALL USING (auth.uid() = student_id);

ALTER TABLE class_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "class_schedule_select" ON class_schedule
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM student_units WHERE unit_id = class_schedule.unit_id AND student_id = auth.uid())
  );
CREATE POLICY "class_schedule_insert" ON class_schedule
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM student_units WHERE unit_id = class_schedule.unit_id AND student_id = auth.uid())
  );

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_own" ON tasks
  FOR ALL USING (auth.uid() = student_id);

ALTER TABLE hub_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hub_documents_select" ON hub_documents FOR SELECT USING (true);
CREATE POLICY "hub_documents_insert" ON hub_documents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM officials WHERE email = (auth.jwt() ->> 'email')::citext)
  );

ALTER TABLE hub_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hub_messages_own" ON hub_messages
  FOR ALL USING (auth.uid() = student_id);

-- ══════════════════════════════════════════════════════════════
-- Storage RLS (on storage.objects)
-- ══════════════════════════════════════════════════════════════

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

-- ══════════════════════════════════════════════════════════════
-- Indexes
-- ══════════════════════════════════════════════════════════════

CREATE INDEX idx_files_unit_id           ON files (unit_id);
CREATE INDEX idx_files_room_id           ON files (room_id);
CREATE INDEX idx_room_messages_room_id   ON room_messages (room_id);
CREATE INDEX idx_events_target_courses   ON events USING gin (target_course_ids);
CREATE INDEX idx_class_schedule_unit_id  ON class_schedule (unit_id);
CREATE INDEX idx_tasks_student_id        ON tasks (student_id);
CREATE INDEX idx_hub_messages_student_id ON hub_messages (student_id);

-- ══════════════════════════════════════════════════════════════
-- Realtime
-- ══════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;

-- ══════════════════════════════════════════════════════════════
-- Seed data
-- ══════════════════════════════════════════════════════════════

INSERT INTO courses (id, name) VALUES
  ('course-cs', 'BSc. Computer Science'),
  ('course-it', 'BSc. Information Technology'),
  ('course-commerce', 'Bachelor of Commerce'),
  ('course-law', 'Bachelor of Laws (LLB)'),
  ('course-agri', 'BSc. Agricultural Economics'),
  ('course-stats', 'BSc. Applied Statistics')
ON CONFLICT DO NOTHING;

INSERT INTO units (id, code, name) VALUES
  ('u1', 'CIT 301', 'Database Systems'),
  ('u2', 'CIT 305', 'Operating Systems'),
  ('u3', 'CIT 310', 'Software Engineering'),
  ('u4', 'CIT 314', 'Computer Networks'),
  ('u5', 'MAT 202', 'Discrete Mathematics'),
  ('u6', 'BBM 210', 'Principles of Marketing'),
  ('u7', 'BBM 214', 'Financial Accounting II'),
  ('u8', 'LLB 208', 'Law of Contract')
ON CONFLICT DO NOTHING;
