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
import { SEOService } from '../../../../services/seo.service';

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

  constructor(
    private categoryService: CategoryService,
    private seoService: SEOService
  ) {
    this.categories$ = this.categoryService.getActiveCategories();
  }

  ngOnInit(): void {
    // Set SEO meta tags for homepage
    this.seoService.updateSEO({
      title: 'Best Referral Offers & Rewards Dashboard - Earn Cashback & Bonuses',
      description: 'Find the best referral offers, cashback deals, and reward programs. Browse demat accounts, medical apps, hotels, entertainment, and online shopping referrals. Start earning today!',
      keywords: 'referral offers, cashback, rewards, referral codes, demat account referral, medical app offers, hotel booking cashback, entertainment deals, online shopping rewards, affiliate programs, bonus offers, earn money online',
      url: 'https://uumair327.github.io/referral-reward-dashboard/',
      type: 'website',
      image: 'https://uumair327.github.io/referral-reward-dashboard/assets/og-image.png'
    });

    // Add structured data for homepage
    this.seoService.addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Referral & Rewards Dashboard',
      'url': 'https://uumair327.github.io/referral-reward-dashboard/',
      'description': 'Find the best referral offers, cashback deals, and reward programs across various categories.',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://uumair327.github.io/referral-reward-dashboard/?search={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    });

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