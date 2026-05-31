import { create } from "zustand";

interface AttendanceState {
  isMarked: boolean;
  markAttendance: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  isMarked: false,
  markAttendance: () => set({ isMarked: true }),
}));
