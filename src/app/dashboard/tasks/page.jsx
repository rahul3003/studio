"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, ListTodo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "@/components/task/task-form";
import { useTaskStore } from "@/store/taskStore"; // Import task store
import { useEmployeeStore } from "@/store/employeeStore"; // For assignee options
import { useProjectStore } from "@/store/projectStore"; // For project options

const TASK_STATUS_OPTIONS = ["To Do", "In Progress", "Planning", "Blocked", "Completed", "Cancelled"];
const TASK_PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];

const statusVariantMap = {
  "To Do": "secondary",
  "In Progress": "default",
  Planning: "outline",
  Blocked: "destructive",
  Completed: "default", 
  Cancelled: "destructive",
};

const priorityVariantMap = {
  Low: "secondary",
  Medium: "default",
  High: "outline", 
  Urgent: "destructive",
};


export default function TasksPage() {
  const { toast } = useToast();
  // Use Zustand stores
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const initializeTasks = useTaskStore((state) => state._initializeTasks);

  const employees = useEmployeeStore((state) => state.employees);
  const MOCK_EMPLOYEES_FOR_ASSIGNEE = employees.map(emp => emp.name);

  const projects = useProjectStore((state) => state.projects);
  const MOCK_PROJECT_OPTIONS = projects.map(proj => proj.name);


  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState(null);

  React.useEffect(() => {
    initializeTasks(); // Ensure store is initialized
  }, [initializeTasks]);

  const handleAddTaskOpen = () => {
    setSelectedTask(null);
    setIsAddDialogOpen(true);
  };

  const handleEditTaskOpen = (task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTaskOpen = (task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = (taskData) => {
    if (selectedTask && selectedTask.id) {
      // Editing existing task
      updateTask({ ...taskData, id: selectedTask.id });
      toast({ title: "Task Updated", description: `"${taskData.name}" details have been updated.` });
    } else {
      // Adding new task
      const newId = `TASK${String(Date.now()).slice(-4)}${String(tasks.length + 1).padStart(3, '0')}`;
      const newTask = {
        ...taskData,
        id: newId,
        creationDate: new Date().toISOString().split('T')[0],
      };
      addTask(newTask);
      toast({ title: "Task Added", description: `"${taskData.name}" has been created.` });
    }
    handleDialogClose();
  };

  const handleConfirmDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      toast({ title: "Task Deleted", description: `"${selectedTask.name}" has been removed.`, variant: "destructive" });
    }
    handleDialogClose();
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ListTodo className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Manage Tasks</CardTitle>
            </div>
            <CardDescription>
              View, create, assign, and monitor tasks.
            </CardDescription>
          </div>
          <Button onClick={handleAddTaskOpen} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.id}</TableCell>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.projectName}</TableCell>
                    <TableCell>{task.assignee}</TableCell>
                    <TableCell>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                        year: "numeric", month: "short", day: "numeric",
                      }) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityVariantMap[task.priority] || "outline"}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[task.status] || "outline"}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 hover:bg-accent/20"
                        onClick={() => handleEditTaskOpen(task)}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                        <span className="sr-only">Edit {task.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/20"
                        onClick={() => handleDeleteTaskOpen(task)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete {task.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {tasks.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              No tasks found. Click "Add New Task" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTask ? "Edit Task" : "Add New Task"}</DialogTitle>
            <DialogDescription>
              {selectedTask ? "Update the details of the task." : "Fill in the details to create a new task."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <TaskForm
              onSubmit={handleSaveTask}
              initialData={selectedTask}
              onCancel={handleDialogClose}
              assigneeOptions={MOCK_EMPLOYEES_FOR_ASSIGNEE.length > 0 ? MOCK_EMPLOYEES_FOR_ASSIGNEE : ["Default Assignee"]}
              projectOptions={MOCK_PROJECT_OPTIONS.length > 0 ? MOCK_PROJECT_OPTIONS : ["Default Project"]}
              statusOptions={TASK_STATUS_OPTIONS}
              priorityOptions={TASK_PRIORITY_OPTIONS}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task:{" "}
              <strong>{selectedTask?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
