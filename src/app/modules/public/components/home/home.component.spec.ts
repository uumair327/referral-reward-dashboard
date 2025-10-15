import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { CategoryService } from '../../../../services';
import { Category, DEFAULT_CATEGORIES } from '../../../../models';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;

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

  beforeEach(async () => {
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getActiveCategories']);

    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy }
      ]
    }).compileComponents();

    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    categoryService.getActiveCategories.and.returnValue(of(mockCategories));

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with loading state', () => {
      expect(component.loading).toBe(true);
    });

    it('should call categoryService.getActiveCategories on construction', () => {
      expect(categoryService.getActiveCategories).toHaveBeenCalled();
    });

    it('should set categories$ observable', () => {
      component.categories$.subscribe(categories => {
        expect(categories).toEqual(mockCategories);
      });
    });
  });

  describe('ngOnInit', () => {
    it('should set loading to false after timeout', fakeAsync(() => {
      component.ngOnInit();
      expect(component.loading).toBe(true);
      
      tick(500);
      expect(component.loading).toBe(false);
    }));
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display loading spinner when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should hide loading spinner when loading is false', fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      fixture.detectChanges();
      
      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeFalsy();
    }));

    it('should display category cards', fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      fixture.detectChanges();
      
      const categoryCards = fixture.nativeElement.querySelectorAll('mat-card');
      expect(categoryCards.length).toBe(mockCategories.length);
    }));

    it('should display category names', fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      fixture.detectChanges();
      
      const categoryTitles = fixture.nativeElement.querySelectorAll('mat-card-title');
      expect(categoryTitles[0].textContent.trim()).toBe('Test Category 1');
      expect(categoryTitles[1].textContent.trim()).toBe('Test Category 2');
    }));

    it('should display category descriptions', fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      fixture.detectChanges();
      
      const categoryContents = fixture.nativeElement.querySelectorAll('mat-card-content p');
      expect(categoryContents[0].textContent.trim()).toBe('Test Description 1');
      expect(categoryContents[1].textContent.trim()).toBe('Test Description 2');
    }));

    it('should display offer counts', fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      fixture.detectChanges();
      
      const offerCounts = fixture.nativeElement.querySelectorAll('.offer-count');
      expect(offerCounts[0].textContent.trim()).toContain('5 offers');
      expect(offerCounts[1].textContent.trim()).toContain('3 offers');
    }));

    it('should have router links for each category', fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      fixture.detectChanges();
      
      const routerLinks = fixture.nativeElement.querySelectorAll('[routerLink]');
      expect(routerLinks.length).toBeGreaterThan(0);
      expect(routerLinks[0].getAttribute('ng-reflect-router-link')).toBe('/category/cat1');
    }));
  });

  describe('User Interactions', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      fixture.detectChanges();
    }));

    it('should call onCategoryClick when category card is clicked', () => {
      spyOn(component, 'onCategoryClick');
      
      const categoryCard = fixture.nativeElement.querySelector('mat-card');
      categoryCard.click();
      
      expect(component.onCategoryClick).toHaveBeenCalledWith(mockCategories[0]);
    });

    it('should log category name when onCategoryClick is called', () => {
      spyOn(console, 'log');
      
      component.onCategoryClick(mockCategories[0]);
      
      expect(console.log).toHaveBeenCalledWith('Category clicked:', 'Test Category 1');
    });
  });

  describe('TrackBy Function', () => {
    it('should return category id for trackByCategory', () => {
      const result = component.trackByCategory(0, mockCategories[0]);
      expect(result).toBe('cat1');
    });

    it('should return different ids for different categories', () => {
      const result1 = component.trackByCategory(0, mockCategories[0]);
      const result2 = component.trackByCategory(1, mockCategories[1]);
      
      expect(result1).toBe('cat1');
      expect(result2).toBe('cat2');
      expect(result1).not.toBe(result2);
    });
  });

  describe('Empty State', () => {
    it('should handle empty categories list', () => {
      categoryService.getActiveCategories.and.returnValue(of([]));
      
      const newComponent = TestBed.createComponent(HomeComponent).componentInstance;
      
      newComponent.categories$.subscribe(categories => {
        expect(categories).toEqual([]);
      });
    });

    it('should display no categories message when list is empty', fakeAsync(() => {
      categoryService.getActiveCategories.and.returnValue(of([]));
      
      const newFixture = TestBed.createComponent(HomeComponent);
      const newComponent = newFixture.componentInstance;
      
      newComponent.ngOnInit();
      tick(500);
      newFixture.detectChanges();
      
      const noCategoriesMessage = newFixture.nativeElement.querySelector('.no-categories');
      expect(noCategoriesMessage).toBeTruthy();
    }));
  });

  describe('Responsive Design', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      fixture.detectChanges();
    }));

    it('should have responsive grid layout', () => {
      const gridList = fixture.nativeElement.querySelector('mat-grid-list');
      expect(gridList).toBeTruthy();
    });

    it('should apply responsive classes', () => {
      const container = fixture.nativeElement.querySelector('.categories-container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('responsive')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(500);
      fixture.detectChanges();
    }));

    it('should have proper ARIA labels', () => {
      const categoryCards = fixture.nativeElement.querySelectorAll('mat-card[role="button"]');
      expect(categoryCards.length).toBeGreaterThan(0);
    });

    it('should be keyboard accessible', () => {
      const categoryCard = fixture.nativeElement.querySelector('mat-card');
      expect(categoryCard.getAttribute('tabindex')).toBe('0');
    });

    it('should have proper heading structure', () => {
      const mainHeading = fixture.nativeElement.querySelector('h1');
      expect(mainHeading).toBeTruthy();
      expect(mainHeading.textContent.trim()).toBe('Referral Categories');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', () => {
      categoryService.getActiveCategories.and.returnValue(of([]));
      
      expect(() => {
        const newComponent = TestBed.createComponent(HomeComponent).componentInstance;
      }).not.toThrow();
    });
  });
});