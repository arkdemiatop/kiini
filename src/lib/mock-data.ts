export const MOCK = {
  university: {
    name: 'Embu University',
    shortName: 'EMBU',
  },

  years: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],

  catalogUnits: [
    { code: 'CIT 301', name: 'Database Systems' },
    { code: 'CIT 305', name: 'Operating Systems' },
    { code: 'CIT 310', name: 'Software Engineering' },
    { code: 'CIT 314', name: 'Computer Networks' },
    { code: 'MAT 202', name: 'Discrete Mathematics' },
    { code: 'BBM 210', name: 'Principles of Marketing' },
    { code: 'BBM 214', name: 'Financial Accounting II' },
    { code: 'LLB 208', name: 'Law of Contract' },
  ],

  units: [
    {
      id: 'u1', code: 'CIT 301', name: 'Database Systems',
      color: '#4C6B57',
      topics: ['Normalization', 'SQL & Queries', 'Transactions', 'Past Papers'],
      hasRoom: true, roomId: 'r1',
    },
    {
      id: 'u2', code: 'CIT 310', name: 'Software Engineering',
      color: '#3D4E82',
      topics: ['Requirements', 'Agile & Scrum', 'UML Diagrams', 'Past Papers'],
      hasRoom: true, roomId: 'r2',
    },
    {
      id: 'u3', code: 'MAT 202', name: 'Discrete Mathematics',
      color: '#C7842A',
      topics: ['Set Theory', 'Graph Theory', 'Past Papers'],
      hasRoom: false, roomId: null,
    },
  ],

  personalFiles: {
    u1: [
      { id: 'f1', name: '3NF & BCNF — condensed notes.pdf', topic: 'Normalization', type: 'pdf' as const, size: '412 KB', uploaded: '2 days ago' },
      { id: 'f2', name: 'Whiteboard — join queries (photo).jpg', topic: 'SQL & Queries', type: 'img' as const, size: '1.1 MB', uploaded: '5 days ago' },
      { id: 'f3', name: 'CAT 1 2024 past paper.pdf', topic: 'Past Papers', type: 'pdf' as const, size: '220 KB', uploaded: '1 week ago' },
    ],
    u2: [
      { id: 'f4', name: 'Sprint planning slides — Week 4.pdf', topic: 'Agile & Scrum', type: 'pdf' as const, size: '980 KB', uploaded: '3 days ago' },
    ],
    u3: [],
  },

  roomFiles: {
    r1: [
      { id: 'rf1', name: 'Lecturer handout — ER diagrams.pdf', topic: 'Normalization', type: 'pdf' as const, size: '640 KB', uploaded: '4 days ago', uploader: 'Wanjiru K.' },
      { id: 'rf2', name: '2023 End of Sem past paper.pdf', topic: 'Past Papers', type: 'pdf' as const, size: '310 KB', uploaded: '1 week ago', uploader: 'Otieno M.' },
      { id: 'rf3', name: 'Transactions & locking — scan.jpg', topic: 'Transactions', type: 'img' as const, size: '1.4 MB', uploaded: '2 weeks ago', uploader: 'You' },
    ],
    r2: [
      { id: 'rf4', name: 'UML cheat sheet.pdf', topic: 'UML Diagrams', type: 'pdf' as const, size: '220 KB', uploaded: '6 days ago', uploader: 'Achieng P.' },
    ],
  },

  rooms: {
    r1: {
      id: 'r1', unitId: 'u1', code: 'CIT301-9F2K',
      members: [
        { name: 'You', role: 'Member', avatar: '#4C6B57' },
        { name: 'Wanjiru K.', role: 'Member', avatar: '#3D4E82' },
        { name: 'Otieno M.', role: 'Member', avatar: '#B34A3C' },
        { name: 'Achieng P.', role: 'Member', avatar: '#C7842A' },
        { name: 'Kimani J.', role: 'Member', avatar: '#6B4C7A' },
      ],
      chat: [
        { from: 'system', text: 'Wanjiru K. shared a file: Lecturer handout — ER diagrams.pdf' },
        { from: 'Wanjiru K.', avatar: '#3D4E82', text: 'guys is the CAT on Thursday still happening? I heard it might move' },
        { from: 'Otieno M.', avatar: '#B34A3C', text: 'as far as I know yes, nothing on the notice board about moving it' },
        { from: 'me', text: '@Gemma what topics are covered in the CAT 1 2024 past paper?' },
      ],
    },
    r2: {
      id: 'r2', unitId: 'u2', code: 'CIT310-7QAL',
      members: [
        { name: 'You', role: 'Member', avatar: '#4C6B57' },
        { name: 'Achieng P.', role: 'Member', avatar: '#C7842A' },
        { name: 'Mutua R.', role: 'Member', avatar: '#6B4C7A' },
      ],
      chat: [
        { from: 'Achieng P.', avatar: '#C7842A', text: 'uploaded the UML cheat sheet, check the shared files' },
        { from: 'me', text: 'thank you! saving it to my unit now' },
      ],
    },
  },

  gemmaChatReplies: [
    { match: ['cat 1', 'past paper', 'topics'], reply: 'The CAT 1 2024 past paper covers three areas: normalization up to 3NF (Q1), writing multi-table SQL joins (Q2), and one short question on transaction isolation levels (Q3). Want me to generate 5 practice questions from the same topics?' },
    { match: ['practice question', 'quiz', 'test me'], reply: 'Here are 3 practice questions from Normalization:\n1. Convert this table to 3NF: StudentID, CourseName, LecturerOffice.\n2. Explain why a table in 2NF might still have transitive dependencies.\n3. Give one real example of a partial dependency.\nReply \'more\' for another set.' },
    { match: ['explain', "don't understand", 'confused'], reply: 'Sure — think of normalization as tidying a shared notebook so no fact is written twice. 1NF removes repeating groups, 2NF removes partial dependencies, 3NF removes transitive dependencies.' },
    { match: ['deadline', 'due', 'when is'], reply: 'From the documents shared in this room, the Database Systems assignment on ER modelling is due Friday 24 July, 11:59 PM. I\'ve already added this to everyone\'s personal calendar.' },
  ],
  gemmaDefaultReply: 'I\'ve grounded this answer only in this unit\'s shared material. Could you tell me which topic or document you\'d like me to focus on?',

  tasks: [
    { id: 't1', unitCode: 'CIT 301', title: 'ER modelling assignment due', when: 'Fri, 24 Jul · 11:59 PM', done: false },
    { id: 't2', unitCode: 'CIT 310', title: 'Sprint retrospective doc submission', when: 'Mon, 20 Jul · 5:00 PM', done: false },
    { id: 't3', unitCode: 'CIT 301', title: 'CAT 1 — Database Systems', when: 'Thu, 23 Jul · 9:00 AM', done: false },
    { id: 't4', unitCode: 'CIT 301', title: 'New doc shared in CIT 301 room', when: '2 hours ago', done: true },
  ],

  timetableToday: [
    { time: '8:00 – 10:00', unit: 'CIT 301', room: 'LT 4' },
    { time: '10:00 – 12:00', unit: 'MAT 202', room: 'Hall B' },
    { time: '2:00 – 4:00', unit: 'CIT 310', room: 'Lab 2' },
  ],

  events: [
    { id: 'e1', title: 'Inter-University Hackathon 2026 — Registration Opens', date: { d: '22', m: 'Jul' }, location: 'Innovation Hub, Main Campus', courses: ['BSc. Computer Science', 'BSc. Information Technology'], saved: true },
    { id: 'e2', title: 'Moot Court Practice Round — Contract Law', date: { d: '25', m: 'Jul' }, location: 'Law Faculty Moot Room', courses: ['Bachelor of Laws (LLB)'], saved: false },
    { id: 'e3', title: 'Career Fair — Banking & Finance Employers', date: { d: '29', m: 'Jul' }, location: 'Auditorium', courses: ['Bachelor of Commerce', 'BSc. Applied Statistics'], saved: false },
    { id: 'e4', title: 'Guild Elections — Campaign Day', date: { d: '1', m: 'Aug' }, location: 'Main Quad', courses: ['All courses'], saved: false },
    { id: 'e5', title: 'AgriTech Field Day — Soil Science Demonstration', date: { d: '3', m: 'Aug' }, location: 'Agriculture Farm', courses: ['BSc. Agricultural Economics'], saved: false },
  ],

  hubSuggestions: [
    'Where do I submit a fee waiver form?',
    'What are the library opening hours?',
    'How do I apply for a hostel room?',
    'Where is the finance office?',
    "What's the deadline for unit registration?",
  ],

  hubAnswers: [
    { match: ['fee waiver'], answer: 'Fee waiver forms are submitted at the Dean of Students\' office, Admin Block, Room 14.', sources: ['Student Handbook, p.22', 'Admin Office Directory'] },
    { match: ['library', 'opening hours'], answer: 'The main library is open Monday–Friday 8:00 AM–9:00 PM, and Saturday 9:00 AM–5:00 PM.', sources: ['University Timetable 2026', 'Library Notice — Term 2'] },
    { match: ['hostel', 'accommodation'], answer: 'Hostel applications open at the start of each semester through the Housing Office, Student Centre Ground Floor.', sources: ['Student Handbook, p.31'] },
    { match: ['finance office', 'finance'], answer: 'The Finance Office is in the Admin Block, Room 6, opposite the Registrar.', sources: ['Admin Office Directory'] },
    { match: ['unit registration', 'register'], answer: 'Unit registration closes on Friday, 31 July. Late registration is allowed for two more weeks with a penalty fee.', sources: ['University Timetable 2026', "Registrar's Circular — Term 2"] },
  ],
  hubDefaultAnswer: "I can only answer from documents the university has shared here. Try one of the suggested questions, or ask about offices, deadlines, or opening hours.",

  hubDocs: [
    { name: 'Student Handbook 2025/26.pdf', size: '3.2 MB', added: 'Term 1' },
    { name: 'University Master Timetable — Term 2.pdf', size: '1.1 MB', added: '2 weeks ago' },
    { name: 'Admin & Department Office Directory.pdf', size: '540 KB', added: 'Term 1' },
    { name: "Registrar's Circular — Term 2.pdf", size: '210 KB', added: '4 days ago' },
  ],
};
