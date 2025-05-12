import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, differenceInCalendarDays, getDaysInYear, startOfMonth, startOfYear, isSameMonth, isSameYear, parseISO } from 'date-fns';

const ANNUAL_SHARABLE_POINTS_ALLOTMENT = 400;
const MONTHLY_SHARE_LIMIT = 100;

// Helper function to get the start of the month for a given date string
const getStartOfMonthISO = (date) => {
  return format(startOfMonth(date), 'yyyy-MM-dd');
};

// Helper function to get the start of the year for a given date string
const getStartOfYearISO = (date) => {
  return format(startOfYear(date), 'yyyy-MM-dd');
};

const calculateAnnualSharablePoints = (joiningDateString, forDate) => {
  const joiningDate = parseISO(joiningDateString);
  const targetYear = forDate.getFullYear();
  const joiningYear = joiningDate.getFullYear();

  if (targetYear < joiningYear || joiningDate > forDate) {
    return 0;
  }

  if (targetYear > joiningYear) {
    return ANNUAL_SHARABLE_POINTS_ALLOTMENT;
  }

  // targetYear === joiningYear
  const yearStartDate = new Date(targetYear, 0, 1);
  const yearEndDate = new Date(targetYear, 11, 31);
  
  const firstDayOfEmploymentInYear = joiningDate < yearStartDate ? yearStartDate : joiningDate;
  
  const daysEmployedInYear = differenceInCalendarDays(yearEndDate, firstDayOfEmploymentInYear) + 1;
  const totalDaysInYear = getDaysInYear(forDate);

  if (daysEmployedInYear <= 0 || totalDaysInYear <= 0) {
    return 0;
  }
  
  const proRatedPoints = (daysEmployedInYear / totalDaysInYear) * ANNUAL_SHARABLE_POINTS_ALLOTMENT;
  return Math.round(proRatedPoints);
};


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
    joiningDate: "2022-08-15", // Example joining date
    department: "Technology",
    currentPosition: "Senior Software Engineer",
    currentRemuneration: "₹ 9,52,000 p.a.",
    leaveBalance: { annual: 15, sick: 8, totalAnnual: 20, totalSick: 10 },
    managerName: "Rohan Mehra",
    managerDepartment: "Technology",
  },
  rewards: {
    accruedPoints: 1250, // Points received by user

    // For sharing with others:
    totalAnnualSharablePoints: 0, // Will be calculated based on joiningDate and current year
    pointsSharedThisYear: 50,      // Example: 50 points already shared this year

    monthlyShareLimit: MONTHLY_SHARE_LIMIT, // Max points that can be shared in a single calendar month
    pointsSharedThisMonth: 10,    // Example: 10 points shared in the current calendar month
    
    lastMonthlyReset: getStartOfMonthISO(new Date()), // Dynamically set to start of current month
    lastYearlyReset: getStartOfYearISO(new Date()),   // Dynamically set to start of current year

    nominationHistoryGiven: [ 
      { id: 1, nomineeName: "Rohan Mehra", points: 10, date: "2024-06-15", reasonCategory: "Team collaboration", feedbackText: "Excellent project management on HRMS portal." },
      { id: 2, nomineeName: "Aisha Khan", points: 5, date: "2024-05-20", reasonCategory: "Innovative scope", feedbackText: "Creative UI design for the new module." },
    ],
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
                ) // Simplified: adds to first summary item
            }
          }
        })),

      addNomination: (nominationDetails) =>
        set((state) => {
          const currentRewards = state.profileData.rewards;
          const pointsToNominate = parseInt(nominationDetails.points, 10);

          if (isNaN(pointsToNominate) || pointsToNominate <= 0) {
            console.warn("Invalid points for nomination");
            return state;
          }
          
          const remainingMonthlyShare = currentRewards.monthlyShareLimit - currentRewards.pointsSharedThisMonth;
          const remainingYearlyShare = currentRewards.totalAnnualSharablePoints - currentRewards.pointsSharedThisYear;

          if (pointsToNominate > remainingMonthlyShare) {
            console.warn("Nomination exceeds monthly sharing limit.");
            // Optionally: use toast here to inform user
            return state;
          }
          if (pointsToNominate > remainingYearlyShare) {
            console.warn("Nomination exceeds yearly sharing limit.");
            // Optionally: use toast here
            return state;
          }

          const newNominationGiven = {
            id: Date.now(), // Simple ID generation
            nomineeName: nominationDetails.nominee,
            points: pointsToNominate,
            date: format(new Date(), 'yyyy-MM-dd'),
            reasonCategory: nominationDetails.reasonCategory,
            feedbackText: nominationDetails.feedbackText,
          };

          return {
            profileData: {
              ...state.profileData,
              rewards: {
                ...currentRewards,
                pointsSharedThisMonth: currentRewards.pointsSharedThisMonth + pointsToNominate,
                pointsSharedThisYear: currentRewards.pointsSharedThisYear + pointsToNominate,
                nominationHistoryGiven: [
                  newNominationGiven,
                  ...(currentRewards.nominationHistoryGiven || []), 
                ],
              },
            },
          };
        }),
      
      setProfileData: (newProfileData) => set({ profileData: newProfileData }),

      initializeProfileForUser: (authUser) => {
        if (!authUser) {
          set({ profileData: initialMockProfileData }); 
          return;
        }

        const today = new Date();
        // Use current state's joiningDate if available, otherwise fallback to initial mock, then authUser if it has one.
        const joiningDateString = get().profileData?.secondaryData?.joiningDate || initialMockProfileData.secondaryData.joiningDate;
        
        let rewardsState = { ...(get().profileData?.rewards || initialMockProfileData.rewards) };

        // Yearly reset logic
        if (!rewardsState.lastYearlyReset || !isSameYear(parseISO(rewardsState.lastYearlyReset), today)) {
          rewardsState.totalAnnualSharablePoints = calculateAnnualSharablePoints(joiningDateString, today);
          rewardsState.pointsSharedThisYear = 0;
          rewardsState.lastYearlyReset = getStartOfYearISO(today);
        } else {
          // If it's the same year, ensure totalAnnualSharablePoints is correct, esp. for first year of joining.
          rewardsState.totalAnnualSharablePoints = calculateAnnualSharablePoints(joiningDateString, today);
        }

        // Monthly reset logic
        if (!rewardsState.lastMonthlyReset || !isSameMonth(parseISO(rewardsState.lastMonthlyReset), today)) {
          rewardsState.pointsSharedThisMonth = 0;
          rewardsState.lastMonthlyReset = getStartOfMonthISO(today);
        }
        
        // Ensure monthlyShareLimit is set if not present
        rewardsState.monthlyShareLimit = rewardsState.monthlyShareLimit || MONTHLY_SHARE_LIMIT;


        const userSpecificProfile = {
          ...initialMockProfileData, // Base structure
          personal: { // Specific overrides
            ...initialMockProfileData.personal, 
            name: authUser.name,
            companyEmail: authUser.email,
            profilePhotoUrl: authUser.avatar || initialMockProfileData.personal.profilePhotoUrl,
             // Simplified personal details based on some logic, can be expanded
            personalEmail: authUser.email.includes("priya") ? "priya.personal@example.com" : `user.${authUser.name.split(" ")[0].toLowerCase()}@personal.com`,
            phone: authUser.email.includes("priya") ? "+91 98765 43210" : "+91 88888 77777", 
            address: authUser.email.includes("priya") ? "Apt 101, Silicon Towers, Koramangala, Bengaluru, Karnataka 560034" : "B-45, Green Park, New Delhi 110016",
            city: authUser.email.includes("priya") ? "Bengaluru" : "New Delhi",
          },
           secondaryData: { // Specific overrides
            ...initialMockProfileData.secondaryData, 
            joiningDate: joiningDateString, // Use the determined joining date
            currentPosition: authUser.currentRole?.name || "Employee",
            managerName: authUser.email.includes("priya") ? "Rohan Mehra" : "Anita Singh", // Example
            department: authUser.email.includes("priya") ? "Technology" : "Marketing", // Example
          },
          rewards: rewardsState, // The updated rewards object
          // Keep other sections as they are from initialMockProfileData or make them user-specific if needed
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
            // On error, set to a base initial state. initializeProfileForUser will refine it if a user is logged in.
            if (state) state.profileData = initialMockProfileData; 
            else useProfileStore.setState({ profileData: initialMockProfileData }); // Should be rare
        } else if (!state || !state.profileData || !state.profileData.personal || !state.profileData.personal.name) {
          console.log("Rehydrating profile store: store empty or invalid, using initial mock data.");
          if (state) {
            state.profileData = initialMockProfileData;
          } else {
             useProfileStore.setState({ profileData: initialMockProfileData });
          }
        }
        // After rehydration (or setting to initial on error/empty), call initializeProfileForUser
        // This requires authUser, so it's better called from where authUser is available (e.g., in useMockAuth or DashboardLayout)
        // For now, we ensure the basic structure is there.
        // The actual calculation based on authUser's joiningDate will happen when initializeProfileForUser is explicitly called.
      }
    }
  )
);


