import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DayRecord {
  date: string; // ISO date "2026-05-31"
  checkInTime: string; // ISO datetime
  checkOutTime: string | null;
}

interface AttendanceState {
  records: DayRecord[];
  checkIn: () => void;
  checkOut: () => void;
  isMarkedToday: () => boolean;
  isCheckedInToday: () => boolean;
  weeklyCount: () => number;
  weeklyHours: () => number;
}

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function hoursBetween(start: string, end: string | null): number {
  if (!end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.round((diff / (1000 * 60 * 60)) * 10) / 10; // 1 decimal
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      records: [],

      checkIn: () => {
        const today = getTodayISO();
        // Always add a new record — supports multiple sites per day
        set((state) => ({
          records: [
            ...state.records,
            {
              date: today,
              checkInTime: new Date().toISOString(),
              checkOutTime: null,
            },
          ],
        }));
      },

      checkOut: () => {
        const today = getTodayISO();
        // Close only the latest open record for today
        const records = [...get().records];
        const lastOpenIndex = records
          .map((r, i) => ({ r, i }))
          .filter(({ r }) => r.date === today && !r.checkOutTime)
          .at(-1)?.i;

        if (lastOpenIndex === undefined) return;
        records[lastOpenIndex] = {
          ...records[lastOpenIndex],
          checkOutTime: new Date().toISOString(),
        };
        set({ records });
      },

      // Has at least one check-in today
      isMarkedToday: () => {
        return get().records.some((r) => r.date === getTodayISO());
      },

      // Has an open (not yet checked out) record today
      isCheckedInToday: () => {
        return get().records.some(
          (r) => r.date === getTodayISO() && !r.checkOutTime,
        );
      },

      // Count unique days with at least one check-in this week
      weeklyCount: () => {
        const weekDates = getWeekDates();
        const daysWithRecords = new Set(
          get()
            .records.filter((r) => weekDates.includes(r.date))
            .map((r) => r.date),
        );
        return daysWithRecords.size;
      },

      // Sum hours across all completed records this week
      weeklyHours: () => {
        const weekDates = getWeekDates();
        return get()
          .records.filter((r) => weekDates.includes(r.date))
          .reduce(
            (sum, r) => sum + hoursBetween(r.checkInTime, r.checkOutTime),
            0,
          );
      },
    }),
    {
      name: "attendance-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
