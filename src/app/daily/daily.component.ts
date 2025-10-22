import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../task/task.service'; // import the service

@Component({
  selector: 'app-daily',
  templateUrl: './daily.component.html',
  styleUrls: ['./daily.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DailyComponent implements OnInit {
  tasks: any[] = [];              // tasks in progress / pending
  completedTasks: any[] = [];     // completed tasks
  selectedTask: any = null;
  newTaskTitle: string = '';
  showCompleted = true;

  constructor(private taskService: TaskService) {
    // constructor body
  }

  ngOnInit() {
    this.loadTasksFromServer();
  }


  loadTasksFromServer() {
    this.taskService.getTasks().subscribe({
      next: (data: any) => {
        const all = Array.isArray(data.content) ? data.content : [];

        // separate completed and not completed
        this.completedTasks = all.filter((t: any) => t.status === 'COMPLETED');
        this.tasks = all.filter((t: any) => t.status !== 'COMPLETED');

        // set selectedTask to the first available
        this.selectedTask = this.tasks.length > 0 ? this.tasks[0] : (this.completedTasks.length > 0 ? this.completedTasks[0] : null);
      },
      error: (err) => {
        console.error('Error loading tasks', err);
        // fallback: keep arrays empty
        this.tasks = [];
        this.completedTasks = [];
        this.selectedTask = null;
      }
    });
  }

  addTask() {
    const title = this.newTaskTitle?.trim();
    if (!title) return;

    const newTask = {
      name: title,
      description: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      status: 'PENDING',
      priority: 'LOW',
      timeTotalLearning: 0,
      important: false,
      completed: false
    };

    // If the service exists, create on the server and refresh the list on success
    if (this.taskService && typeof this.taskService.createTask === 'function') {

      const taskToSend = {
        ...newTask,
        startDate: this.formatDateToBackend(newTask.startDate),
        endDate: this.formatDateToBackend(newTask.endDate),
        timeTotalLearning: 0
      };

      this.taskService.createTask(taskToSend).subscribe({
        next: (created: any) => {
          // reload from server to ensure ordering and consistent data
          this.loadTasksFromServer();
          this.newTaskTitle = '';
        },
        error: (err) => {
          console.error('Error creating task on server, using local fallback', err);
          // local fallback to avoid losing user's input
          this.tasks.unshift(newTask);
          this.selectedTask = newTask;
          this.newTaskTitle = '';
        }
      });
    } else {
      // fallback if service not available
      this.tasks.unshift(newTask);
      this.selectedTask = newTask;
      this.newTaskTitle = '';
    }
  }

  formatDateToBackend(dateStr: string): string | null {
    if (!dateStr) return null;
    // dateStr is 'yyyy-MM-dd'
    const date = new Date(dateStr);
    // Adjust to local timezone
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? '+' : '-';
    const pad = (n: number) => `${Math.floor(Math.abs(n) / 10)}${Math.abs(n) % 10}`;
    const offsetHours = pad(Math.abs(tzOffset / 60));
    const offsetMinutes = pad(Math.abs(tzOffset % 60));
    // yyyy-MM-ddTHH:mm:ss.sss±hh:mm
    return (
      date.toISOString().slice(0, 19) +
      diff +
      offsetHours +
      ':' +
      offsetMinutes
    );
  }
  
}
