import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ZardFormModule } from "@shared/components/form/form.module";
import { ContentComponent } from "@shared/components/layout/content.component";
import { HeaderComponent } from "@shared/components/layout/header.component";
import { LayoutComponent } from "@shared/components/layout/layout.component";
import { TaskService } from "../task/task.service";
import { CategoryService } from "../category/category.service";
import { PomodoroComponent } from '../pomodoro/pomodoro.component';


@Component({
  selector: 'index-task-form',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    ZardFormModule,
    PomodoroComponent // Adicione aqui
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

  loadingCategories = false;
  message = '';
  tasks: any[] = [];
  selectedCategoryId: number | null = null;
  categoryTasks: any[] = [];

  showPomodoro = false;
  pomodoroTask: any = null;

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
        // Filtra categorias únicas pelo nome, mantendo apenas a primeira ocorrência
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

  formatDateToBackend(dateStr: string): string | null {
    if (!dateStr) return null;
    // dateStr is 'yyyy-MM-dd'
    const date = new Date(dateStr);
    // Ajusta para o fuso horário local
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

  submitTask() {
    const taskToSend = {
      ...this.task,
      startDate: this.formatDateToBackend(this.task.startDate),
      endDate: this.formatDateToBackend(this.task.endDate)
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

  getCategoryName(id: number) {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : '';
  }

  onCategorySelect() {
    if (!this.selectedCategoryId) {
      this.categoryTasks = [];
      return;
    }
    this.taskService.getTasksByCategory(this.selectedCategoryId).subscribe({
      next: (data) => {
        this.categoryTasks = Array.isArray(data) ? data : (data.content ?? []);
      },
      error: () => {
        this.categoryTasks = [];
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
}