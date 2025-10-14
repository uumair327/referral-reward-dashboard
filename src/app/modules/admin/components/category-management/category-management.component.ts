import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  PaginatedResponse,
  SortDirection 
} from '../../../../models';
import { CategoryService, ValidationService } from '../../../../services';
import { RichTextEditorComponent } from '../rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-category-management',
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
    RichTextEditorComponent
  ],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.scss'
})
export class CategoryManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = ['icon', 'name', 'description', 'offerCount', 'isActive', 'displayOrder', 'actions'];
  categories$: Observable<PaginatedResponse<Category>>;
  categoriesData: Category[] = [];
  
  // Pagination and sorting
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  sortBy = 'displayOrder';
  sortDirection: SortDirection = SortDirection.ASC;
  
  // Filtering
  searchTerm = '';
  showActiveOnly = false;
  
  // Form for adding/editing categories
  categoryForm: FormGroup;
  editingCategory: Category | null = null;
  showForm = false;
  
  // Loading states
  loading = false;
  saving = false;

  constructor(
    private categoryService: CategoryService,
    private validationService: ValidationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.createCategoryForm();
    this.categories$ = this.loadCategories();
  }

  ngOnInit(): void {
    this.refreshCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createCategoryForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      icon: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      displayOrder: [1, [Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  private loadCategories(): Observable<PaginatedResponse<Category>> {
    return this.categoryService.getCategories({
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm,
      isActive: this.showActiveOnly ? true : undefined
    });
  }

  refreshCategories(): void {
    this.loading = true;
    this.categories$ = this.loadCategories();
    
    this.categories$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.categoriesData = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showSnackBar('Error loading categories');
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.refreshCategories();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction === 'desc' ? SortDirection.DESC : SortDirection.ASC;
    this.refreshCategories();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.refreshCategories();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.refreshCategories();
  }

  showAddForm(): void {
    this.editingCategory = null;
    this.categoryForm.reset({
      name: '',
      icon: '',
      description: '',
      displayOrder: 1,
      isActive: true
    });
    this.showForm = true;
  }

  editCategory(category: Category): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      icon: category.icon,
      description: category.description,
      displayOrder: category.displayOrder,
      isActive: category.isActive
    });
    this.showForm = true;
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    const formValue = this.categoryForm.value;

    if (this.editingCategory) {
      // Update existing category
      const updateRequest: UpdateCategoryRequest = {
        id: this.editingCategory.id,
        ...formValue
      };

      this.categoryService.updateCategory(updateRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar('Category updated successfully');
            this.cancelEdit();
            this.refreshCategories();
          } else {
            this.showSnackBar(response.error || 'Error updating category');
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.showSnackBar('Error updating category');
          this.saving = false;
        }
      });
    } else {
      // Create new category
      const createRequest: CreateCategoryRequest = formValue;

      this.categoryService.createCategory(createRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar('Category created successfully');
            this.cancelEdit();
            this.refreshCategories();
          } else {
            this.showSnackBar(response.error || 'Error creating category');
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.showSnackBar('Error creating category');
          this.saving = false;
        }
      });
    }
  }

  toggleCategoryStatus(category: Category): void {
    const updateRequest: UpdateCategoryRequest = {
      id: category.id,
      isActive: !category.isActive
    };

    this.categoryService.updateCategory(updateRequest).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSnackBar(`Category ${response.data?.isActive ? 'activated' : 'deactivated'}`);
          this.refreshCategories();
        } else {
          this.showSnackBar(response.error || 'Error updating category status');
        }
      },
      error: (error) => {
        console.error('Error updating category status:', error);
        this.showSnackBar('Error updating category status');
      }
    });
  }

  deleteCategory(category: Category): void {
    if (category.offerCount > 0) {
      this.showSnackBar('Cannot delete category with existing offers');
      return;
    }

    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar('Category deleted successfully');
            this.refreshCategories();
          } else {
            this.showSnackBar(response.error || 'Error deleting category');
          }
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.showSnackBar('Error deleting category');
        }
      });
    }
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all categories to defaults? This will remove any custom categories.')) {
      this.categoryService.resetToDefaults().pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar('Categories reset to defaults');
            this.refreshCategories();
          } else {
            this.showSnackBar(response.error || 'Error resetting categories');
          }
        },
        error: (error) => {
          console.error('Error resetting categories:', error);
          this.showSnackBar('Error resetting categories');
        }
      });
    }
  }

  getFormErrorMessage(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength']?.requiredLength;
      return `${fieldName} must be less than ${maxLength} characters`;
    }
    if (field?.hasError('min')) {
      return `${fieldName} must be at least ${field.errors?.['min']?.min}`;
    }
    if (field?.hasError('max')) {
      return `${fieldName} must be at most ${field.errors?.['max']?.max}`;
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
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

  trackByCategory(index: number, category: Category): string {
    return category.id;
  }
}