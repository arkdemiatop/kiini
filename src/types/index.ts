import type { CourseId } from '@/constants/courses';

export interface Profile {
  id: string;
  name: string;
  course_id: CourseId;
  year: string;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface StudentUnit {
  student_id: string;
  unit_id: string;
  joined_at: string;
}

export interface Room {
  id: string;
  unit_id: string;
  join_code: string;
  created_at: string;
}

export interface RoomMember {
  room_id: string;
  student_id: string;
  role: 'member' | 'owner';
  joined_at: string;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  sender_id: string | null;
  sender_name: string;
  text: string;
  created_at: string;
}

export interface FileRecord {
  id: string;
  unit_id: string;
  room_id: string | null;
  uploaded_by: string | null;
  name: string;
  topic: string;
  type: 'pdf' | 'img';
  size: string;
  storage_path: string;
  created_at: string;
}

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  location: string | null;
  target_course_ids: string[];
  is_campus_wide: boolean;
  published_by: string | null;
  created_at: string;
}

export interface SavedEvent {
  student_id: string;
  event_id: string;
  saved_at: string;
}

export interface ClassSchedule {
  id: string;
  unit_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  source: 'manual' | 'gemma_extracted';
  created_at: string;
}

export interface Task {
  id: string;
  student_id: string;
  unit_id: string | null;
  title: string;
  due_date: string | null;
  done: boolean;
  source: 'manual' | 'gemma_extracted';
  created_at: string;
}

export interface HubDocument {
  id: string;
  name: string;
  size: string | null;
  storage_path: string;
  added_by: string | null;
  added_at: string;
}

export interface HubMessage {
  id: string;
  student_id: string | null;
  query: string;
  response: string;
  sources: Record<string, unknown> | null;
  created_at: string;
}
