import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZardTableComponent } from '../shared/components/table/table.component';
import { ZardBadgeComponent } from '../shared/components/badge/badge.component';
import { CategoryService } from './category.service';
import { ZardPaginationModule } from '@shared/components/pagination/pagination.module';
import { signal } from '@angular/core';

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'zard-demo-category-table',
  standalone: true,
  imports: [ZardTableComponent, ZardBadgeComponent, ZardPaginationModule, FormsModule],
  templateUrl: './category.html',
  styleUrls: ['./category.css']
})
export class ZardDemoCategoryTableComponent {
  listOfData: Category[] = [];
  currentPage = signal<number>(1);
  totalPages = 1;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage());
  }

  loadPage(page: number): void {
    this.categoryService.getCategories(page).subscribe({
      next: (data) => {
        if (Array.isArray(data.content)) {
          console.log('Dados recebidos do backend:', data);
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
