export const COURSES = [
  { id: 'course-cs', name: 'BSc. Computer Science' },
  { id: 'course-it', name: 'BSc. Information Technology' },
  { id: 'course-commerce', name: 'Bachelor of Commerce' },
  { id: 'course-law', name: 'Bachelor of Laws (LLB)' },
  { id: 'course-agri', name: 'BSc. Agricultural Economics' },
  { id: 'course-stats', name: 'BSc. Applied Statistics' },
] as const;

export type CourseId = (typeof COURSES)[number]['id'];

export const COURSE_IDS = COURSES.map(c => c.id);
