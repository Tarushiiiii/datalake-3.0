// store/projectStore.ts
import { create } from "zustand";
import { getDb } from "@/lib/db";
import { useAttendanceStore } from "@/store/attendanceStore";

export const WEEKLY_HOUR_LIMIT = 40;

export type ProjectStatus = "pending" | "in_progress" | "completed";

export interface Project {
  id: string;
  siteName: string;
  location: string;
  latitude?: number;
  longitude?: number;
  assignedHours: number;
  syncStatus: "synced" | "pending" | "error";
  createdAt: string;
  updatedAt: string;
}

export interface SessionSummary {
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  hours: number;
}

export interface ProjectWithDerived extends Project {
  completedHours: number;
  progressPercent: number;
  remainingHours: number;
  status: ProjectStatus;
  sessions: SessionSummary[];
}

function computeStatus(completed: number, assigned: number): ProjectStatus {
  if (completed === 0) return "pending";
  if (completed >= assigned) return "completed";
  return "in_progress";
}

interface ProjectStore {
  projects: Project[];
  isReady: boolean;

  init: () => Promise<void>;
  upsertProjectFromAttendance: (payload: {
    siteName: string;
    location: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<void>;

  setAssignedHours: (id: string, hours: number) => Promise<string | null>;
  getAllProjectsWithDerived: () => ProjectWithDerived[];
  getWeeklySummary: () => {
    totalCompletedHours: number;
    totalAssignedHours: number;
    totalRemainingHours: number;
    overallProgressPercent: number;
    availableWeeklyHours: number;
    weeklyLimitReached: boolean;
  };
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  isReady: false,

  init: async () => {
    const db = await getDb();
    const rows = (await db.getAllAsync(`SELECT * FROM projects ORDER BY created_at DESC`)) as any[];

    set({
      projects: rows.map((p) => ({
        id: p.id,
        siteName: p.site_name,
        location: p.location,
        latitude: p.latitude,
        longitude: p.longitude,
        assignedHours: p.assigned_hours,
        syncStatus: p.sync_status,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
      isReady: true,
    });
  },

  upsertProjectFromAttendance: async (payload) => {
    const exists = get().projects.find((p) => p.siteName === payload.siteName);
    if (exists) return;

    const db = await getDb();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO projects
       (id, site_name, location, latitude, longitude, assigned_hours, sync_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `proj_${Date.now()}`,
        payload.siteName,
        payload.location,
        payload.latitude ?? null,
        payload.longitude ?? null,
        8,
        "pending",
        now,
        now,
      ],
    );

    await get().init();
  },

  setAssignedHours: async (id, hours) => {
    if (hours <= 0) return "Hours must be positive";
    if (hours > WEEKLY_HOUR_LIMIT) return "Exceeds weekly limit";

    const db = await getDb();
    const project = get().projects.find((p) => p.id === id);
    if (!project) return "Project not found";

    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE projects SET assigned_hours = ?, updated_at = ? WHERE id = ?`,
      [hours, now, id],
    );

    await get().init();
    return null;
  },

  getAllProjectsWithDerived: () => {
    const projects = get().projects;
    const attendanceRecords = useAttendanceStore.getState().records;

    return projects.map((project) => {
      const siteSessions = attendanceRecords
        .filter((r) => r.siteName === project.siteName)
        .map((r) => ({
          date: r.date,
          checkInTime: r.checkInTime,
          checkOutTime: r.checkOutTime,
          hours: r.checkOutTime
            ? Math.round(((new Date(r.checkOutTime).getTime() - new Date(r.checkInTime).getTime()) / 3600000) * 10) / 10
            : 0,
        }));

      const completedHours = siteSessions.reduce((sum, s) => sum + s.hours, 0);
      const roundedCompleted = Number(completedHours.toFixed(1));

      return {
        ...project,
        completedHours: roundedCompleted,
        sessions: siteSessions,
        progressPercent:
          project.assignedHours > 0
            ? Math.min(100, Math.round((roundedCompleted / project.assignedHours) * 100))
            : 0,
        remainingHours: Number(Math.max(0, project.assignedHours - roundedCompleted).toFixed(1)),
        status: computeStatus(roundedCompleted, project.assignedHours),
      };
    });
  },

  getWeeklySummary: () => {
    const derived = get().getAllProjectsWithDerived();
    const totalCompletedHours = derived.reduce((sum, p) => sum + p.completedHours, 0);
    const totalAssignedHours = derived.reduce((sum, p) => sum + p.assignedHours, 0);
    const totalRemainingHours = derived.reduce((sum, p) => sum + p.remainingHours, 0);

    return {
      totalCompletedHours: Math.round(totalCompletedHours * 10) / 10,
      totalAssignedHours,
      totalRemainingHours: Math.round(totalRemainingHours * 10) / 10,
      overallProgressPercent:
        totalAssignedHours > 0 ? Math.round((totalCompletedHours / totalAssignedHours) * 100) : 0,
      availableWeeklyHours: Math.round((WEEKLY_HOUR_LIMIT - totalCompletedHours) * 10) / 10,
      weeklyLimitReached: totalCompletedHours >= WEEKLY_HOUR_LIMIT,
    };
  },
}));