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
    // Subscribe to categories to stop loading when they're available
    this.categories$.subscribe(categories => {
      if (categories && categories.length > 0) {
        this.loading = false;
      } else {
        // If no categories, still stop loading after a short delay
        setTimeout(() => {
          this.loading = false;
        }, 1000);
      }
    });
  }

  onCategoryClick(category: Category): void {
    // Navigation will be handled by routerLink in template
    console.log('Category clicked:', category.name);
  }

  trackByCategory(index: number, category: Category): string {
    return category.id;
  }
}