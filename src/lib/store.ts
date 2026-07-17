import { create } from 'zustand';
import type { Profile, Unit, Room, RoomMessage, FileRecord, EventRecord, Task } from '@/types';

// ── Auth store ──────────────────────────────────────────────

interface StudentProfile {
  name: string;
  courseId: string;
  year: string;
  unitCodes: string[];
}

interface AuthState {
  session: unknown | null;
  profile: Profile | null;
  onboarded: boolean;
  studentProfile: StudentProfile | null;
  setSession: (session: unknown | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOnboarded: (v: boolean) => void;
  setStudentProfile: (p: StudentProfile | null) => void;
  updateUnitCodes: (codes: string[]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  onboarded: false,
  studentProfile: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setOnboarded: (onboarded) => set({ onboarded }),
  setStudentProfile: (studentProfile) => set({ studentProfile }),
  updateUnitCodes: (unitCodes) => set((s) => ({
    studentProfile: s.studentProfile ? { ...s.studentProfile, unitCodes } : null,
  })),
}));

// ── Unit store ──────────────────────────────────────────────

interface UnitState {
  units: Unit[];
  currentUnitId: string | null;
  unitSpace: 'personal' | 'room';
  topicFilter: string;
  personalFiles: Record<string, FileRecord[]>;
  processingUpload: { step: number; filename: string; unitId: string; topic: string } | null;
  setUnits: (units: Unit[]) => void;
  setCurrentUnitId: (id: string | null) => void;
  setUnitSpace: (space: 'personal' | 'room') => void;
  setTopicFilter: (topic: string) => void;
  setProcessingUpload: (p: UnitState['processingUpload']) => void;
}

export const useUnitStore = create<UnitState>((set) => ({
  units: [],
  currentUnitId: null,
  unitSpace: 'personal',
  topicFilter: 'All',
  personalFiles: {},
  processingUpload: null,
  setUnits: (units) => set({ units }),
  setCurrentUnitId: (currentUnitId) => set({ currentUnitId }),
  setUnitSpace: (unitSpace) => set({ unitSpace }),
  setTopicFilter: (topicFilter) => set({ topicFilter }),
  setProcessingUpload: (processingUpload) => set({ processingUpload }),
}));

// ── Room store ──────────────────────────────────────────────

interface RoomState {
  rooms: Room[];
  currentRoomId: string | null;
  roomTab: 'chat' | 'files' | 'members';
  messages: Record<string, RoomMessage[]>;
  roomFiles: Record<string, FileRecord[]>;
  gemmaTyping: Record<string, boolean>;
  chatDraft: string;
  setRooms: (rooms: Room[]) => void;
  setCurrentRoomId: (id: string | null) => void;
  setRoomTab: (tab: 'chat' | 'files' | 'members') => void;
  setMessages: (roomId: string, msgs: RoomMessage[]) => void;
  addMessage: (roomId: string, msg: RoomMessage) => void;
  setGemmaTyping: (roomId: string, v: boolean) => void;
  setChatDraft: (draft: string) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  currentRoomId: null,
  roomTab: 'chat',
  messages: {},
  roomFiles: {},
  gemmaTyping: {},
  chatDraft: '',
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoomId: (currentRoomId) => set({ currentRoomId }),
  setRoomTab: (roomTab) => set({ roomTab }),
  setMessages: (roomId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [roomId]: msgs } })),
  addMessage: (roomId, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: [...(s.messages[roomId] || []), msg],
      },
    })),
  setGemmaTyping: (roomId, v) =>
    set((s) => ({ gemmaTyping: { ...s.gemmaTyping, [roomId]: v } })),
  setChatDraft: (chatDraft) => set({ chatDraft }),
}));

// ── Hub store ───────────────────────────────────────────────

interface HubState {
  messages: Array<{ from: string; text: string; sources?: string[] }>;
  addMessage: (msg: HubState['messages'][0]) => void;
}

export const useHubStore = create<HubState>((set) => ({
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
}));
