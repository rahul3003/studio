
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, subDays, addDays } from "date-fns";

const MOCK_EMPLOYEE_NAMES_FOR_ATTENDANCE = ["Alice Wonderland", "Bob The Builder", "Charlie Chaplin", "Admin User", "Diana Prince", "Edward Scissorhands"];

const generateUserAttendance = (userName) => {
    const records = {};
    const today = new Date();
    if (userName === "Alice Wonderland") {
        records[format(subDays(today, 2), "yyyy-MM-dd")] = { status: "Present", notes: "Full day work" };
        records[format(subDays(today, 3), "yyyy-MM-dd")] = { status: "Absent", notes: "Sick leave" };
    } else if (userName === "Bob The Builder") {
        records[format(subDays(today, 1), "yyyy-MM-dd")] = { status: "Present", notes: "Morning session" };
    }
    records["2024-07-04"] = { status: "Holiday", notes: "Independence Day" }; // Example Holiday
    // Add a record for Admin User for testing
    if (userName === "Admin User") {
         records[format(today, "yyyy-MM-dd")] = { status: "Present", notes: "Admin present today." };
         records[format(subDays(today,1), "yyyy-MM-dd")] = { status: "Leave", notes: "Admin on leave yesterday." };
    }
    return records;
};

const initialAllUsersAttendanceDataMock = MOCK_EMPLOYEE_NAMES_FOR_ATTENDANCE.reduce((acc, name) => {
    acc[name] = generateUserAttendance(name);
    return acc;
}, {});


export const useAttendanceStore = create(
  persist(
    (set, get) => ({
      allUsersAttendance: initialAllUsersAttendanceDataMock, // Initialize with mock data directly
      _initializeAttendance: () => {
         if (Object.keys(get().allUsersAttendance).length === 0) {
           set({ allUsersAttendance: initialAllUsersAttendanceDataMock });
         }
      },
      saveAttendance: (userName, date, status, notes) =>
        set((state) => {
          const dateString = format(date, "yyyy-MM-dd");
          const userRecords = state.allUsersAttendance[userName] || {};
          return {
            allUsersAttendance: {
              ...state.allUsersAttendance,
              [userName]: {
                ...userRecords,
                [dateString]: { status, notes },
              },
            },
          };
        }),
      setAllUsersAttendance: (attendanceData) => set({ allUsersAttendance: attendanceData }),
    }),
    {
      name: 'attendance-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate attendance store", error);
          state.allUsersAttendance = initialAllUsersAttendanceDataMock;
        } else if (!state || !state.allUsersAttendance || Object.keys(state.allUsersAttendance).length === 0) {
           console.log("Rehydrating attendance store: store empty or invalid, using initial mock data.");
           if (state) { // If state exists but is empty/invalid
             state.allUsersAttendance = initialAllUsersAttendanceDataMock;
           }
        }
      }
    }
  )
);

// Redundant client-side initialization block removed.
