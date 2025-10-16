import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ZardFormModule } from "@shared/components/form/form.module";
import { TaskService } from "../task/task.service";
import { CategoryService } from "../category/category.service";
import { PomodoroComponent } from '../pomodoro/pomodoro.component';
import { ZardBadgeComponent } from '../shared/components/badge/badge.component';
import { ZardSelectItemComponent } from "@shared/components/select/select-item.component";
import { ZardSelectComponent } from "@shared/components/select/select.component";
import { ZardPopoverComponent, ZardPopoverDirective } from "@shared/components/popover/popover.component";


@Component({
  selector: 'index-task-form',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,  
    ZardFormModule,
    PomodoroComponent,
    ZardBadgeComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ReactiveFormsModule,
    ZardPopoverComponent,
    ZardPopoverDirective
  ],
  templateUrl: './index.html',
  styleUrls: ['./index.css'],
  providers: [TaskService, CategoryService]
})

export class IndexTaskFormComponent implements OnInit {
  task: any = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: '',
    priority: '',
    timeTotalLearning: null,
    categoryId: null
  };

  categories: any[] = [];
  uniqueCategories: any[] = [];
  showCategoryForm = false;
  category: any = {
    name: '',
    color: '',
    icon: ''
  };

  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  loadingCategories = false;
  message = '';
  tasks: any[] = [];
  selectedCategoryId: number | null = null;
  categoryTasks: any[] = [];

  showPomodoro = false;
  pomodoroTask: any = null;

  filteredTasks: any[] = [];

  dateError = false;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loadingCategories = true;
    this.categoryService.getCategories(1, 100).subscribe({
      next: (data) => {
        const all = Array.isArray(data.content) ? data.content : [];
        // Filter unique categories by name, keeping only the first occurrence
        const seen = new Set<string>();
        this.uniqueCategories = [];
        for (const cat of all) {
          if (!seen.has(cat.name)) {
            seen.add(cat.name);
            this.uniqueCategories.push(cat);
          }
        }
        this.categories = all;
        this.loadingCategories = false;

      },
      error: () => {
        this.categories = [];
        this.uniqueCategories = [];
        this.loadingCategories = false;
      }
    });
  }

  onCategoryChange(value: any) {
    // Called when category select changes
    this.task.categoryId = value;
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

  onStartDateChange(date: Date | null) {
    this.startDate.set(date);
    this.validateDates();
  }

  onEndDateChange(date: Date | null) {
    this.endDate.set(date);
    this.validateDates();
  }

  validateDates() {
    if (this.task.startDate && this.task.endDate) {
      this.dateError = new Date(this.task.startDate) > new Date(this.task.endDate);
    } else {
      this.dateError = false;
    }
  }

  submitTask() {
    this.validateDates();
    if (this.dateError) return;
    const taskToSend = {
      ...this.task,
      startDate: this.formatDateToBackend(this.task.startDate),
      endDate: this.formatDateToBackend(this.task.endDate),
      timeTotalLearning: 0
    };
    this.taskService.createTask(taskToSend).subscribe({
      next: (created) => {
        this.message = 'Task created successfully!';
        this.tasks.unshift({ ...created, hover: false, expanded: false });
        if (this.tasks.length > 5) this.tasks = this.tasks.slice(0, 5);
        this.task = {
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          status: '',
          priority: '',
          timeTotalLearning: null,
          categoryId: null
        };
      },
      error: () => {
        this.message = 'Error creating task.';
      }
    });
  }

  submitCategory() {
    this.categoryService.createCategory(this.category).subscribe({
      next: () => {
        this.message = 'Category created!';
        this.showCategoryForm = false;
        this.category = { name: '', color: '', icon: '' };
        this.loadCategories();
      },
      error: () => {
        this.message = 'Error creating category.';
      }
    });
  }

  getDateValue(date: any): any {
    // If your date is already a Date object, just return it.
    // If it's a string or timestamp, convert as needed.
    return date ? new Date(date) : null;
  }

  getCategoryName(id: number) {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : '';
  }

  onCategorySelect(selectedId: number | null) {
    this.selectedCategoryId = selectedId;
    if (!this.selectedCategoryId) {
      this.categoryTasks = [];
      this.filteredTasks = [];
      return;
    }
    this.taskService.getTasksByCategory(this.selectedCategoryId).subscribe({
      next: (data) => {
        this.categoryTasks = Array.isArray(data) ? data : (data.content ?? []);
        // Filter only tasks with status IN_PROGRESS and limit to last 5
        this.filteredTasks = this.categoryTasks
          .filter(task => task.status === 'IN_PROGRESS')
          .slice(0, 5);
      },
      error: () => {
        this.categoryTasks = [];
        this.filteredTasks = [];
      }
    });
  }

  openPomodoro(task: any) {
    this.pomodoroTask = task;
    this.showPomodoro = true;
  }

  closePomodoro() {
    this.showPomodoro = false;
    this.pomodoroTask = null;
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}