import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { CategoryManagementComponent } from './category-management.component';
import { CategoryService, ValidationService } from '../../../../services';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, PaginatedResponse, SortDirection } from '../../../../models';

describe('CategoryManagementComponent', () => {
  let component: CategoryManagementComponent;
  let fixture: ComponentFixture<CategoryManagementComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let validationService: jasmine.SpyObj<ValidationService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

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
      isActive: false,
      offerCount: 0,
      displayOrder: 2
    }
  ];

  const mockPaginatedResponse: PaginatedResponse<Category> = {
    data: mockCategories,
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  beforeEach(async () => {
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', [
      'getCategories', 'createCategory', 'updateCategory', 'deleteCategory', 'resetToDefaults'
    ]);
    const validationServiceSpy = jasmine.createSpyObj('ValidationService', ['validateCategory']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        CategoryManagementComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: ValidationService, useValue: validationServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    categoryService.getCategories.and.returnValue(of(mockPaginatedResponse));

    fixture = TestBed.createComponent(CategoryManagementComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(10);
      expect(component.sortBy).toBe('displayOrder');
      expect(component.sortDirection).toBe(SortDirection.ASC);
      expect(component.searchTerm).toBe('');
      expect(component.showActiveOnly).toBe(false);
      expect(component.showForm).toBe(false);
      expect(component.editingCategory).toBeNull();
    });

    it('should create category form with proper validators', () => {
      expect(component.categoryForm).toBeDefined();
      expect(component.categoryForm.get('name')?.hasError('required')).toBe(true);
      expect(component.categoryForm.get('icon')?.hasError('required')).toBe(true);
      expect(component.categoryForm.get('description')?.hasError('required')).toBe(true);
    });

    it('should load categories on init', () => {
      fixture.detectChanges();
      expect(categoryService.getCategories).toHaveBeenCalled();
    });
  });

  describe('Data Loading', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should refresh categories and update component state', () => {
      component.refreshCategories();
      
      expect(component.categoriesData).toEqual(mockCategories);
      expect(component.totalItems).toBe(2);
      expect(component.loading).toBe(false);
    });

    it('should handle loading errors gracefully', () => {
      categoryService.getCategories.and.returnValue(throwError('Service error'));
      
      component.refreshCategories();
      
      expect(snackBar.open).toHaveBeenCalledWith('Error loading categories', 'Close', jasmine.any(Object));
      expect(component.loading).toBe(false);
    });

    it('should call getCategories with correct parameters', () => {
      component.currentPage = 2;
      component.pageSize = 5;
      component.sortBy = 'name';
      component.sortDirection = SortDirection.DESC;
      component.searchTerm = 'test';
      component.showActiveOnly = true;
      
      component.refreshCategories();
      
      expect(categoryService.getCategories).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        sortBy: 'name',
        sortDirection: SortDirection.DESC,
        searchTerm: 'test',
        isActive: true
      });
    });
  });

  describe('Pagination and Sorting', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle page change', () => {
      spyOn(component, 'refreshCategories');
      const pageEvent = { pageIndex: 2, pageSize: 5, length: 20 };
      
      component.onPageChange(pageEvent);
      
      expect(component.currentPage).toBe(3); // pageIndex + 1
      expect(component.pageSize).toBe(5);
      expect(component.refreshCategories).toHaveBeenCalled();
    });

    it('should handle sort change', () => {
      spyOn(component, 'refreshCategories');
      const sortEvent = { active: 'name', direction: 'desc' as any };
      
      component.onSortChange(sortEvent);
      
      expect(component.sortBy).toBe('name');
      expect(component.sortDirection).toBe(SortDirection.DESC);
      expect(component.refreshCategories).toHaveBeenCalled();
    });

    it('should reset to first page on search change', () => {
      spyOn(component, 'refreshCategories');
      component.currentPage = 3;
      
      component.onSearchChange();
      
      expect(component.currentPage).toBe(1);
      expect(component.refreshCategories).toHaveBeenCalled();
    });

    it('should reset to first page on filter change', () => {
      spyOn(component, 'refreshCategories');
      component.currentPage = 3;
      
      component.onFilterChange();
      
      expect(component.currentPage).toBe(1);
      expect(component.refreshCategories).toHaveBeenCalled();
    });
  });

  describe('Form Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show add form with reset values', () => {
      component.showAddForm();
      
      expect(component.showForm).toBe(true);
      expect(component.editingCategory).toBeNull();
      expect(component.categoryForm.get('name')?.value).toBe('');
      expect(component.categoryForm.get('isActive')?.value).toBe(true);
    });

    it('should show edit form with category values', () => {
      const category = mockCategories[0];
      
      component.editCategory(category);
      
      expect(component.showForm).toBe(true);
      expect(component.editingCategory).toBe(category);
      expect(component.categoryForm.get('name')?.value).toBe(category.name);
      expect(component.categoryForm.get('icon')?.value).toBe(category.icon);
    });

    it('should cancel edit and reset form', () => {
      component.showForm = true;
      component.editingCategory = mockCategories[0];
      
      component.cancelEdit();
      
      expect(component.showForm).toBe(false);
      expect(component.editingCategory).toBeNull();
    });

    it('should not save if form is invalid', () => {
      component.categoryForm.patchValue({ name: '' }); // Invalid form
      
      component.saveCategory();
      
      expect(categoryService.createCategory).not.toHaveBeenCalled();
      expect(categoryService.updateCategory).not.toHaveBeenCalled();
    });
  });

  describe('Category Creation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create new category successfully', () => {
      const createRequest: CreateCategoryRequest = {
        name: 'New Category',
        icon: 'new-icon',
        description: 'New Description',
        displayOrder: 1
      };
      
      categoryService.createCategory.and.returnValue(of({ success: true, data: mockCategories[0] }));
      spyOn(component, 'refreshCategories');
      
      component.categoryForm.patchValue(createRequest);
      component.saveCategory();
      
      expect(categoryService.createCategory).toHaveBeenCalledWith(jasmine.objectContaining(createRequest));
      expect(snackBar.open).toHaveBeenCalledWith('Category created successfully', 'Close', jasmine.any(Object));
      expect(component.refreshCategories).toHaveBeenCalled();
    });

    it('should handle creation errors', () => {
      categoryService.createCategory.and.returnValue(of({ success: false, error: 'Creation failed' }));
      
      component.categoryForm.patchValue({
        name: 'New Category',
        icon: 'new-icon',
        description: 'New Description'
      });
      component.saveCategory();
      
      expect(snackBar.open).toHaveBeenCalledWith('Creation failed', 'Close', jasmine.any(Object));
    });

    it('should handle creation service errors', () => {
      categoryService.createCategory.and.returnValue(throwError('Service error'));
      
      component.categoryForm.patchValue({
        name: 'New Category',
        icon: 'new-icon',
        description: 'New Description'
      });
      component.saveCategory();
      
      expect(snackBar.open).toHaveBeenCalledWith('Error creating category', 'Close', jasmine.any(Object));
    });
  });

  describe('Category Updates', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update existing category successfully', () => {
      const category = mockCategories[0];
      const updateRequest: UpdateCategoryRequest = {
        id: category.id,
        name: 'Updated Name',
        description: 'Updated Description'
      };
      
      categoryService.updateCategory.and.returnValue(of({ success: true, data: category }));
      spyOn(component, 'refreshCategories');
      
      component.editingCategory = category;
      component.categoryForm.patchValue(updateRequest);
      component.saveCategory();
      
      expect(categoryService.updateCategory).toHaveBeenCalledWith(jasmine.objectContaining(updateRequest));
      expect(snackBar.open).toHaveBeenCalledWith('Category updated successfully', 'Close', jasmine.any(Object));
      expect(component.refreshCategories).toHaveBeenCalled();
    });

    it('should toggle category status', () => {
      const category = mockCategories[0];
      const updatedCategory = { ...category, isActive: false };
      
      categoryService.updateCategory.and.returnValue(of({ success: true, data: updatedCategory }));
      spyOn(component, 'refreshCategories');
      
      component.toggleCategoryStatus(category);
      
      expect(categoryService.updateCategory).toHaveBeenCalledWith({
        id: category.id,
        isActive: false
      });
      expect(snackBar.open).toHaveBeenCalledWith('Category deactivated', 'Close', jasmine.any(Object));
      expect(component.refreshCategories).toHaveBeenCalled();
    });

    it('should handle update errors', () => {
      const category = mockCategories[0];
      categoryService.updateCategory.and.returnValue(of({ success: false, error: 'Update failed' }));
      
      component.toggleCategoryStatus(category);
      
      expect(snackBar.open).toHaveBeenCalledWith('Update failed', 'Close', jasmine.any(Object));
    });
  });

  describe('Category Deletion', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should prevent deletion of category with offers', () => {
      const categoryWithOffers = { ...mockCategories[0], offerCount: 5 };
      
      component.deleteCategory(categoryWithOffers);
      
      expect(snackBar.open).toHaveBeenCalledWith('Cannot delete category with existing offers', 'Close', jasmine.any(Object));
      expect(categoryService.deleteCategory).not.toHaveBeenCalled();
    });

    it('should delete category after confirmation', () => {
      const category = { ...mockCategories[1], offerCount: 0 };
      spyOn(window, 'confirm').and.returnValue(true);
      categoryService.deleteCategory.and.returnValue(of({ success: true }));
      spyOn(component, 'refreshCategories');
      
      component.deleteCategory(category);
      
      expect(window.confirm).toHaveBeenCalledWith(`Are you sure you want to delete "${category.name}"?`);
      expect(categoryService.deleteCategory).toHaveBeenCalledWith(category.id);
      expect(snackBar.open).toHaveBeenCalledWith('Category deleted successfully', 'Close', jasmine.any(Object));
      expect(component.refreshCategories).toHaveBeenCalled();
    });

    it('should not delete if user cancels confirmation', () => {
      const category = { ...mockCategories[1], offerCount: 0 };
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.deleteCategory(category);
      
      expect(categoryService.deleteCategory).not.toHaveBeenCalled();
    });

    it('should handle deletion errors', () => {
      const category = { ...mockCategories[1], offerCount: 0 };
      spyOn(window, 'confirm').and.returnValue(true);
      categoryService.deleteCategory.and.returnValue(of({ success: false, error: 'Deletion failed' }));
      
      component.deleteCategory(category);
      
      expect(snackBar.open).toHaveBeenCalledWith('Deletion failed', 'Close', jasmine.any(Object));
    });
  });

  describe('Reset to Defaults', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reset categories to defaults after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      categoryService.resetToDefaults.and.returnValue(of({ success: true, data: mockCategories }));
      spyOn(component, 'refreshCategories');
      
      component.resetToDefaults();
      
      expect(window.confirm).toHaveBeenCalled();
      expect(categoryService.resetToDefaults).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Categories reset to defaults', 'Close', jasmine.any(Object));
      expect(component.refreshCategories).toHaveBeenCalled();
    });

    it('should not reset if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.resetToDefaults();
      
      expect(categoryService.resetToDefaults).not.toHaveBeenCalled();
    });

    it('should handle reset errors', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      categoryService.resetToDefaults.and.returnValue(of({ success: false, error: 'Reset failed' }));
      
      component.resetToDefaults();
      
      expect(snackBar.open).toHaveBeenCalledWith('Reset failed', 'Close', jasmine.any(Object));
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return correct error messages for required fields', () => {
      component.categoryForm.get('name')?.markAsTouched();
      
      const errorMessage = component.getFormErrorMessage('name');
      
      expect(errorMessage).toBe('name is required');
    });

    it('should return correct error messages for maxlength validation', () => {
      const nameControl = component.categoryForm.get('name');
      nameControl?.setValue('a'.repeat(51)); // Exceeds maxlength
      nameControl?.markAsTouched();
      
      const errorMessage = component.getFormErrorMessage('name');
      
      expect(errorMessage).toContain('must be less than');
    });

    it('should return correct error messages for min/max validation', () => {
      const displayOrderControl = component.categoryForm.get('displayOrder');
      displayOrderControl?.setValue(-1); // Below minimum
      displayOrderControl?.markAsTouched();
      
      const errorMessage = component.getFormErrorMessage('displayOrder');
      
      expect(errorMessage).toContain('must be at least');
    });

    it('should mark all form controls as touched when form is invalid', () => {
      spyOn(component.categoryForm.get('name')!, 'markAsTouched');
      spyOn(component.categoryForm.get('icon')!, 'markAsTouched');
      
      component.saveCategory(); // This will call markFormGroupTouched
      
      expect(component.categoryForm.get('name')!.markAsTouched).toHaveBeenCalled();
      expect(component.categoryForm.get('icon')!.markAsTouched).toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    it('should track categories by id', () => {
      const category = mockCategories[0];
      
      const result = component.trackByCategory(0, category);
      
      expect(result).toBe(category.id);
    });

    it('should show snack bar with correct parameters', () => {
      component['showSnackBar']('Test message');
      
      expect(snackBar.open).toHaveBeenCalledWith('Test message', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
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

  describe('Template Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display categories in table', () => {
      const tableRows = fixture.nativeElement.querySelectorAll('mat-row');
      expect(tableRows.length).toBe(mockCategories.length);
    });

    it('should show loading spinner when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should hide form initially', () => {
      const form = fixture.nativeElement.querySelector('.category-form');
      expect(form).toBeFalsy();
    });

    it('should show form when showForm is true', () => {
      component.showForm = true;
      fixture.detectChanges();
      
      const form = fixture.nativeElement.querySelector('.category-form');
      expect(form).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle service errors during initialization', () => {
      categoryService.getCategories.and.returnValue(throwError('Init error'));
      
      expect(() => {
        component.ngOnInit();
      }).not.toThrow();
    });

    it('should handle form submission with network errors', () => {
      categoryService.createCategory.and.returnValue(throwError('Network error'));
      
      component.categoryForm.patchValue({
        name: 'Test Category',
        icon: 'test-icon',
        description: 'Test Description'
      });
      
      expect(() => {
        component.saveCategory();
      }).not.toThrow();
      
      expect(snackBar.open).toHaveBeenCalledWith('Error creating category', 'Close', jasmine.any(Object));
    });
  });
});