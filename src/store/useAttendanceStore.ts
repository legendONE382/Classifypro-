import { create } from "zustand";

import type { AttendanceStatus, ClassroomStatus } from "../types/domain";

type AttendanceRecord = {
  id: string;
  teacherName: string;
  classroomName: string;
  status: AttendanceStatus;
  clockInTime: string;
};

type AttendanceState = {
  classrooms: ClassroomStatus[];
  logs: AttendanceRecord[];
  markClassroomStatus: (classroomId: string, status: ClassroomStatus["status"]) => void;
  addLog: (log: AttendanceRecord) => void;
};

const nowIso = () => new Date().toISOString();

export const useAttendanceStore = create<AttendanceState>((set) => ({
  classrooms: [
    {
      id: "class-1",
      classroomName: "JSS1 - Blue Room",
      teacherName: "Adaeze Okafor",
      periodLabel: "Period 1",
      status: "teaching",
      updatedAt: nowIso()
    },
    {
      id: "class-2",
      classroomName: "SS2 - Gold Room",
      teacherName: "Ibrahim Musa",
      periodLabel: "Period 1",
      status: "late",
      updatedAt: nowIso()
    },
    {
      id: "class-3",
      classroomName: "JSS3 - Green Room",
      teacherName: "Amina Bello",
      periodLabel: "Period 1",
      status: "empty",
      updatedAt: nowIso()
    }
  ],
  logs: [],
  markClassroomStatus: (classroomId, status) =>
    set((state) => ({
      classrooms: state.classrooms.map((classroom) => {
        if (classroom.id !== classroomId) {
          return classroom;
        }

        return {
          ...classroom,
          status,
          updatedAt: nowIso()
        };
      })
    })),
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs]
    }))
}));
