import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DayRecord {
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  siteName: string;
  isSynced: boolean;
}

interface AttendanceState {
  records: DayRecord[];
  currentSiteName: string | null;

  setCurrentSiteName: (name: string) => void;

  checkIn: () => void;
  checkOut: () => void;
  clearRecords: () => void;

  markAsSynced: (checkInTime: string) => void;

  isMarkedToday: () => boolean;
  isCheckedInToday: () => boolean;

  weeklyCount: () => number;
  weeklyHours: () => number;
}

// Single IST-aware date helper — used everywhere in this file
function getTodayISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function getWeekDates() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")!.value);
  const month = Number(parts.find((p) => p.type === "month")!.value) - 1;
  const day = Number(parts.find((p) => p.type === "day")!.value);

  const base = new Date(year, month, day);
  const dow = base.getDay();

  const monday = new Date(base);
  monday.setDate(base.getDate() - ((dow + 6) % 7));

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  });
}

export const hoursBetween = (start: string, end: string | null): number => {
  if (!end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
};

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      records: [],
      currentSiteName: null,

      setCurrentSiteName: (name: string) => set({ currentSiteName: name }),

      checkIn: () => {
        // Uses module-level getTodayISO — IST-aware, no duplicate
        const siteName = get().currentSiteName ?? "Unknown Site";
        set((state) => ({
          records: [
            ...state.records,
            {
              date: getTodayISO(),
              checkInTime: new Date().toISOString(),
              checkOutTime: null,
              siteName,
              isSynced: false,
            },
          ],
        }));
      },

      checkOut: () => {
        const today = getTodayISO();
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

      clearRecords: () => set({ records: [] }),

      markAsSynced: (checkInTime: string) => {
        set((state) => ({
          records: state.records.map((record) =>
            record.checkInTime === checkInTime
              ? { ...record, isSynced: true }
              : record,
          ),
        }));
      },

      isMarkedToday: () => get().records.some((r) => r.date === getTodayISO()),

      isCheckedInToday: () =>
        get().records.some((r) => r.date === getTodayISO() && !r.checkOutTime),

      weeklyCount: () => {
        const weekDates = getWeekDates();
        const daysWithRecords = new Set(
          get()
            .records.filter((r) => weekDates.includes(r.date))
            .map((r) => r.date),
        );
        return daysWithRecords.size;
      },

      weeklyHours: () => {
        const weekDates = getWeekDates();

        const total = get()
          .records.filter((r) => weekDates.includes(r.date))
          .reduce(
            (sum, r) => sum + hoursBetween(r.checkInTime, r.checkOutTime),
            0,
          );

        return Number(total.toFixed(2));
      },
    }),
    {
      name: "attendance-storage-v2",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
