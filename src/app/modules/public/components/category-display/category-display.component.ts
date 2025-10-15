import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, switchMap, map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Category, ReferralOffer, PaginatedResponse, SortDirection } from '../../../../models';
import { CategoryService, ReferralService } from '../../../../services';
import { HtmlSanitizerService } from '../../../../services/html-sanitizer.service';
import { SEOService } from '../../../../services/seo.service';

@Component({
  selector: 'app-category-display',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './category-display.component.html',
  styleUrl: './category-display.component.scss'
})
export class CategoryDisplayComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  category$: Observable<Category | undefined>;
  offers$: Observable<PaginatedResponse<ReferralOffer>>;
  
  categoryId: string = '';
  searchTerm: string = '';
  currentPage = 1;
  pageSize = 6;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private referralService: ReferralService,
    private htmlSanitizer: HtmlSanitizerService,
    private seoService: SEOService
  ) {
    // Get category from route params
    this.category$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => {
        this.categoryId = id;
        return this.categoryService.getCategoryById(id);
      })
    );

    // Set up offers observable with search and pagination
    this.offers$ = combineLatest([
      this.route.params.pipe(map(params => params['id'])),
      this.getSearchObservable(),
      this.getPaginationObservable()
    ]).pipe(
      switchMap(([categoryId, searchTerm, pagination]) => {
        return this.referralService.getOffers({
          categoryId,
          searchTerm,
          isActive: true,
          page: pagination.page,
          limit: pagination.pageSize,
          sortBy: 'updatedAt',
          sortDirection: SortDirection.DESC
        });
      })
    );
  }

  ngOnInit(): void {
    // Check if category exists, redirect if not
    this.category$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (category) => {
        if (category === undefined) {
          // Category not found, redirect to 404
          this.router.navigate(['/404']);
        } else {
          this.loading = false;
          
          // Update SEO meta tags for category page
          this.updateCategorySEO(category);
        }
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.loading = false;
        this.router.navigate(['/error']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getSearchObservable(): Observable<string> {
    return new Observable<string>(observer => {
      observer.next(this.searchTerm);
      return () => {};
    }).pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    );
  }

  private getPaginationObservable(): Observable<{ page: number; pageSize: number }> {
    return new Observable<{ page: number; pageSize: number }>(observer => {
      observer.next({ page: this.currentPage, pageSize: this.pageSize });
      return () => {};
    }).pipe(
      startWith({ page: 1, pageSize: 6 })
    );
  }

  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.refreshOffers();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.refreshOffers();
  }

  onOfferClick(offer: ReferralOffer): void {
    try {
      // Track click and redirect to referral link
      this.referralService.trackClick(offer.id).subscribe({
        next: () => {
          console.log('Click tracked successfully');
        },
        error: (error) => {
          console.error('Failed to track click:', error);
          // Still proceed with opening the link
        }
      });
      
      // Open referral link
      const opened = window.open(offer.referralLink, '_blank', 'noopener,noreferrer');
      
      // Check if popup was blocked
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        // Fallback: navigate in same tab
        window.location.href = offer.referralLink;
      }
    } catch (error) {
      console.error('Error opening referral link:', error);
      // Fallback: try direct navigation
      try {
        window.location.href = offer.referralLink;
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
        alert('Unable to open referral link. Please try again or copy the link manually.');
      }
    }
  }

  onGetOfferClick(event: Event, offer: ReferralOffer): void {
    event.stopPropagation(); // Prevent card click from firing
    this.onOfferClick(offer);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  trackByOffer(index: number, offer: ReferralOffer): string {
    return offer.id;
  }

  getSanitizedDescription(description: string): string {
    return this.htmlSanitizer.sanitize(description);
  }

  private refreshOffers(): void {
    // Trigger refresh by emitting new values
    this.offers$ = this.referralService.getOffers({
      categoryId: this.categoryId,
      searchTerm: this.searchTerm,
      isActive: true,
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: 'updatedAt',
      sortDirection: SortDirection.DESC
    });
  }

  private updateCategorySEO(category: Category): void {
    const categoryKeywords = this.getCategoryKeywords(category.id);
    const title = `${category.name} Referral Offers - Best ${category.name} Cashback Deals`;
    const description = `Find the best ${category.name.toLowerCase()} referral offers and cashback deals. ${category.description || 'Discover exclusive bonuses and rewards.'} Start earning today!`;

    this.seoService.updateSEO({
      title,
      description,
      keywords: `${category.name.toLowerCase()}, ${categoryKeywords}, referral offers, cashback, rewards, bonuses`,
      url: `https://uumair327.github.io/referral-reward-dashboard/category/${category.id}`,
      type: 'website',
      image: 'https://uumair327.github.io/referral-reward-dashboard/assets/og-image.png'
    });

    // Add category-specific structured data
    this.seoService.addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': title,
      'description': description,
      'url': `https://uumair327.github.io/referral-reward-dashboard/category/${category.id}`,
      'mainEntity': {
        '@type': 'ItemList',
        'name': `${category.name} Referral Offers`,
        'description': `Collection of ${category.name.toLowerCase()} referral offers and cashback deals`
      }
    });
  }

  private getCategoryKeywords(categoryId: string): string {
    const keywordMap: { [key: string]: string } = {
      'demat-account': 'demat account referral, stock trading, investment, zerodha, upstox, groww, angel broking',
      'medical-app': 'medical app offers, healthcare, telemedicine, doctor consultation, health insurance',
      'hospitality-hotel': 'hotel booking, travel deals, accommodation, booking.com, makemytrip, oyo',
      'entertainment': 'entertainment deals, streaming, movies, music, netflix, amazon prime, spotify',
      'online-products': 'online shopping, e-commerce, amazon, flipkart, cashback, shopping deals'
    };
    
    return keywordMap[categoryId] || 'referral programs, affiliate offers, bonus deals';
  }
}