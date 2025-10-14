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
    private referralService: ReferralService
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
    ).subscribe(category => {
      if (category === undefined) {
        this.router.navigate(['/']);
      } else {
        this.loading = false;
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
    // Track click and redirect to referral link
    this.referralService.trackClick(offer.id).subscribe();
    window.open(offer.referralLink, '_blank', 'noopener,noreferrer');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  trackByOffer(index: number, offer: ReferralOffer): string {
    return offer.id;
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
}