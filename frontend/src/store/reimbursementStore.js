import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { reimbursementService } from '../services/reimbursementService';

export const useReimbursementStore = create(
  persist(
    (set, get) => ({
      reimbursements: [],
      loading: false,
      error: null,
      async _initializeReimbursements() {
        set({ loading: true, error: null });
        try {
          const data = await reimbursementService.getAll();
          set({ reimbursements: data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
      async addReimbursement(reimbursement) {
        set({ loading: true, error: null });
        try {
          const { approverId, ...rest } = reimbursement;
          const dataToSend = { ...rest };
          const data = await reimbursementService.create(dataToSend);
          set((state) => ({ reimbursements: [data, ...state.reimbursements], loading: false }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
      async updateReimbursement(updatedReimbursement) {
        set({ loading: true, error: null });
        try {
          const { approverId, ...rest } = updatedReimbursement;
          const dataToSend = { ...rest };
          const data = await reimbursementService.update(updatedReimbursement.id, dataToSend);
          set((state) => ({
            reimbursements: state.reimbursements.map((r) => (r.id === data.id ? data : r)),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
      async deleteReimbursement(reimbursementId) {
        set({ loading: true, error: null });
        try {
          await reimbursementService.delete(reimbursementId);
          set((state) => ({
            reimbursements: state.reimbursements.filter((r) => r.id !== reimbursementId),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
      setReimbursements: (reimbursements) => set({ reimbursements }),
      async addComment(reimbursementId, comment, user) {
        set({ loading: true, error: null });
        try {
          const data = await reimbursementService.addComment(reimbursementId, comment, user);
          set((state) => ({
            reimbursements: state.reimbursements.map((r) => (r.id === data.id ? data : r)),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
      async addHistoryEntry(reimbursementId, entry) {
        set({ loading: true, error: null });
        try {
          const data = await reimbursementService.addHistoryEntry(reimbursementId, entry);
          set((state) => ({
            reimbursements: state.reimbursements.map((r) => (r.id === data.id ? data : r)),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
    }),
    {
      name: 'reimbursement-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Redundant client-side initialization block removed.
