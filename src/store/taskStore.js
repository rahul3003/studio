
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
      tasks: [],
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
      onRehydrateStorage: () => (state) => {
        if (!state || state.tasks.length === 0) {
           console.log("Rehydrating task store with initial mock data.");
          state.tasks = initialTasksMock;
        }
      }
    }
  )
);

if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('task-storage');
     if (!storedData || JSON.parse(storedData)?.state?.tasks?.length === 0) {
      useTaskStore.setState({ tasks: initialTasksMock });
    } else {
       useTaskStore.getState().setTasks(JSON.parse(storedData).state.tasks);
    }
}
