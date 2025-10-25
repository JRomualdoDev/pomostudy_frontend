import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
 
import { ZardTableComponent } from '../shared/components/table/table.component';
import { ZardBadgeComponent } from '../shared/components/badge/badge.component';
import { TaskService } from './task.service';
import { DatePipe } from '@angular/common';
import { ZardPaginationModule } from '@shared/components/pagination/pagination.module';
import { Observable } from 'rxjs';

import { signal } from '@angular/core';
 
interface Task {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  timeTotalLearning: number;
  categoryId: number;
}
 
@Component({
  selector: 'zard-demo-table-simple',
  imports: [ZardTableComponent, ZardBadgeComponent,DatePipe, ZardPaginationModule, FormsModule],
  templateUrl: './task.html',
  styleUrls: ['./task.css']
})
export class ZardDemoTableSimpleComponent {

   listOfData: Task[] = [];
   currentPage = signal<number>(1);
   totalPages =  1;

   constructor(private taskService: TaskService) {}

   ngOnInit(): void {
      this.loadPage(this.currentPage());
   }

  loadPage(page: number): void {
    this.taskService.getTasks(page).subscribe({
      next: (data) => {
        console.log('Dados recebidos do backend:', data);

        if (Array.isArray(data.content)) {
          this.listOfData = data.content;

          this.currentPage.set(data.pageNumber ?? page);

          this.totalPages = Number(data.totalPages) || 1;
          this.pages.set(Array.from({ length: this.totalPages }, (_, i) => i + 1));
        } else {
          this.listOfData = [];
          this.totalPages = 1;
          this.pages.set([1]);
        }
      },
      error: (err) => {
        console.error('Erro ao buscar tarefas:', err);
        this.listOfData = [];
        this.totalPages = 1;
        this.pages.set([1]);
      }
    });
  }

  pages = signal<number[]>(Array.from({ length: this.totalPages }, (_, i) => i + 1));
 
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadPage(page); 
  }
 
  goToPrevious() {
    if (this.currentPage() > 1) {
      const prev = this.currentPage() - 1;
      this.currentPage.set(prev);
      this.loadPage(prev);
    }
  }

  goToNext() {
    if (this.currentPage() < this.totalPages) {
      const next = this.currentPage() + 1;
      this.currentPage.set(next);
      this.loadPage(next); 
    }
  }
}

@Component({
  selector: 'app-task',
  template: '',
})
export class TaskComponent {
  constructor(private taskService: TaskService) {}

  // Edit a task by id, returns the observable from the service
  editTask(taskId: number | string, payload: any): Observable<any> {
    return this.taskService.updateTask(taskId, payload);
  }
}
