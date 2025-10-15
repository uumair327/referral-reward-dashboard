import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { OfferManagementComponent } from './offer-management.component';
import { ReferralService, CategoryService, ValidationService } from '../../../../services';
import { 
  ReferralOffer, 
  Category, 
  CreateReferralOfferRequest, 
  UpdateReferralOfferRequest,
  PaginatedResponse,
  SortDirection 
} from '../../../../models';

describe('OfferManagementComponent', () => {
  let component: OfferManagementComponent;
  let fixture: ComponentFixture<OfferManagementComponent>;
  let referralService: jasmine.SpyObj<ReferralService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let validationService: jasmine.SpyObj<ValidationService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let activatedRoute: any;

  const mockCategories: Category[] = [
    {
      id: 'cat1',
      name: 'Test Category 1',
      icon: 'account_balance',
      description: 'Test Description 1',
      isActive: true,
      offerCount: 5,
      displayOrder: 1
    },
    {
      id: 'cat2',
      name: 'Test Category 2',
      icon: 'local_hospital',
      description: 'Test Description 2',
      isActive: true,
      offerCount: 3,
      displayOrder: 2
    }
  ];

  const mockOffers: ReferralOffer[] = [
    {
      id: 'offer1',
      title: 'Test Offer 1',
      description: 'Test Description 1',
      referralLink: 'https://example.com/1',
      referralCode: 'TEST1',
      categoryId: 'cat1',
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      clickCount: 10
    },
    {
      id: 'offer2',
      title: 'Test Offer 2',
      description: 'Test Description 2',
      referralLink: 'https://example.com/2',
      referralCode: 'TEST2',
      categoryId: 'cat2',
      isActive: false,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      clickCount: 5
    }
  ];

  const mockPaginatedResponse: PaginatedResponse<ReferralOffer> = {
    data: mockOffers,
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  beforeEach(async () => {
    const referralServiceSpy = jasmine.createSpyObj('ReferralService', [
      'getOffers', 'createOffer', 'updateOffer', 'deleteOffer', 'toggleOfferStatus', 'bulkUpdateOffers'
    ]);
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getActiveCategories']);
    const validationServiceSpy = jasmine.createSpyObj('ValidationService', ['validateReferralOffer']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    activatedRoute = {
      snapshot: {
        queryParams: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        OfferManagementComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ReferralService, useValue: referralServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: ValidationService, useValue: validationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    referralService = TestBed.inject(ReferralService) as jasmine.SpyObj<ReferralService>;
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    referralService.getOffers.and.returnValue(of(mockPaginatedResponse));
    categoryService.getActiveCategories.and.returnValue(of(mockCategories));

    fixture = TestBed.createComponent(OfferManagementComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(10);
      expect(component.sortBy).toBe('updatedAt');
      expect(component.sortDirection).toBe(SortDirection.DESC);
      expect(component.searchTerm).toBe('');
      expect(component.showActiveOnly).toBe(false);
      expect(component.showForm).toBe(false);
      expect(component.editingOffer).toBeNull();
    });

    it('should create offer form with proper validators', () => {
      expect(component.offerForm).toBeDefined();
      expect(component.offerForm.get('title')?.hasError('required')).toBe(true);
      expect(component.offerForm.get('description')?.hasError('required')).toBe(true);
      expect(component.offerForm.get('referralLink')?.hasError('required')).toBe(true);
      expect(component.offerForm.get('categoryId')?.hasError('required')).toBe(true);
    });

    it('should load categories and offers on init', () => {
      fixture.detectChanges();
      expect(categoryService.getActiveCategories).toHaveBeenCalled();
      expect(referralService.getOffers).toHaveBeenCalled();
    });

    it('should set selected category from route params', () => {
      activatedRoute.snapshot.queryParams = { category: 'cat1' };
      
      fixture.detectChanges();
      
      expect(component.selectedCategoryId).toBe('cat1');
    });
  });

  describe('Data Loading', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should refresh offers and update component state', () => {
      component.refreshOffers();
      
      expect(component.offers).toEqual(mockOffers);
      expect(component.totalItems).toBe(2);
      expect(component.loading).toBe(false);
    });

    it('should handle loading errors gracefully', () => {
      referralService.getOffers.and.returnValue(throwError('Service error'));
      
      component.refreshOffers();
      
      expect(snackBar.open).toHaveBeenCalledWith('Error loading offers', 'Close', jasmine.any(Object));
      expect(component.loading).toBe(false);
    });

    it('should call getOffers with correct parameters', () => {
      component.currentPage = 2;
      component.pageSize = 5;
      component.sortBy = 'title';
      component.sortDirection = SortDirection.ASC;
      component.searchTerm = 'test';
      component.selectedCategoryId = 'cat1';
      component.showActiveOnly = true;
      
      component.refreshOffers();
      
      expect(referralService.getOffers).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        sortBy: 'title',
        sortDirection: SortDirection.ASC,
        searchTerm: 'test',
        categoryId: 'cat1',
        isActive: true
      });
    });

    it('should clear selected offers on refresh', () => {
      component.selectedOffers.add('offer1');
      
      component.refreshOffers();
      
      expect(component.selectedOffers.size).toBe(0);
    });
  });

  describe('Pagination and Sorting', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle page change', () => {
      spyOn(component, 'refreshOffers');
      const pageEvent = { pageIndex: 2, pageSize: 5, length: 20 };
      
      component.onPageChange(pageEvent);
      
      expect(component.currentPage).toBe(3);
      expect(component.pageSize).toBe(5);
      expect(component.refreshOffers).toHaveBeenCalled();
    });

    it('should handle sort change', () => {
      spyOn(component, 'refreshOffers');
      const sortEvent = { active: 'title', direction: 'asc' as any };
      
      component.onSortChange(sortEvent);
      
      expect(component.sortBy).toBe('title');
      expect(component.sortDirection).toBe(SortDirection.ASC);
      expect(component.refreshOffers).toHaveBeenCalled();
    });

    it('should reset to first page on search change', () => {
      spyOn(component, 'refreshOffers');
      component.currentPage = 3;
      
      component.onSearchChange();
      
      expect(component.currentPage).toBe(1);
      expect(component.refreshOffers).toHaveBeenCalled();
    });

    it('should reset to first page on filter change', () => {
      spyOn(component, 'refreshOffers');
      component.currentPage = 3;
      
      component.onFilterChange();
      
      expect(component.currentPage).toBe(1);
      expect(component.refreshOffers).toHaveBeenCalled();
    });

    it('should handle category change', () => {
      spyOn(component, 'refreshOffers');
      component.selectedCategoryId = 'cat2';
      component.currentPage = 3;
      
      component.onCategoryChange();
      
      expect(component.selectedCategory).toBe(mockCategories[1]);
      expect(component.currentPage).toBe(1);
      expect(component.refreshOffers).toHaveBeenCalled();
    });
  });

  describe('Selection Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.offers = mockOffers;
    });

    it('should check if all offers are selected', () => {
      component.selectedOffers.clear();
      expect(component.isAllSelected()).toBe(false);
      
      mockOffers.forEach(offer => component.selectedOffers.add(offer.id));
      expect(component.isAllSelected()).toBe(true);
    });

    it('should check indeterminate state', () => {
      component.selectedOffers.clear();
      expect(component.isIndeterminate()).toBe(false);
      
      component.selectedOffers.add(mockOffers[0].id);
      expect(component.isIndeterminate()).toBe(true);
      
      mockOffers.forEach(offer => component.selectedOffers.add(offer.id));
      expect(component.isIndeterminate()).toBe(false);
    });

    it('should toggle all selection', () => {
      component.selectedOffers.clear();
      
      component.toggleAllSelection();
      expect(component.selectedOffers.size).toBe(mockOffers.length);
      
      component.toggleAllSelection();
      expect(component.selectedOffers.size).toBe(0);
    });

    it('should toggle individual offer selection', () => {
      const offerId = mockOffers[0].id;
      
      component.toggleOfferSelection(offerId);
      expect(component.isOfferSelected(offerId)).toBe(true);
      
      component.toggleOfferSelection(offerId);
      expect(component.isOfferSelected(offerId)).toBe(false);
    });
  });

  describe('Form Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show add form with reset values', () => {
      component.selectedCategoryId = 'cat1';
      
      component.showAddForm();
      
      expect(component.showForm).toBe(true);
      expect(component.editingOffer).toBeNull();
      expect(component.offerForm.get('title')?.value).toBe('');
      expect(component.offerForm.get('categoryId')?.value).toBe('cat1');
      expect(component.offerForm.get('isActive')?.value).toBe(true);
    });

    it('should show edit form with offer values', () => {
      const offer = mockOffers[0];
      
      component.editOffer(offer);
      
      expect(component.showForm).toBe(true);
      expect(component.editingOffer).toBe(offer);
      expect(component.offerForm.get('title')?.value).toBe(offer.title);
      expect(component.offerForm.get('description')?.value).toBe(offer.description);
      expect(component.offerForm.get('referralLink')?.value).toBe(offer.referralLink);
    });

    it('should cancel edit and reset form', () => {
      component.showForm = true;
      component.editingOffer = mockOffers[0];
      
      component.cancelEdit();
      
      expect(component.showForm).toBe(false);
      expect(component.editingOffer).toBeNull();
    });

    it('should not save if form is invalid', () => {
      component.offerForm.patchValue({ title: '' }); // Invalid form
      
      component.saveOffer();
      
      expect(referralService.createOffer).not.toHaveBeenCalled();
      expect(referralService.updateOffer).not.toHaveBeenCalled();
    });
  });

  describe('Offer Creation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create new offer successfully', () => {
      const createRequest: CreateReferralOfferRequest = {
        title: 'New Offer',
        description: 'New Description',
        referralLink: 'https://example.com/new',
        referralCode: 'NEW123',
        categoryId: 'cat1'
      };
      
      referralService.createOffer.and.returnValue(of({ success: true, data: mockOffers[0] }));
      spyOn(component, 'refreshOffers');
      
      component.offerForm.patchValue(createRequest);
      component.saveOffer();
      
      expect(referralService.createOffer).toHaveBeenCalledWith(jasmine.objectContaining(createRequest));
      expect(snackBar.open).toHaveBeenCalledWith('Offer created successfully', 'Close', jasmine.any(Object));
      expect(component.refreshOffers).toHaveBeenCalled();
    });

    it('should handle creation errors', () => {
      referralService.createOffer.and.returnValue(of({ success: false, error: 'Creation failed' }));
      
      component.offerForm.patchValue({
        title: 'New Offer',
        description: 'New Description',
        referralLink: 'https://example.com/new',
        categoryId: 'cat1'
      });
      component.saveOffer();
      
      expect(snackBar.open).toHaveBeenCalledWith('Creation failed', 'Close', jasmine.any(Object));
    });
  });

  describe('Offer Updates', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update existing offer successfully', () => {
      const offer = mockOffers[0];
      const updateRequest: UpdateReferralOfferRequest = {
        id: offer.id,
        title: 'Updated Title',
        description: 'Updated Description'
      };
      
      referralService.updateOffer.and.returnValue(of({ success: true, data: offer }));
      spyOn(component, 'refreshOffers');
      
      component.editingOffer = offer;
      component.offerForm.patchValue(updateRequest);
      component.saveOffer();
      
      expect(referralService.updateOffer).toHaveBeenCalledWith(jasmine.objectContaining(updateRequest));
      expect(snackBar.open).toHaveBeenCalledWith('Offer updated successfully', 'Close', jasmine.any(Object));
      expect(component.refreshOffers).toHaveBeenCalled();
    });

    it('should toggle offer status', () => {
      const offer = mockOffers[0];
      const updatedOffer = { ...offer, isActive: false };
      
      referralService.toggleOfferStatus.and.returnValue(of({ success: true, data: updatedOffer }));
      spyOn(component, 'refreshOffers');
      
      component.toggleOfferStatus(offer);
      
      expect(referralService.toggleOfferStatus).toHaveBeenCalledWith(offer.id);
      expect(snackBar.open).toHaveBeenCalledWith('Offer deactivated', 'Close', jasmine.any(Object));
      expect(component.refreshOffers).toHaveBeenCalled();
    });
  });

  describe('Offer Deletion', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should delete offer after confirmation', () => {
      const offer = mockOffers[0];
      spyOn(window, 'confirm').and.returnValue(true);
      referralService.deleteOffer.and.returnValue(of({ success: true }));
      spyOn(component, 'refreshOffers');
      
      component.deleteOffer(offer);
      
      expect(window.confirm).toHaveBeenCalledWith(`Are you sure you want to delete "${offer.title}"?`);
      expect(referralService.deleteOffer).toHaveBeenCalledWith(offer.id);
      expect(snackBar.open).toHaveBeenCalledWith('Offer deleted successfully', 'Close', jasmine.any(Object));
      expect(component.refreshOffers).toHaveBeenCalled();
    });

    it('should not delete if user cancels confirmation', () => {
      const offer = mockOffers[0];
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.deleteOffer(offer);
      
      expect(referralService.deleteOffer).not.toHaveBeenCalled();
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedOffers.add('offer1');
      component.selectedOffers.add('offer2');
    });

    it('should bulk activate selected offers', () => {
      referralService.bulkUpdateOffers.and.returnValue(of({ success: true, data: mockOffers }));
      spyOn(component, 'refreshOffers');
      
      component.bulkActivate();
      
      expect(referralService.bulkUpdateOffers).toHaveBeenCalledWith(['offer1', 'offer2'], { isActive: true });
      expect(snackBar.open).toHaveBeenCalledWith('2 offers activated', 'Close', jasmine.any(Object));
      expect(component.selectedOffers.size).toBe(0);
      expect(component.refreshOffers).toHaveBeenCalled();
    });

    it('should bulk deactivate selected offers', () => {
      referralService.bulkUpdateOffers.and.returnValue(of({ success: true, data: mockOffers }));
      spyOn(component, 'refreshOffers');
      
      component.bulkDeactivate();
      
      expect(referralService.bulkUpdateOffers).toHaveBeenCalledWith(['offer1', 'offer2'], { isActive: false });
      expect(snackBar.open).toHaveBeenCalledWith('2 offers deactivated', 'Close', jasmine.any(Object));
    });

    it('should not perform bulk operations if no offers selected', () => {
      component.selectedOffers.clear();
      
      component.bulkActivate();
      
      expect(referralService.bulkUpdateOffers).not.toHaveBeenCalled();
    });

    it('should bulk delete selected offers', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      referralService.deleteOffer.and.returnValue(of({ success: true }));
      spyOn(component, 'refreshOffers');
      
      component.bulkDelete();
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete 2 selected offers?');
      expect(referralService.deleteOffer).toHaveBeenCalledTimes(2);
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should open offer link in new window', () => {
      spyOn(window, 'open');
      const offer = mockOffers[0];
      
      component.openOfferLink(offer);
      
      expect(window.open).toHaveBeenCalledWith(offer.referralLink, '_blank', 'noopener,noreferrer');
    });

    it('should copy referral code to clipboard', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      
      component.copyReferralCode('TEST123');
      
      await fixture.whenStable();
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TEST123');
      expect(snackBar.open).toHaveBeenCalledWith('Referral code copied to clipboard', 'Close', jasmine.any(Object));
    });

    it('should get category name by id', () => {
      const categoryName = component.getCategoryName('cat1');
      expect(categoryName).toBe('Test Category 1');
      
      const unknownName = component.getCategoryName('unknown');
      expect(unknownName).toBe('Unknown');
    });

    it('should get category icon by id', () => {
      const categoryIcon = component.getCategoryIcon('cat1');
      expect(categoryIcon).toBe('account_balance');
      
      const unknownIcon = component.getCategoryIcon('unknown');
      expect(unknownIcon).toBe('category');
    });

    it('should format date correctly', () => {
      const date = new Date('2023-06-15T10:30:00');
      const formatted = component.formatDate(date);
      
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2023');
    });

    it('should track offers by id', () => {
      const offer = mockOffers[0];
      
      const result = component.trackByOffer(0, offer);
      
      expect(result).toBe(offer.id);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return correct error messages for required fields', () => {
      component.offerForm.get('title')?.markAsTouched();
      
      const errorMessage = component.getFormErrorMessage('title');
      
      expect(errorMessage).toBe('title is required');
    });

    it('should return correct error messages for maxlength validation', () => {
      const titleControl = component.offerForm.get('title');
      titleControl?.setValue('a'.repeat(101)); // Exceeds maxlength
      titleControl?.markAsTouched();
      
      const errorMessage = component.getFormErrorMessage('title');
      
      expect(errorMessage).toContain('must be less than');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle service errors during initialization', () => {
      referralService.getOffers.and.returnValue(throwError('Init error'));
      
      expect(() => {
        component.ngOnInit();
      }).not.toThrow();
    });

    it('should handle clipboard errors gracefully', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject('Clipboard error'));
      spyOn(console, 'error');
      
      component.copyReferralCode('TEST123');
      
      await fixture.whenStable();
      
      expect(snackBar.open).toHaveBeenCalledWith('Failed to copy referral code', 'Close', jasmine.any(Object));
    });
  });

  describe('Component Lifecycle', () => {
    it('should complete destroy subject on ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
   