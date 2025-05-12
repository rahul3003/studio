
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialMockProfileData = {
  personal: {
    name: "Priya Sharma",
    phone: "+91 98765 43210",
    address: "Apt 101, Silicon Towers, Koramangala, Bengaluru, Karnataka 560034",
    companyEmail: "priya.sharma@pesuventurelabs.com",
    personalEmail: "priya.personal@example.com",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=priya.sharma",
    profilePhotoFileName: "",
    idProofFileName: "Aadhaar_PriyaSharma.pdf",
    addressProofFileName: "ElectricityBill_PriyaSharma.pdf",
    city: "Bengaluru"
  },
  secondaryData: {
    joiningDate: "2022-08-15",
    department: "Technology",
    currentPosition: "Senior Software Engineer",
    currentRemuneration: "₹ 9,52,000 p.a.",
    leaveBalance: { annual: 15, sick: 8, totalAnnual: 20, totalSick: 10 },
    managerName: "Rohan Mehra",
    managerDepartment: "Technology",
  },
  rewards: {
    pointsAvailable: 1250,
    pointsReceived: 500,
    pointsValue: "₹ 125.00",
    nominationHistory: [
      { id: 1, to: "Rohan Mehra", points: 100, date: "2024-06-15", approvedBy: "Priya Sharma", approvedOn: "2024-06-16", reason: "Excellent project management on HRMS portal." },
    ],
  },
  attendance: {
    summary: [
      { year: 2024, month: "July", present: 20, leaves: 1, sickLeaves: 0 },
      { year: 2024, month: "June", present: 22, leaves: 0, sickLeaves: 0 },
    ],
  },
  remuneration: {
    payChanges: [
      { effectiveDate: "2024-04-01", percentageIncrease: "12%", salaryPostIncrease: "₹ 9,52,000 p.a.", reason: "Annual Performance Review" },
    ],
    breakup: {
      annualSalary: "₹ 9,52,000",
      monthlyGrossSalary: "₹ 79,333",
      deductions: { providentFund: "₹ 2,500", professionalTax: "₹ 200", incomeTax: "₹ 5,500 (Approx. TDS)" },
      netMonthlySalary: "₹ 71,133 (Approx.)",
    },
  },
  reports: {
    ndaPath: "/documents/NDA_JohnDoe.pdf",
    form16Path: "/documents/Form16_JohnDoe_2023.pdf",
    digitalIdImage: "https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png", 
  },
  holidays: {
    companyHolidays: [ { date: "2024-01-01", name: "New Year's Day" } ],
    restrictedHolidays: [ { date: "2024-03-25", name: "Holi (RH)" } ]
  },
  companyName: "PESU Venture Labs"
};


export const useProfileStore = create(
  persist(
    (set, get) => ({
      profileData: initialMockProfileData, // Initialize with mock data
      
      // Action to update personal information
      updatePersonalInformation: (newData) =>
        set((state) => ({
          profileData: {
            ...state.profileData,
            personal: {
              ...state.profileData.personal,
              ...newData,
              profilePhotoUrl: newData.profilePhotoUrl || state.profileData.personal.profilePhotoUrl,
            },
          },
        })),

      // Action to add a leave application (mock update)
      applyLeave: (leaveData) =>
        set((state) => ({
          // This is a simplified update. In a real app, you'd manage leave records separately.
          // For now, we can just log it or update a 'lastLeaveApplied' field if needed.
          profileData: {
            ...state.profileData,
            attendance: {
                ...state.profileData.attendance,
                // Potentially update summary or add to a list of leave requests
                // For mock, let's assume a leave was taken in the current month for simplicity.
                summary: state.profileData.attendance.summary.map((s, i) => 
                    i === 0 ? {...s, leaves: (s.leaves || 0) + 1 } : s
                )
            }
          }
        })),

      // Action to add a reward nomination
      addNomination: (nominationData) =>
        set((state) => ({
          profileData: {
            ...state.profileData,
            rewards: {
              ...state.profileData.rewards,
              nominationHistory: [
                { 
                  id: Date.now(), // Simple ID for mock
                  ...nominationData 
                },
                ...state.profileData.rewards.nominationHistory,
              ],
            },
          },
        })),
      
      // Set full profile data (e.g., when user context changes)
      setProfileData: (newProfileData) => set({ profileData: newProfileData }),

       // Action to initialize profileData based on user details (e.g., email, name from authStore)
      initializeProfileForUser: (authUser) => {
        if (!authUser) {
          set({ profileData: initialMockProfileData }); // Reset to default if no authUser
          return;
        }
        // Create a user-specific profile based on the initial mock and authUser details
        const userSpecificProfile = {
          ...initialMockProfileData,
          personal: {
            ...initialMockProfileData.personal,
            name: authUser.name,
            companyEmail: authUser.email,
            profilePhotoUrl: authUser.avatar || initialMockProfileData.personal.profilePhotoUrl,
            phone: authUser.name === "Priya Sharma" ? "+91 98765 43210" : "+91 88888 77777", 
            address: authUser.name === "Priya Sharma" ? "Apt 101, Silicon Towers, Koramangala, Bengaluru, Karnataka 560034" : "B-45, Green Park, New Delhi 110016",
            city: authUser.name === "Priya Sharma" ? "Bengaluru" : "New Delhi",
          },
           secondaryData: {
            ...initialMockProfileData.secondaryData,
            currentPosition: authUser.currentRole?.name || "Employee",
            managerName: authUser.name === "Priya Sharma" ? "Rohan Mehra" : "Anita Singh",
          },
        };
        set({ profileData: userSpecificProfile });
      }
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state || !state.profileData || !state.profileData.personal || !state.profileData.personal.name) {
          console.log("Rehydrating profile store with initial mock data as it's empty or invalid.");
          state.profileData = initialMockProfileData;
        }
      }
    }
  )
);

if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('profile-storage');
    if (!storedData || !JSON.parse(storedData)?.state?.profileData?.personal?.name) {
      useProfileStore.setState({ profileData: initialMockProfileData });
    } else {
      // Persist middleware handles loading, this is more for explicit sync if needed
      useProfileStore.getState().setProfileData(JSON.parse(storedData).state.profileData);
    }
}

export const DUMMY_EMPLOYEE_LIST_FOR_NOMINATION = [
  { name: "Priya Sharma" }, { name: "Rohan Mehra" }, { name: "Aisha Khan" },
  { name: "Vikram Singh" }, { name: "Suresh Kumar" }, { name: "Sunita Reddy" },
];
