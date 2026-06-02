import { useAttendanceStore } from "@/store/attendanceStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const WEEKLY_HOUR_LIMIT = 40;

export type ProjectStatus = "pending" | "in_progress" | "completed";
export type SyncStatus = "synced" | "pending_sync" | "error";

export interface Project {
  id: string;
  siteName: string;
  location: string;
  latitude?: number;
  longitude?: number;
  assignedHours: number; // target/planned hours (default 8, editable later)
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithDerived extends Project {
  completedHours: number; // sum of all attendance session hours for this site
  progressPercent: number;
  remainingHours: number;
  status: ProjectStatus;
  sessions: SessionSummary[]; // individual check-in/out entries for this site
}

export interface SessionSummary {
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  hours: number;
}

export interface WeeklySummary {
  totalCompletedHours: number;
  totalAssignedHours: number;
  totalRemainingHours: number;
  overallProgressPercent: number;
  availableWeeklyHours: number;
  weeklyLimitReached: boolean;
}

function hoursBetween(start: string, end: string | null): number {
  if (!end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
}

function computeStatus(completed: number, assigned: number): ProjectStatus {
  if (completed === 0) return "pending";
  if (completed >= assigned) return "completed";
  return "in_progress";
}

function deriveProject(
  project: Project,
  completedHours: number,
  sessions: SessionSummary[],
): ProjectWithDerived {
  const progressPercent =
    project.assignedHours > 0
      ? Math.min(
          100,
          Math.round((completedHours / project.assignedHours) * 100),
        )
      : 0;

  return {
    ...project,
    completedHours,
    sessions,
    progressPercent,
    remainingHours: Math.max(0, project.assignedHours - completedHours),
    status: computeStatus(completedHours, project.assignedHours),
  };
}

interface ProjectStore {
  projects: Project[];

  // Called on check-in if site doesn't exist yet
  upsertProjectFromAttendance: (payload: {
    siteName: string;
    location: string;
    latitude?: number;
    longitude?: number;
  }) => void;

  // Manually override assigned hours for a site (optional, admin use)
  setAssignedHours: (id: string, hours: number) => string | null;

  // Reads attendance store and derives all computed fields
  getAllProjectsWithDerived: () => ProjectWithDerived[];

  getWeeklySummary: () => WeeklySummary;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],

      upsertProjectFromAttendance: (payload) => {
        const exists = get().projects.find(
          (p) => p.siteName === payload.siteName,
        );
        if (exists) return; // already registered, hours derive automatically

        const timestamp = new Date().toISOString();
        set((state) => ({
          projects: [
            ...state.projects,
            {
              id: `proj_${Date.now()}`,
              siteName: payload.siteName,
              location: payload.location,
              latitude: payload.latitude,
              longitude: payload.longitude,
              assignedHours: 8,
              syncStatus: "pending_sync",
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ],
        }));
      },

      setAssignedHours: (id, hours) => {
        if (hours <= 0) return "Hours must be positive";
        if (hours > WEEKLY_HOUR_LIMIT) return "Exceeds weekly limit";

        const project = get().projects.find((p) => p.id === id);
        if (!project) return "Project not found";

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  assignedHours: hours,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        }));
        return null;
      },

      getAllProjectsWithDerived: () => {
        const projects = get().projects;
        const attendanceRecords = useAttendanceStore.getState().records;

        return projects.map((project) => {
          // All attendance sessions for this site
          const siteSessions = attendanceRecords.filter(
            (r) => r.siteName === project.siteName,
          );

          // Build per-session summary
          const sessions: SessionSummary[] = siteSessions.map((r) => ({
            date: r.date,
            checkInTime: r.checkInTime,
            checkOutTime: r.checkOutTime,
            hours: hoursBetween(r.checkInTime, r.checkOutTime),
          }));

          // Sum all completed (checked-out) hours for this site
          const completedHours = sessions.reduce((sum, s) => sum + s.hours, 0);

          return deriveProject(project, completedHours, sessions);
        });
      },

      getWeeklySummary: () => {
        const derived = get().getAllProjectsWithDerived();

        const totalCompletedHours = derived.reduce(
          (sum, p) => sum + p.completedHours,
          0,
        );
        const totalAssignedHours = derived.reduce(
          (sum, p) => sum + p.assignedHours,
          0,
        );
        const totalRemainingHours = derived.reduce(
          (sum, p) => sum + p.remainingHours,
          0,
        );

        return {
          totalCompletedHours: Math.round(totalCompletedHours * 10) / 10,
          totalAssignedHours,
          totalRemainingHours: Math.round(totalRemainingHours * 10) / 10,
          overallProgressPercent:
            totalAssignedHours > 0
              ? Math.round((totalCompletedHours / totalAssignedHours) * 100)
              : 0,
          availableWeeklyHours:
            Math.round((WEEKLY_HOUR_LIMIT - totalCompletedHours) * 10) / 10,
          weeklyLimitReached: totalCompletedHours >= WEEKLY_HOUR_LIMIT,
        };
      },
    }),
    {
      name: "project-storage-v2", // bumped version — old completedHours field removed
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