export const DUMMY_EMPLOYEE_LIST_FOR_NOMINATION = [
  { name: "Rohan Mehra", id: "EMP002" }, 
  { name: "Aisha Khan", id: "EMP003" },
  { name: "Vikram Singh", id: "EMP004" }, 
  { name: "Suresh Kumar", id: "EMP005" }, 
  { name: "Sunita Reddy", id: "EMP006" },
  { name: "Priya Sharma", id: "EMP001"}, 
];

export const REWARD_REASON_CATEGORIES = ["On-time help", "Innovative scope", "Team collaboration", "Mentorship", "Problem solving", "Customer delight", "Process improvement"];

// Ensure initial mock data has calculated totalAnnualSharablePoints for Priya Sharma (example)
const todayForMock = new Date();
initialMockProfileData.rewards.totalAnnualSharablePoints = calculateAnnualSharablePoints(initialMockProfileData.secondaryData.joiningDate, todayForMock);
initialMockProfileData.rewards.lastYearlyReset = getStartOfYearISO(todayForMock);
initialMockProfileData.rewards.lastMonthlyReset = getStartOfMonthISO(todayForMock);
// Ensure pointsSharedThisYear and pointsSharedThisMonth are plausible relative to the calculated total
if (initialMockProfileData.rewards.pointsSharedThisYear > initialMockProfileData.rewards.totalAnnualSharablePoints) {
    initialMockProfileData.rewards.pointsSharedThisYear = Math.min(50, initialMockProfileData.rewards.totalAnnualSharablePoints);
}
if (initialMockProfileData.rewards.pointsSharedThisMonth > initialMockProfileData.rewards.monthlyShareLimit) {
    initialMockProfileData.rewards.pointsSharedThisMonth = Math.min(10, initialMockProfileData.rewards.monthlyShareLimit);
}
if (initialMockProfileData.rewards.pointsSharedThisMonth > initialMockProfileData.rewards.pointsSharedThisYear) {
   initialMockProfileData.rewards.pointsSharedThisMonth = initialMockProfileData.rewards.pointsSharedThisYear > 0 ? Math.min(10, initialMockProfileData.rewards.pointsSharedThisYear) : 0;
}

