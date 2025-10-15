import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZardTableComponent } from '../shared/components/table/table.component';
import { ZardBadgeComponent } from '../shared/components/badge/badge.component';
import { GoalService } from './goal.service';
import { DatePipe } from '@angular/common';
import { ZardPaginationModule } from '@shared/components/pagination/pagination.module';
import { signal } from '@angular/core';

interface Goal {
  id: number;
  title: string;
  description: string;
  type: 'DAILY_TIME' | 'WEEKLY_TIME' | 'POMODORO_DAILY' | 'TASKS_COMPLETED';
  goalValue: number;
  goalActual: number;
  endDate: string;
  active: boolean;
}

@Component({
  selector: 'zard-demo-goal-table',
  standalone: true,
  imports: [
    ZardTableComponent,
    ZardBadgeComponent,
    DatePipe,
    ZardPaginationModule,
    FormsModule
  ],
  templateUrl: './goal.html',
  styleUrls: ['./goal.css']
})
export class ZardDemoGoalTableComponent {
  listOfData: Goal[] = [];
  currentPage = signal<number>(1);
  totalPages = 1;

  constructor(private goalService: GoalService) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage());
  }

  loadPage(page: number): void {
    this.goalService.getGoals(page).subscribe({
      next: (data) => {
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
      error: () => {
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
