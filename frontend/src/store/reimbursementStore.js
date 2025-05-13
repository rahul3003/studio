
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialReimbursementsMock = [
  {
    id: "REIM001",
    employeeName: "Priya Sharma",
    amount: 5500.50,
    currency: "INR",
    description: "Client dinner meeting in Mumbai",
    submissionDate: "2024-07-15",
    status: "Approved",
    fileName: "dinner_receipt_mumbai.pdf",
    reasonForRejection: null,
  },
];

export const useReimbursementStore = create(
  persist(
    (set, get) => ({
      reimbursements: initialReimbursementsMock, // Initialize with mock data directly
       _initializeReimbursements: () => {
        if (get().reimbursements.length === 0) {
          set({ reimbursements: initialReimbursementsMock });
        }
      },
      addReimbursement: (reimbursement) =>
        set((state) => ({
          reimbursements: [reimbursement, ...state.reimbursements],
        })),
      updateReimbursement: (updatedReimbursement) =>
        set((state) => ({
          reimbursements: state.reimbursements.map((reimb) =>
            reimb.id === updatedReimbursement.id ? { ...reimb, ...updatedReimbursement } : reimb
          ),
        })),
      deleteReimbursement: (reimbursementId) =>
        set((state) => ({
          reimbursements: state.reimbursements.filter((reimb) => reimb.id !== reimbursementId),
        })),
      setReimbursements: (reimbursements) => set({ reimbursements }),
    }),
    {
      name: 'reimbursement-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate reimbursement store", error);
          state.reimbursements = initialReimbursementsMock;
        } else if (!state || !state.reimbursements || state.reimbursements.length === 0) {
          console.log("Rehydrating reimbursement store: store empty or invalid, using initial mock data.");
          if (state) {
            state.reimbursements = initialReimbursementsMock;
          }
        }
      }
    }
  )
);

// Redundant client-side initialization block removed.
