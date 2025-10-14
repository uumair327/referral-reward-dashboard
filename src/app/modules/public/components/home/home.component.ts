import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { Category } from '../../../../models';
import { CategoryService } from '../../../../services';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  categories$: Observable<Category[]>;
  loading = true;

  constructor(private categoryService: CategoryService) {
    this.categories$ = this.categoryService.getActiveCategories();
  }

  ngOnInit(): void {
    // Simulate loading delay for better UX
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  onCategoryClick(category: Category): void {
    // Navigation will be handled by routerLink in template
    console.log('Category clicked:', category.name);
  }

  trackByCategory(index: number, category: Category): string {
    return category.id;
  }
}