
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialTasksMock = [
  {
    id: "TASK001",
    name: "Design Homepage UI for HRMS",
    description: "Create wireframes and mockups for the new HRMS portal homepage.",
    assignee: "Aisha Khan", 
    projectName: "HRMS Portal Development",
    dueDate: "2024-09-15",
    priority: "High",
    status: "In Progress",
    creationDate: "2024-08-01",
  },
];

export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: initialTasksMock, // Initialize with mock data directly
      _initializeTasks: () => {
        if (get().tasks.length === 0) {
          set({ tasks: initialTasksMock });
        }
      },
      addTask: (task) =>
        set((state) => ({
          tasks: [task, ...state.tasks],
        })),
      updateTask: (updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === updatedTask.id ? { ...task, ...updatedTask } : task
          ),
        })),
      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
      setTasks: (tasks) => set({ tasks }),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate task store", error);
          state.tasks = initialTasksMock;
        } else if (!state || !state.tasks || state.tasks.length === 0) {
           console.log("Rehydrating task store: store empty or invalid, using initial mock data.");
           if (state) {
             state.tasks = initialTasksMock;
           }
        }
      }
    }
  )
);

// Redundant client-side initialization block removed.
