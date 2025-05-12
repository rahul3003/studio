
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
    companyHolidays: [ 
        { date: "2024-01-01", name: "New Year's Day" },
        { date: "2024-01-26", name: "Republic Day" },
        { date: "2024-08-15", name: "Independence Day" },
        { date: "2024-10-02", name: "Gandhi Jayanti" },
        { date: "2024-12-25", name: "Christmas" },
    ],
    restrictedHolidays: [ 
        { date: "2024-03-25", name: "Holi (RH)" },
        { date: "2024-11-01", name: "Diwali (RH)" }
    ]
  },
  companyName: "PESU Venture Labs"
};


export const useProfileStore = create(
  persist(
    (set, get) => ({
      profileData: initialMockProfileData, 
      
      updatePersonalInformation: (newData) =>
        set((state) => {
          // Ensure all fields from newData are applied, including potentially empty strings for optional fields
          const updatedPersonal = {
            ...state.profileData.personal,
            ...newData,
            profilePhotoUrl: newData.profilePhotoUrl || state.profileData.personal.profilePhotoUrl, // Keep old if new is empty
          };
          return {
            profileData: {
              ...state.profileData,
              personal: updatedPersonal,
            },
          };
        }),

      applyLeave: (leaveData) =>
        set((state) => ({
          profileData: {
            ...state.profileData,
            attendance: {
                ...state.profileData.attendance,
                summary: state.profileData.attendance.summary.map((s, i) => 
                    i === 0 ? {...s, leaves: (s.leaves || 0) + 1 } : s
                )
            }
          }
        })),

      addNomination: (nominationData) =>
        set((state) => ({
          profileData: {
            ...state.profileData,
            rewards: {
              ...state.profileData.rewards,
              nominationHistory: [
                { 
                  id: Date.now(), 
                  ...nominationData 
                },
                ...state.profileData.rewards.nominationHistory,
              ],
            },
          },
        })),
      
      setProfileData: (newProfileData) => set({ profileData: newProfileData }),

      initializeProfileForUser: (authUser) => {
        if (!authUser) {
          set({ profileData: initialMockProfileData }); 
          return;
        }
        const userSpecificProfile = {
          ...initialMockProfileData, 
          personal: {
            ...initialMockProfileData.personal, 
            name: authUser.name,
            companyEmail: authUser.email,
            profilePhotoUrl: authUser.avatar || initialMockProfileData.personal.profilePhotoUrl,
            personalEmail: authUser.email.includes("priya") ? "priya.personal@example.com" : `user.${authUser.name.split(" ")[0].toLowerCase()}@personal.com`,
            phone: authUser.email.includes("priya") ? "+91 98765 43210" : "+91 88888 77777", 
            address: authUser.email.includes("priya") ? "Apt 101, Silicon Towers, Koramangala, Bengaluru, Karnataka 560034" : "B-45, Green Park, New Delhi 110016",
            city: authUser.email.includes("priya") ? "Bengaluru" : "New Delhi",
            idProofFileName: authUser.email.includes("priya") ? "Aadhaar_PriyaSharma.pdf" : "PAN_Card_OtherUser.pdf",
            addressProofFileName: authUser.email.includes("priya") ? "ElectricityBill_PriyaSharma.pdf" : "Passport_OtherUser.pdf",
          },
           secondaryData: {
            ...initialMockProfileData.secondaryData, 
            currentPosition: authUser.currentRole?.name || "Employee",
            managerName: authUser.email.includes("priya") ? "Rohan Mehra" : "Anita Singh",
            department: authUser.email.includes("priya") ? "Technology" : "Marketing",
          },
          rewards: {...initialMockProfileData.rewards},
          attendance: {...initialMockProfileData.attendance},
          remuneration: {...initialMockProfileData.remuneration},
          reports: {...initialMockProfileData.reports},
          holidays: {...initialMockProfileData.holidays},
          companyName: initialMockProfileData.companyName,
        };
        set({ profileData: userSpecificProfile });
      }
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
            console.error("Failed to rehydrate profile store", error);
            if (state) state.profileData = initialMockProfileData; // Attempt to reset if state object exists
            else useProfileStore.setState({ profileData: initialMockProfileData }); // Force reset if state is null
        } else if (!state || !state.profileData || !state.profileData.personal || !state.profileData.personal.name) {
          console.log("Rehydrating profile store: store empty or invalid, using initial mock data.");
          if (state) {
            state.profileData = initialMockProfileData;
          } else {
            useProfileStore.setState({ profileData: initialMockProfileData });
          }
        }
      }
    }
  )
);


export const DUMMY_EMPLOYEE_LIST_FOR_NOMINATION = [
  { name: "Priya Sharma" }, { name: "Rohan Mehra" }, { name: "Aisha Khan" },
  { name: "Vikram Singh" }, { name: "Suresh Kumar" }, { name: "Sunita Reddy" },
];

