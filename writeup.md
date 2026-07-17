# [App Name] — One School, One Brain, Every Student

**Subtitle:** An autonomous agent that turns a university's chaos of PDFs, timetables, and group chats into one shared, structured student workspace — powered by Gemma 4.

**Track:** The Autonomous Agent — Best use of Gemma 4's native function calling to build local AI agents that interact with external APIs.

**Team:** [names] · **Repo:** [public GitHub link] · **Live demo:** [hosted URL or clonable notebook link]

---

## 1. The Problem

University life runs on documents nobody has time to read properly: timetable PDFs buried in email, handbook rules scattered across departments, WhatsApp group chats where the actual deadline is message #47. Students don't need another app to check — they need the information to organize itself.

[App Name] does that: point it at a school's documents once, and every student at that school gets a shared, structured, always-current view of what matters — without anyone manually entering a single date.

## 2. What We Built

- **Unit rooms:** Every course unit (e.g. "CS301") is a shared room, joined via a short link/code — no accounts, no passwords. Everyone in a unit sees the same live, organized workspace for that unit specifically, which keeps Gemma's context small and its answers accurate.
- **Document intelligence — classify, rename, arrange:** Upload a PDF or an image (scanned notes, a photographed whiteboard, a past paper) to a unit room. Gemma 4's multimodal understanding classifies the document and its topic within the unit, generates a clean descriptive filename, and sorts it into the right topic folder — so a student opening a unit sees material organized by topic, not a flat file dump.
- **Structured extraction via function calling:** In parallel, Gemma emits structured output from ingested material — calendar events, deadlines, and short "key fact" cards — instead of leaving it as unstructured text.
- **Study chat & practice question generation:** Each unit room has a chat area grounded only in that unit's uploaded material. Students can ask study questions, request practice questions generated from a specific topic or past paper, or ask for a concept to be re-explained — a generative capability, not just retrieval.
- **University information hub:** A separate, school-wide area (not tied to any one unit) grounded in general documents — timetables, the student handbook, office/department directories — so Gemma can answer questions like "where do I submit a fee waiver form?" This is kept as its own knowledge domain, distinct from unit-level material, so unit chat answers stay narrowly grounded and accurate.
- **Thin student profile:** Name, course, and year, plus the list of unit rooms a student has joined. This isn't an account system — it's just enough to merge each unit's deadlines into one personal aggregated calendar, and to mark extracted tasks done/not done.
- **School-agnostic architecture:** The app is populated for [Embu University] for this build, but nothing about a unit room or the university info hub is school-specific — the same pipeline works for any school without a code change, only new documents.
- **Personal vs. unit room files:** Each student has their own personal document space per unit — files they've uploaded just for themselves. Separately, a unit room has its own shared document space, visible to everyone who's joined. A student can share a personal file into the room, or save a room file into their personal space; the two spaces are distinct, but moving between them is a single action.
- **Course-specific events:** An events area surfaces upcoming events filtered by course/program — e.g. a hackathon announcement reaches IT/CS students, a moot court date reaches Law students — rather than every student seeing every event.

## 3. Architecture

```
Client (Expo — Android, iOS, Web)
      │
      ├─ Supabase Auth
      │   ├─ Student: anonymous/session auth (no password)
      │   └─ University Official: email/magic-link auth
      │
      ├─ PDF / image upload → Supabase Storage
      │   ├─ bucket: personal/{student_id}/{unit_id}/...
      │   └─ bucket: rooms/{room_id}/...
      │
      ▼
Gemma 4 API — called directly from the client
   ├─ classify_document(type, topic)
   ├─ generate_filename()
   ├─ extract_event(...)
   └─ extract_key_fact(...)
      │
      ▼
Supabase Postgres
   ├─ units, rooms, room_members
   ├─ files (personal_space | room_space, topic-tagged)
   ├─ events (course/program-targeted)
   └─ extracted_facts, extracted_events
      │
      ├─ Supabase Realtime → live unit-room group chat
      │     (Gemma tagged in-chat → client calls Gemma directly →
      │      answer written to Postgres → pushed to all members)
      │
      ▼
Personal view: merges deadlines/tasks/events across every unit a student joined
```

**Why Supabase:** the app needs a relational schema (units, rooms, membership, personal vs. shared files, events), file storage, two auth tiers (anonymous students, authenticated officials), and live group chat — Supabase's Postgres, Storage, Auth, and Realtime cover all four without standing up separate services.

**Why the client calls Gemma directly:** for the scope and timeline of this build, we call the Gemma 4 API straight from the Expo client rather than proxying through a server function — one fewer moving part to build and deploy. The API key ships in the app bundle, which is an accepted tradeoff for a judged demo rather than a production release; moving the call behind a Supabase Edge Function (or any thin server) to keep the key server-side is the noted hardening step before any real-world deployment.

