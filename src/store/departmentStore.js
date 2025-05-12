
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Assuming initialDepartments is defined in the departments page, import it
// For simplicity, I'll define a small mock here. Replace with actual import.
const initialDepartmentsMock = [
  {
    id: "DEPT001",
    name: "Technology",
    head: "Dr. Emily Carter",
    description: "Responsible for software development and IT infrastructure.",
    creationDate: "2022-01-15",
  },
  {
    id: "DEPT002",
    name: "Human Resources",
    head: "Michael Chen",
    description: "Manages employee relations, recruitment, and benefits.",
    creationDate: "2021-03-20",
  },
];


export const useDepartmentStore = create(
  persist(
    (set, get) => ({
      departments: [],
      _initializeDepartments: () => {
        if (get().departments.length === 0) {
          set({ departments: initialDepartmentsMock });
        }
      },
      addDepartment: (department) =>
        set((state) => ({
          departments: [department, ...state.departments],
        })),
      updateDepartment: (updatedDepartment) =>
        set((state) => ({
          departments: state.departments.map((dept) =>
            dept.id === updatedDepartment.id ? { ...dept, ...updatedDepartment } : dept
          ),
        })),
      deleteDepartment: (departmentId) =>
        set((state) => ({
          departments: state.departments.filter((dept) => dept.id !== departmentId),
        })),
      setDepartments: (departments) => set({ departments }),
    }),
    {
      name: 'department-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state || state.departments.length === 0) {
           console.log("Rehydrating department store with initial mock data.");
          state.departments = initialDepartmentsMock;
        }
      }
    }
  )
);

if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('department-storage');
    if (!storedData || JSON.parse(storedData)?.state?.departments?.length === 0) {
      useDepartmentStore.setState({ departments: initialDepartmentsMock });
    } else {
      useDepartmentStore.getState().setDepartments(JSON.parse(storedData).state.departments);
    }
}
