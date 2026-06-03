// store/attendanceStore.ts
import { create } from "zustand";
import { getDb, type AttendanceRow } from "@/lib/db";

export interface DayRecord {
  id: number;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  siteName: string;
  latitude?: number | null;
  longitude?: number | null;
  isSynced: boolean;
  syncStatus: "pending" | "synced" | "error";
}

interface AttendanceState {
  records: DayRecord[];
  currentSiteName: string | null;
  currentLat: number | null;
  currentLng: number | null;
  isReady: boolean;

  init: () => Promise<void>;
  setCurrentSiteName: (name: string) => void;
  setCurrentLocation: (lat: number, lng: number) => void;

  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  clearRecords: () => Promise<void>;

  markAsSynced: (checkInTime: string) => Promise<void>;

  isMarkedToday: () => boolean;
  isCheckedInToday: () => boolean;
  weeklyCount: () => number;
  weeklyHours: () => number;
}

function getTodayISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function hoursBetween(start: string, end: string | null): number {
  if (!end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
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

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [],
  currentSiteName: null,
  currentLat: null,
  currentLng: null,
  isReady: false,

  init: async () => {
    const db = await getDb();
    const rows = (await db.getAllAsync(
      "SELECT * FROM attendance_records ORDER BY check_in_time DESC",
    )) as AttendanceRow[];

    set({
      records: rows.map((r) => ({
        id: r.id,
        date: r.date,
        checkInTime: r.check_in_time,
        checkOutTime: r.check_out_time,
        siteName: r.site_name,
        latitude: r.latitude,
        longitude: r.longitude,
        isSynced: r.is_synced === 1,
        syncStatus: r.sync_status as "pending" | "synced" | "error",
      })),
      isReady: true,
    });
  },

  setCurrentSiteName: (name) => set({ currentSiteName: name }),
  setCurrentLocation: (lat, lng) => set({ currentLat: lat, currentLng: lng }),

  checkIn: async () => {
    console.log("CHECKIN STARTED");
    const db = await getDb();
    console.log("DB OPENED");
    const now = new Date().toISOString();
    const siteName = get().currentSiteName ?? "Unknown Site";

    await db.runAsync(
      `INSERT INTO attendance_records
       (date, check_in_time, check_out_time, site_name, latitude, longitude, is_synced, sync_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        getTodayISO(),
        now,
        null,
        siteName,
        get().currentLat,
        get().currentLng,
        0,
        "pending",
        now,
        now,
      ],
    );
    console.log("INSERT SUCCESS");
    await get().init();
    console.log("STORE RELOADED");
  },

  checkOut: async () => {
    const db = await getDb();
    const today = getTodayISO();

    const latest = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM attendance_records
       WHERE date = ? AND check_out_time IS NULL
       ORDER BY check_in_time DESC
       LIMIT 1`,
      [today],
    );

    if (!latest) return;

    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE attendance_records
        SET check_out_time = ?,
            updated_at = ?,
            is_synced = 0,
            sync_status = 'pending'
        WHERE id = ?`,
      [now, now, latest.id],
    );

    await get().init();
  },

  clearRecords: async () => {
    const db = await getDb();
    await db.runAsync(`DELETE FROM attendance_records`);
    await get().init();
  },

  markAsSynced: async (checkInTime: string) => {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE attendance_records
       SET is_synced = 1, sync_status = 'synced', updated_at = ?
       WHERE check_in_time = ?`,
      [now, checkInTime],
    );

    await get().init();
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
      .reduce((sum, r) => sum + hoursBetween(r.checkInTime, r.checkOutTime), 0);
    return Number(total.toFixed(2));
  },
}));