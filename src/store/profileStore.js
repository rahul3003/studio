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
    profilePhotoFileName: "profile_priya.jpg",
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
    // Renamed from pointsAvailable to accruedPoints for clarity
    accruedPoints: 1250, // Total points received by the user, these don't reset.
    // Renamed from pointsReceived to pointsSharedThisMonth (conceptually)
    // Actual sharable points will be calculated: sharablePointsMonthlyLimit - pointsSharedThisMonth
    sharablePointsMonthlyLimit: 100, // Max points user can share per month
    pointsSharedThisMonth: 20, // Points user has already shared this month
    
    // Renamed from nominationHistory to nominationHistoryGiven
    nominationHistoryGiven: [ // Nominations made BY this user
      { id: 1, nomineeName: "Rohan Mehra", points: 10, date: "2024-06-15", reasonCategory: "Team collaboration", feedbackText: "Excellent project management on HRMS portal." },
      { id: 2, nomineeName: "Aisha Khan", points: 5, date: "2024-05-20", reasonCategory: "Innovative scope", feedbackText: "Creative UI design for the new module." },
    ],
    // New: History of rewards RECEIVED by this user
    nominationHistoryReceived: [
      { id: 101, nominatorName: "Vikram Singh", points: 50, date: "2024-07-01", reasonCategory: "On-time help", feedbackText: "Helped resolve a critical production bug quickly." },
      { id: 102, nominatorName: "Suresh Kumar", points: 20, date: "2024-04-10", reasonCategory: "Mentorship", feedbackText: "Great guidance on the new framework." },
    ]
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
          const updatedPersonal = {
            ...state.profileData.personal,
            ...newData,
            profilePhotoUrl: newData.profilePhotoUrl || state.profileData.personal.profilePhotoUrl,
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

      addNomination: (nominationDetails) => // { nomineeName, points, reasonCategory, feedbackText }
        set((state) => {
          const currentRewards = state.profileData.rewards;
          const pointsToShare = parseInt(nominationDetails.points, 10);

          if (isNaN(pointsToShare) || pointsToShare <= 0) {
            console.warn("Invalid points for nomination");
            return state; // No change
          }
          
          const remainingSharable = currentRewards.sharablePointsMonthlyLimit - currentRewards.pointsSharedThisMonth;
          if (pointsToShare > remainingSharable) {
            console.warn("Not enough sharable points remaining this month.");
            // Optionally, inform the user via toast from the component calling this.
            return state; // No change
          }

          const newNominationGiven = {
            id: Date.now(),
            nomineeName: nominationDetails.nominee, // from form, it's nominee
            points: pointsToShare,
            date: new Date().toISOString().split('T')[0],
            reasonCategory: nominationDetails.reasonCategory,
            feedbackText: nominationDetails.feedbackText,
          };

          // Simulate updating nominee's points (in a real app, this would be more complex)
          // For this demo, we are not updating other users' profiles directly from this store.
          // This action primarily updates the current user's "given" history and "shared" count.

          return {
            profileData: {
              ...state.profileData,
              rewards: {
                ...currentRewards,
                pointsSharedThisMonth: currentRewards.pointsSharedThisMonth + pointsToShare,
                nominationHistoryGiven: [
                  newNominationGiven,
                  ...currentRewards.nominationHistoryGiven,
                ],
                // Note: We are not updating accruedPoints or nominationHistoryReceived for the nominee here.
                // That would require a more global state or backend interaction.
              },
            },
          };
        }),
      
      // Conceptual: This would be triggered by a cron job or a check at the beginning of the month
      resetSharablePoints: () => set(state => ({
        profileData: {
          ...state.profileData,
          rewards: {
            ...state.profileData.rewards,
            pointsSharedThisMonth: 0,
          }
        }
      })),
      
      setProfileData: (newProfileData) => set({ profileData: newProfileData }),

      initializeProfileForUser: (authUser) => {
        if (!authUser) {
          set({ profileData: initialMockProfileData }); 
          return;
        }
        // Reset pointsSharedThisMonth to 0 if it's a new month (conceptual for demo)
        // In a real app, this logic would be more robust, likely server-driven or checked on app load.
        const currentMonth = new Date().getMonth();
        const lastResetMonth = get().profileData?.rewards?.lastSharableResetMonth; // Need to add this to store if we want to persist
        
        let pointsSharedThisMonth = initialMockProfileData.rewards.pointsSharedThisMonth;
        if (lastResetMonth !== undefined && lastResetMonth !== currentMonth) {
            pointsSharedThisMonth = 0;
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
          rewards: { // Initialize with default structure, specific user data might be fetched/merged later
            ...initialMockProfileData.rewards,
            pointsSharedThisMonth: pointsSharedThisMonth, 
            // lastSharableResetMonth: currentMonth, // Persist the month of last reset
          },
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
            if (state) state.profileData = initialMockProfileData; 
            else useProfileStore.setState({ profileData: initialMockProfileData });
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
  // Ensure current user is not in this list if they are viewing the form.
  // This list should be dynamically filtered in the component.
  { name: "Rohan Mehra", id: "EMP002" }, 
  { name: "Aisha Khan", id: "EMP003" },
  { name: "Vikram Singh", id: "EMP004" }, 
  { name: "Suresh Kumar", id: "EMP005" }, 
  { name: "Sunita Reddy", id: "EMP006" },
  { name: "Priya Sharma", id: "EMP001"}, // Example: Priya can't nominate herself
];

export const REWARD_REASON_CATEGORIES = ["On-time help", "Innovative scope", "Team collaboration", "Mentorship", "Problem solving", "Customer delight", "Process improvement"];
