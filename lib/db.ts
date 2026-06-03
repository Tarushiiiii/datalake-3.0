// lib/db.ts
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("datalake.db");
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS attendance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        check_in_time TEXT NOT NULL,
        check_out_time TEXT,
        site_name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        is_synced INTEGER NOT NULL DEFAULT 0,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY NOT NULL,
        site_name TEXT NOT NULL,
        location TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        assigned_hours REAL NOT NULL DEFAULT 8,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_session (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  }

  return db;
}

export type AttendanceRow = {
  id: number;
  date: string;
  check_in_time: string;
  check_out_time: string | null;
  site_name: string;
  latitude: number | null;
  longitude: number | null;
  is_synced: number;
  sync_status: string;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  site_name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  assigned_hours: number;
  sync_status: string;
  created_at: string;
  updated_at: string;
};