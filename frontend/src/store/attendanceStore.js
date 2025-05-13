import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, subDays } from "date-fns";

const MOCK_EMPLOYEE_NAMES_FOR_ATTENDANCE = ["Alice Wonderland", "Bob The Builder", "Charlie Chaplin", "Admin User", "Diana Prince", "Edward Scissorhands", "Priya Sharma", "Rohan Mehra"];

// Helper to generate a default empty record for the new structure
const createDefaultAttendanceRecord = () => ({
  status: null, // Present, Absent, Leave, Holiday
  notes: "",
  checkInTimeCategory: null, // "Before 9:30 AM", "9:30 AM - 10:30 AM", "After 10:30 AM"
  workLocation: null, // "Office", "HomeWithPermission", "HomeWithoutPermission"
  userCoordinates: null, // { latitude: number, longitude: number } // For check-in
  checkOutTimeCategory: null, // "Before 6:00 PM", "6:00 PM - 7:00 PM", "After 7:00 PM"
  checkOutCoordinates: null, // { latitude: number, longitude: number } // For check-out
});


const generateUserAttendance = (userName) => {
    const records = {};
    const today = new Date();
    
    // Default record for today (will be overwritten by morning check-in if applicable)
    // records[format(today, "yyyy-MM-dd")] = createDefaultAttendanceRecord();

    if (userName === "Priya Sharma") {
        records[format(subDays(today, 1), "yyyy-MM-dd")] = { 
            status: "Present", 
            notes: "Full day work",
            checkInTimeCategory: "Before 9:30 AM",
            workLocation: "Office",
            userCoordinates: { latitude: 12.9345, longitude: 77.5968 }, // Example PVL coords
            checkOutTimeCategory: "6:00 PM - 7:00 PM",
            checkOutCoordinates: { latitude: 12.9346, longitude: 77.5969 }, // Slightly different for demo
        };
        records[format(subDays(today, 2), "yyyy-MM-dd")] = { 
            status: "Leave", 
            notes: "Personal leave",
            checkInTimeCategory: null,
            workLocation: null,
            userCoordinates: null,
            checkOutTimeCategory: null,
            checkOutCoordinates: null,
        };
    } else if (userName === "Rohan Mehra") {
        records[format(subDays(today, 1), "yyyy-MM-dd")] = { 
            status: "Present", 
            notes: "WFH",
            checkInTimeCategory: "9:30 AM - 10:30 AM",
            workLocation: "HomeWithPermission",
            userCoordinates: { latitude: 12.9716, longitude: 77.5946 }, // Example Bangalore coords
            checkOutTimeCategory: "After 7:00 PM",
            checkOutCoordinates: { latitude: 12.9717, longitude: 77.5947 },
        };
    }
    records["2024-07-04"] = { // Example Holiday
        status: "Holiday", 
        notes: "Independence Day",
        checkInTimeCategory: null, workLocation: null, userCoordinates: null, checkOutTimeCategory: null, checkOutCoordinates: null,
    };
    if (userName === "Admin User") {
         records[format(subDays(today, 1), "yyyy-MM-dd")] = { 
            status: "Present", notes: "Admin present yesterday.",
            checkInTimeCategory: "Before 9:30 AM", workLocation: "Office", userCoordinates: null, checkOutTimeCategory: "6:00 PM - 7:00 PM", checkOutCoordinates: null,
        };
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
      allUsersAttendance: initialAllUsersAttendanceDataMock,
      _initializeAttendance: () => {
         if (Object.keys(get().allUsersAttendance).length === 0) {
           set({ allUsersAttendance: initialAllUsersAttendanceDataMock });
         }
      },
      // Universal save function - can save any part of the attendance record
      saveAttendance: (userName, date, attendanceData) =>
        set((state) => {
          const dateString = format(date, "yyyy-MM-dd");
          const userRecords = state.allUsersAttendance[userName] || {};
          const existingRecord = userRecords[dateString] || createDefaultAttendanceRecord();
          
          const updatedRecord = { ...existingRecord, ...attendanceData };

          // If status is not 'Present', clear out present-specific fields
          if (updatedRecord.status !== "Present") {
            updatedRecord.checkInTimeCategory = null;
            updatedRecord.workLocation = null;
            updatedRecord.userCoordinates = null; // check-in coords
            updatedRecord.checkOutTimeCategory = null;
            updatedRecord.checkOutCoordinates = null; // check-out coords
          }
          
          return {
            allUsersAttendance: {
              ...state.allUsersAttendance,
              [userName]: {
                ...userRecords,
                [dateString]: updatedRecord,
              },
            },
          };
        }),
      // Specific action for morning check-in
      markMorningCheckIn: (userName, date, { checkInTimeCategory, workLocation, userCoordinates, status, notes }) => {
        const attendanceData = {
          status: status || "Present", 
          checkInTimeCategory,
          workLocation,
          userCoordinates, // check-in coordinates
          notes: notes || (status === "Leave" ? "Marked as Leave" : "Checked in"),
          checkOutTimeCategory: null, // Ensure checkout is null on check-in
          checkOutCoordinates: null, // Ensure checkout coordinates are null on check-in
        };
        get().saveAttendance(userName, date, attendanceData);
      },

      markEveningCheckout: (userName, date, { checkOutTimeCategory, notes, userCoordinates /* this is now checkOutCoordinates */ }) => {
        const dateString = format(date, "yyyy-MM-dd");
        const userRecords = get().allUsersAttendance[userName] || {};
        const existingRecord = userRecords[dateString] || createDefaultAttendanceRecord();

        if (existingRecord.status !== "Present" || !existingRecord.checkInTimeCategory) {
            console.warn("Cannot mark checkout for non-present status or no check-in found.");
            // Optionally, you could still save the checkout attempt notes or coordinates if needed.
            // For now, we prevent full checkout marking if no valid check-in.
            // You might want to toast a message to the user here.
            return; 
        }

        const attendanceData = {
            checkOutTimeCategory,
            notes: notes || existingRecord.notes || "Checked out", 
            checkOutCoordinates: userCoordinates, // Store captured coords as checkOutCoordinates
        };
        // Note: saveAttendance will merge this with the existing record for the day.
        get().saveAttendance(userName, date, attendanceData);
      },

      getAttendanceForUserAndDate: (userName, date) => {
        const dateString = format(date, "yyyy-MM-dd");
        return get().allUsersAttendance[userName]?.[dateString] || null;
      },
      
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
           if (state) {
             state.allUsersAttendance = initialAllUsersAttendanceDataMock;
           }
        }
      }
    }
  )
);