**Why Expo/React Native for Web:** the challenge explicitly allows web, Android, or iPhone delivery — Expo lets one codebase target all three, which matters more in a one-day sprint than picking a single native platform. We render the dashboard as a responsive web build for the demo and note the same code is installable as a native app via Expo Go/EAS.

**Why Gemma 4 specifically:** function calling turns unreliable free-text extraction into typed, validated output we can render directly — no regex, no brittle prompt-parsing. Multimodal understanding lets the same pipeline handle scanned or photographed materials, not just clean PDFs. Generation (practice questions, re-explaining a concept) goes beyond retrieval into genuine study support. Because Gemma is open-weight, the same pipeline can later run on-device for offline use in low-connectivity campus settings, which off-the-shelf closed APIs don't allow.

## 4. Challenges We Solved

[Fill in after building — be specific and honest. Examples to adapt:]
- Prompt/schema iteration to get consistent structured extraction from messy, inconsistently-formatted timetable PDFs.
- Handling documents that mix multiple document types (e.g. a handbook page containing both a policy and a deadline).
- Keeping the room-code sharing model simple without real auth while still feeling "multi-user" in the demo.

## 5. User Flows & Key Screens

**Roles:** Student (primary user, no login — name/course/year + local session) and University Official/Admin (a lightweight authenticated role that can post events and manage the university info hub).

**Flow 1 — Onboarding**
Student opens the app → enters name, course, year → adds their units → optionally joins a unit room via a shared link/code. No password; Supabase's anonymous auth creates a session tied to the device, so a returning student is recognized automatically.

**Flow 2 — Home Dashboard**
The first screen after onboarding. Shows: today's timetable (aggregated across all units and rooms), a notifications/reminders panel (upcoming deadlines, new documents shared in a room, new events matching their course), and quick-access cards into each unit workspace or room.

**Flow 3 — Unit Workspace (personal)**
Student taps a unit → sees their personal document library for that unit, organized into topic folders by Gemma. Upload button accepts PDF or image; Gemma classifies, renames, and files it automatically. A "Share to room" action moves a file into a joined room's shared space (if one exists for that unit).

**Flow 4 — Unit Room (shared)**
Student taps a joined room → sees the room's shared document library (including past papers), the list of members, and a group chat backed by Supabase Realtime, so messages appear live for everyone in the room. Inside the chat, any student can tag Gemma to ask a question or request practice questions — the client calls Gemma directly, and the answer is grounded only in that room's shared material and visible to everyone in the chat, not just the asker. A "Save to my unit" action pulls a room file into the student's personal space.

**Flow 5 — Events**
A feed of upcoming events filtered to the student's course/program (e.g. a hackathon reaches IT/CS, a moot court date reaches Law). Events here are posted by the University Official role, not by students. A student can save an event, which surfaces it on their Home Dashboard reminders.

**Flow 6 — University Info Hub**
A general chat/search area, separate from any unit, grounded in school-wide documents (timetables, handbook, office directory) uploaded by a University Official. Students ask questions like "where's the finance office?" and get answers grounded in those documents.

**Flow 7 — Official/Admin: Post an Event**
University Official logs in via Supabase email/magic-link auth (the one place real authentication is needed) → posts an event with a title, date, and target course/program(s) → it appears in Flow 5 for matching students. The same lightweight admin view manages the documents behind the University Info Hub.

**Screens needed:** Onboarding, Home Dashboard, Unit Workspace (personal), Unit Room (shared + chat), Events Feed, University Info Hub, Admin: Post Event / Manage Info Hub.

## 6. What's Live vs. Roadmap

Judges score functionality, not aspiration — this section is deliberately honest about scope.

**Live in this build:**
- Unit room creation/join via link or code
- PDF upload → Gemma 4 extraction → structured unit dashboard
- Gemma Q&A grounded in a unit's uploaded material
- Thin student profile aggregating deadlines/tasks across joined units, with done/not-done tracking
- One or more units populated end-to-end for [Embu University]

**Roadmap (architected for, not built in 13 hours):**
- Multi-school rollout (same pipeline, new rooms — no code change)
- Full admin/official authentication and event moderation
- Office/bureaucracy navigator and budget-planning features from the original concept
- On-device Gemma inference for offline use

## 7. Compliance Notes

- Submission consists of one (1) Kaggle Writeup, a public code repository, and a public live demo/clonable notebook, per the one-submission-per-team hackathon rule.
- No Competition Data was used; all inputs are our own sourced/sample documents.
- Winning submission code will be released under Apache 2.0, consistent with Gemma's open-weight licensing and the competition's Open Source winner license requirement.
- We can provide application execution logs / agent traces on request to validate Gemma 4 usage.

---

*Word count target: under 1,500 words per submission requirements — trim Sections 3–5 as needed once final implementation details are in.*
