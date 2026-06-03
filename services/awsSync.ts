// services/awsSync.ts
import { getDb } from "@/lib/db";
import { AWS_CONFIG } from "./config";
import { useAttendanceStore } from "@/store/attendanceStore";
const API_BASE = AWS_CONFIG.API_BASE_URL;
type AttendancePayload = {
  id: number;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  siteName: string;
  latitude: number | null;
  longitude: number | null;
};

export async function syncPendingAttendance() {
  const db = await getDb();

  const pending = (await db.getAllAsync(
    `SELECT * FROM attendance_records WHERE is_synced = 0 ORDER BY check_in_time ASC`,
  )) as any[];

  for (const row of pending) {
    const payload: AttendancePayload = {
      id: row.id,
      date: row.date,
      checkInTime: row.check_in_time,
      checkOutTime: row.check_out_time,
      siteName: row.site_name,
      latitude: row.latitude,
      longitude: row.longitude,
    };
    console.log("SYNCING RECORD:", payload);

    const res = await fetch(`${API_BASE}/attendance/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    console.log("AWS RESPONSE:", data);

    if (!res.ok) {
      throw new Error(`Sync failed for attendance id ${row.id}`);
    }

    const now = new Date().toISOString();
    await db.runAsync(
  `UPDATE attendance_records
   SET is_synced = 1,
       sync_status = 'synced',
       updated_at = ?
   WHERE id = ?`,
  [now, row.id],
);


  }
  await useAttendanceStore.getState().init();
}