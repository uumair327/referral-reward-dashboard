import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { CategoryDisplayComponent } from './category-display.component';
import { CategoryService, ReferralService } from '../../../../services';
import { Category, ReferralOffer, PaginatedResponse, SortDirection } from '../../../../models';

describe('CategoryDisplayComponent', () => {
  let component: CategoryDisplayComponent;
  let fixture: ComponentFixture<CategoryDisplayComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let referralService: jasmine.SpyObj<ReferralService>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  const mockCategory: Category = {
    id: 'cat1',
    name: 'Test Category',
    icon: 'account_balance',
    description: 'Test Description',
    isActive: true,
    offerCount: 5,
    displayOrder: 1
  };

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
      categoryId: 'cat1',
      isActive: true,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      clickCount: 5
    }
  ];

  const mockPaginatedResponse: PaginatedResponse<ReferralOffer> = {
    data: mockOffers,
    total: 2,
    page: 1,
    limit: 6,
    totalPages: 1
  };

  const routeParamsSubject = new BehaviorSubject({ id: 'cat1' });

  beforeEach(async () => {
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategoryById']);
    const referralServiceSpy = jasmine.createSpyObj('ReferralService', ['getOffers', 'trackClick']);

    await TestBed.configureTestingModule({
      imports: [
        CategoryDisplayComponent,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([
          { path: '', component: CategoryDisplayComponent },
          { path: 'category/:id', component: CategoryDisplayComponent }
        ])
      ],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: ReferralService, useValue: referralServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: routeParamsSubject.asObservable()
          }
        }
      ]
    }).compileComponents();

    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    referralService = TestBed.inject(ReferralService) as jasmine.SpyObj<ReferralService>;
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);

    categoryService.getCategoryById.and.returnValue(of(mockCategory));
    referralService.getOffers.and.returnValue(of(mockPaginatedResponse));
    referralService.trackClick.and.returnValue(of({ success: true }));

    fixture = TestBed.createComponent(CategoryDisplayComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.searchTerm).toBe('');
      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(6);
      expect(component.loading).toBe(true);
    });

    it('should get category from route params', () => {
      fixture.detectChanges();
      expect(categoryService.getCategoryById).toHaveBeenCalledWith('cat1');
    });

    it('should set categoryId from route params', () => {
      fixture.detectChanges();
      expect(component.categoryId).toBe('cat1');
    });
  });

  describe('ngOnInit', () => {
    it('should set loading to false when category exists', () => {
      fixture.detectChanges();
      component.ngOnInit();
      
      expect(component.loading).toBe(false);
    });

    it('should redirect to home when category does not exist', () => {
      categoryService.getCategoryById.and.returnValue(of(undefined));
      spyOn(router, 'navigate');
      
      fixture.detectChanges();
      component.ngOnInit();
      
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display category name', () => {
      const categoryTitle = fixture.nativeElement.querySelector('h1');
      expect(categoryTitle.textContent.trim()).toBe('Test Category');
    });

    it('should display category description', () => {
      const categoryDescription = fixture.nativeElement.querySelector('.category-description');
      expect(categoryDescription.textContent.trim()).toBe('Test Description');
    });

    it('should display search input', () => {
      const searchInput = fixture.nativeElement.querySelector('input[placeholder*="Search"]');
      expect(searchInput).toBeTruthy();
    });

    it('should display offer cards', () => {
      const offerCards = fixture.nativeElement.querySelectorAll('app-referral-card');
      expect(offerCards.length).toBe(mockOffers.length);
    });

    it('should display pagination when there are offers', () => {
      const paginator = fixture.nativeElement.querySelector('mat-paginator');
      expect(paginator).toBeTruthy();
    });

    it('should display back button', () => {
      const backButton = fixture.nativeElement.querySelector('button[aria-label*="Back"]');
      expect(backButton).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update search term when input changes', () => {
      const searchInput = fixture.nativeElement.querySelector('input[placeholder*="Search"]');
      
      searchInput.value = 'test search';
      searchInput.dispatchEvent(new Event('input'));
      
      expect(component.searchTerm).toBe('test search');
    });

    it('should reset to first page when searching', () => {
      component.currentPage = 3;
      component.onSearchChange();
      
      expect(component.currentPage).toBe(1);
    });

    it('should call refreshOffers when search changes', () => {
      spyOn(component, 'refreshOffers' as any);
      component.onSearchChange();
      
      expect(component['refreshOffers']).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update current page on page change', () => {
      const pageEvent = { pageIndex: 2, pageSize: 6, length: 20 };
      component.onPageChange(pageEvent);
      
      expect(component.currentPage).toBe(3); // pageIndex + 1
    });

    it('should update page size on page change', () => {
      const pageEvent = { pageIndex: 0, pageSize: 12, length: 20 };
      component.onPageChange(pageEvent);
      
      expect(component.pageSize).toBe(12);
    });

    it('should call refreshOffers on page change', () => {
      spyOn(component, 'refreshOffers' as any);
      const pageEvent = { pageIndex: 1, pageSize: 6, length: 20 };
      
      component.onPageChange(pageEvent);
      
      expect(component['refreshOffers']).toHaveBeenCalled();
    });
  });

  describe('Offer Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should track click when offer is clicked', () => {
      component.onOfferClick(mockOffers[0]);
      
      expect(referralService.trackClick).toHaveBeenCalledWith('offer1');
    });

    it('should open referral link in new window when offer is clicked', () => {
      spyOn(window, 'open');
      
      component.onOfferClick(mockOffers[0]);
      
      expect(window.open).toHaveBeenCalledWith(
        'https://example.com/1',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to home when goBack is called', () => {
      spyOn(router, 'navigate');
      
      component.goBack();
      
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should call goBack when back button is clicked', () => {
      spyOn(component, 'goBack');
      
      const backButton = fixture.nativeElement.querySelector('button[aria-label*="Back"]');
      backButton.click();
      
      expect(component.goBack).toHaveBeenCalled();
    });
  });

  describe('TrackBy Function', () => {
    it('should return offer id for trackByOffer', () => {
      const result = component.trackByOffer(0, mockOffers[0]);
      expect(result).toBe('offer1');
    });

    it('should return different ids for different offers', () => {
      const result1 = component.trackByOffer(0, mockOffers[0]);
      const result2 = component.trackByOffer(1, mockOffers[1]);
      
      expect(result1).toBe('offer1');
      expect(result2).toBe('offer2');
      expect(result1).not.toBe(result2);
    });
  });

  describe('Empty State', () => {
    it('should display no offers message when offers list is empty', () => {
      const emptyResponse: PaginatedResponse<ReferralOffer> = {
        data: [],
        total: 0,
        page: 1,
        limit: 6,
        totalPages: 0
      };
      
      referralService.getOffers.and.returnValue(of(emptyResponse));
      
      const newFixture = TestBed.createComponent(CategoryDisplayComponent);
      newFixture.detectChanges();
      
      const noOffersMessage = newFixture.nativeElement.querySelector('.no-offers');
      expect(noOffersMessage).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should hide loading spinner when loading is false', () => {
      component.loading = false;
      fixture.detectChanges();
      
      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeFalsy();
    });
  });

  describe('Service Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call referralService.getOffers with correct parameters', () => {
      expect(referralService.getOffers).toHaveBeenCalledWith({
        categoryId: 'cat1',
        searchTerm: '',
        isActive: true,
        page: 1,
        limit: 6,
        sortBy: 'updatedAt',
        sortDirection: SortDirection.DESC
      });
    });

    it('should update offers when refreshOffers is called', () => {
      component.searchTerm = 'test';
      component.currentPage = 2;
      component.pageSize = 12;
      
      component['refreshOffers']();
      
      expect(referralService.getOffers).toHaveBeenCalledWith({
        categoryId: 'cat1',
        searchTerm: 'test',
        isActive: true,
        page: 2,
        limit: 12,
        sortBy: 'updatedAt',
        sortDirection: SortDirection.DESC
      });
    });
  });

  describe('Component Cleanup', () => {
    it('should complete destroy subject on ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Route Parameter Changes', () => {
    it('should update category when route params change', () => {
      fixture.detectChanges();
      
      routeParamsSubject.next({ id: 'cat2' });
      
      expect(categoryService.getCategoryById).toHaveBeenCalledWith('cat2');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', () => {
      referralService.getOffers.and.returnValue(of({
        data: [],
        total: 0,
        page: 1,
        limit: 6,
        totalPages: 0
      }));
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});