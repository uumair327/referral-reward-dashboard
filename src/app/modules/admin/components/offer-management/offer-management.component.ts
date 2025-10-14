import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { 
  ReferralOffer, 
  CreateReferralOfferRequest, 
  UpdateReferralOfferRequest,
  Category,
  PaginatedResponse,
  SortDirection 
} from '../../../../models';
import { ReferralService, CategoryService, ValidationService } from '../../../../services';

@Component({
  selector: 'app-offer-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatMenuModule
  ],
  templateUrl: './offer-management.component.html',
  styleUrl: './offer-management.component.scss'
})
export class OfferManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = ['select', 'title', 'referralCode', 'referralLink', 'clickCount', 'isActive', 'updatedAt', 'actions'];
  offers: ReferralOffer[] = [];
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  
  // Selection
  selectedOffers = new Set<string>();
  
  // Pagination and sorting
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  sortBy = 'updatedAt';
  sortDirection: SortDirection = SortDirection.DESC;
  
  // Filtering
  searchTerm = '';
  showActiveOnly = false;
  selectedCategoryId = '';
  
  // Form for adding/editing offers
  offerForm: FormGroup;
  editingOffer: ReferralOffer | null = null;
  showForm = false;
  
  // Loading states
  loading = false;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private referralService: ReferralService,
    private categoryService: CategoryService,
    private validationService: ValidationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.offerForm = this.createOfferForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.refreshOffers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createOfferForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      referralLink: ['', [Validators.required]],
      referralCode: ['', [Validators.maxLength(50)]],
      categoryId: ['', [Validators.required]],
      isActive: [true]
    });
  }

  private loadCategories(): void {
    this.categoryService.getActiveCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (categories) => {
        this.categories = categories;
        // Set default category if specified in route
        const categoryId = this.route.snapshot.queryParams['category'];
        if (categoryId) {
          this.selectedCategoryId = categoryId;
          this.selectedCategory = categories.find(c => c.id === categoryId) || null;
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showSnackBar('Error loading categories');
      }
    });
  }

  refreshOffers(): void {
    this.loading = true;
    this.selectedOffers.clear();
    
    this.referralService.getOffers({
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm,
      categoryId: this.selectedCategoryId || undefined,
      isActive: this.showActiveOnly ? true : undefined
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.offers = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.showSnackBar('Error loading offers');
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.refreshOffers();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction === 'desc' ? SortDirection.DESC : SortDirection.ASC;
    this.refreshOffers();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.refreshOffers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.refreshOffers();
  }

  onCategoryChange(): void {
    this.selectedCategory = this.categories.find(c => c.id === this.selectedCategoryId) || null;
    this.currentPage = 1;
    this.refreshOffers();
  }

  // Selection methods
  isAllSelected(): boolean {
    return this.offers.length > 0 && this.selectedOffers.size === this.offers.length;
  }

  isIndeterminate(): boolean {
    return this.selectedOffers.size > 0 && this.selectedOffers.size < this.offers.length;
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selectedOffers.clear();
    } else {
      this.offers.forEach(offer => this.selectedOffers.add(offer.id));
    }
  }

  toggleOfferSelection(offerId: string): void {
    if (this.selectedOffers.has(offerId)) {
      this.selectedOffers.delete(offerId);
    } else {
      this.selectedOffers.add(offerId);
    }
  }

  isOfferSelected(offerId: string): boolean {
    return this.selectedOffers.has(offerId);
  }

  // Form methods
  showAddForm(): void {
    this.editingOffer = null;
    this.offerForm.reset({
      title: '',
      description: '',
      referralLink: '',
      referralCode: '',
      categoryId: this.selectedCategoryId || '',
      isActive: true
    });
    this.showForm = true;
  }

  editOffer(offer: ReferralOffer): void {
    this.editingOffer = offer;
    this.offerForm.patchValue({
      title: offer.title,
      description: offer.description,
      referralLink: offer.referralLink,
      referralCode: offer.referralCode || '',
      categoryId: offer.categoryId,
      isActive: offer.isActive
    });
    this.showForm = true;
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingOffer = null;
    this.offerForm.reset();
  }

  saveOffer(): void {
    if (this.offerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    const formValue = this.offerForm.value;

    if (this.editingOffer) {
      // Update existing offer
      const updateRequest: UpdateReferralOfferRequest = {
        id: this.editingOffer.id,
        ...formValue
      };

      this.referralService.updateOffer(updateRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar('Offer updated successfully');
            this.cancelEdit();
            this.refreshOffers();
          } else {
            this.showSnackBar(response.error || 'Error updating offer');
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error updating offer:', error);
          this.showSnackBar('Error updating offer');
          this.saving = false;
        }
      });
    } else {
      // Create new offer
      const createRequest: CreateReferralOfferRequest = formValue;

      this.referralService.createOffer(createRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar('Offer created successfully');
            this.cancelEdit();
            this.refreshOffers();
          } else {
            this.showSnackBar(response.error || 'Error creating offer');
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating offer:', error);
          this.showSnackBar('Error creating offer');
          this.saving = false;
        }
      });
    }
  }

  toggleOfferStatus(offer: ReferralOffer): void {
    this.referralService.toggleOfferStatus(offer.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSnackBar(`Offer ${response.data?.isActive ? 'activated' : 'deactivated'}`);
          this.refreshOffers();
        } else {
          this.showSnackBar(response.error || 'Error updating offer status');
        }
      },
      error: (error) => {
        console.error('Error updating offer status:', error);
        this.showSnackBar('Error updating offer status');
      }
    });
  }

  deleteOffer(offer: ReferralOffer): void {
    if (confirm(`Are you sure you want to delete "${offer.title}"?`)) {
      this.referralService.deleteOffer(offer.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar('Offer deleted successfully');
            this.refreshOffers();
          } else {
            this.showSnackBar(response.error || 'Error deleting offer');
          }
        },
        error: (error) => {
          console.error('Error deleting offer:', error);
          this.showSnackBar('Error deleting offer');
        }
      });
    }
  }

  // Bulk operations
  bulkActivate(): void {
    if (this.selectedOffers.size === 0) return;
    
    const offerIds = Array.from(this.selectedOffers);
    this.referralService.bulkUpdateOffers(offerIds, { isActive: true }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSnackBar(`${response.data?.length} offers activated`);
          this.selectedOffers.clear();
          this.refreshOffers();
        } else {
          this.showSnackBar(response.error || 'Error activating offers');
        }
      },
      error: (error) => {
        console.error('Error activating offers:', error);
        this.showSnackBar('Error activating offers');
      }
    });
  }

  bulkDeactivate(): void {
    if (this.selectedOffers.size === 0) return;
    
    const offerIds = Array.from(this.selectedOffers);
    this.referralService.bulkUpdateOffers(offerIds, { isActive: false }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSnackBar(`${response.data?.length} offers deactivated`);
          this.selectedOffers.clear();
          this.refreshOffers();
        } else {
          this.showSnackBar(response.error || 'Error deactivating offers');
        }
      },
      error: (error) => {
        console.error('Error deactivating offers:', error);
        this.showSnackBar('Error deactivating offers');
      }
    });
  }

  bulkDelete(): void {
    if (this.selectedOffers.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedOffers.size} selected offers?`)) {
      const deletePromises = Array.from(this.selectedOffers).map(id => 
        this.referralService.deleteOffer(id).toPromise()
      );
      
      Promise.all(deletePromises).then(() => {
        this.showSnackBar(`${this.selectedOffers.size} offers deleted`);
        this.selectedOffers.clear();
        this.refreshOffers();
      }).catch(error => {
        console.error('Error deleting offers:', error);
        this.showSnackBar('Error deleting some offers');
      });
    }
  }

  openOfferLink(offer: ReferralOffer): void {
    window.open(offer.referralLink, '_blank', 'noopener,noreferrer');
  }

  copyReferralCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.showSnackBar('Referral code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy code:', err);
      this.showSnackBar('Failed to copy referral code');
    });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.icon : 'category';
  }

  getFormErrorMessage(fieldName: string): string {
    const field = this.offerForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength']?.requiredLength;
      return `${fieldName} must be less than ${maxLength} characters`;
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.offerForm.controls).forEach(key => {
      const control = this.offerForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  trackByOffer(index: number, offer: ReferralOffer): string {
    return offer.id;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}