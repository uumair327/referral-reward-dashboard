import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  DEFAULT_CATEGORIES,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  FilterParams
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly STORAGE_KEY = 'referral_categories';
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.loadCategories();
  }

  /**
   * Load categories from localStorage or initialize with defaults
   */
  private loadCategories(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const categories = JSON.parse(stored) as Category[];
        this.categoriesSubject.next(categories);
      } else {
        // Initialize with default categories
        const defaultCategories: Category[] = DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          offerCount: 0
        }));
        this.saveCategories(defaultCategories);
        this.categoriesSubject.next(defaultCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to default categories
      const defaultCategories: Category[] = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        offerCount: 0
      }));
      this.categoriesSubject.next(defaultCategories);
    }
  }

  /**
   * Save categories to localStorage
   */
  private saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
      this.categoriesSubject.next(categories);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  /**
   * Get all categories
   */
  getAllCategories(): Observable<Category[]> {
    return this.categories$;
  }

  /**
   * Get active categories only
   */
  getActiveCategories(): Observable<Category[]> {
    return this.categories$.pipe(
      map(categories => categories.filter(cat => cat.isActive))
    );
  }

  /**
   * Get categories with pagination and filtering
   */
  getCategories(params: PaginationParams & FilterParams): Observable<PaginatedResponse<Category>> {
    return this.categories$.pipe(
      map(categories => {
        let filtered = [...categories];

        // Apply filters
        if (params.isActive !== undefined) {
          filtered = filtered.filter(cat => cat.isActive === params.isActive);
        }

        if (params.searchTerm) {
          const searchLower = params.searchTerm.toLowerCase();
          filtered = filtered.filter(cat => 
            cat.name.toLowerCase().includes(searchLower) ||
            cat.description.toLowerCase().includes(searchLower)
          );
        }

        // Apply sorting
        if (params.sortBy) {
          filtered.sort((a, b) => {
            const aValue = a[params.sortBy as keyof Category];
            const bValue = b[params.sortBy as keyof Category];
            
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;
            
            if (aValue < bValue) return params.sortDirection === 'desc' ? 1 : -1;
            if (aValue > bValue) return params.sortDirection === 'desc' ? -1 : 1;
            return 0;
          });
        } else {
          // Default sort by displayOrder
          filtered.sort((a, b) => a.displayOrder - b.displayOrder);
        }

        // Apply pagination
        const startIndex = (params.page - 1) * params.limit;
        const endIndex = startIndex + params.limit;
        const paginatedData = filtered.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          total: filtered.length,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil(filtered.length / params.limit)
        };
      })
    );
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: string): Observable<Category | undefined> {
    return this.categories$.pipe(
      map(categories => categories.find(cat => cat.id === id))
    );
  }

  /**
   * Create a new category
   */
  createCategory(request: CreateCategoryRequest): Observable<ApiResponse<Category>> {
    try {
      const categories = this.categoriesSubject.value;
      
      // Check if category with same name already exists
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase() === request.name?.toLowerCase()
      );
      
      if (existingCategory) {
        return of({
          success: false,
          error: 'Category with this name already exists'
        });
      }

      const newCategory: Category = {
        id: this.generateId(),
        name: request.name,
        icon: request.icon,
        description: request.description,
        isActive: true,
        offerCount: 0,
        displayOrder: request.displayOrder ?? categories.length + 1
      };

      const updatedCategories = [...categories, newCategory];
      this.saveCategories(updatedCategories);

      return of({
        success: true,
        data: newCategory,
        message: 'Category created successfully'
      });
    } catch (error) {
      return of({
        success: false,
        error: 'Failed to create category'
      });
    }
  }

  /**
   * Update an existing category
   */
  updateCategory(request: UpdateCategoryRequest): Observable<ApiResponse<Category>> {
    try {
      const categories = this.categoriesSubject.value;
      const categoryIndex = categories.findIndex(cat => cat.id === request.id);

      if (categoryIndex === -1) {
        return of({
          success: false,
          error: 'Category not found'
        });
      }

      // Check for duplicate name (excluding current category)
      if (request.name) {
        const duplicateCategory = categories.find(cat => 
          cat.id !== request.id && 
          cat.name.toLowerCase() === request.name?.toLowerCase()
        );
        
        if (duplicateCategory) {
          return of({
            success: false,
            error: 'Category with this name already exists'
          });
        }
      }

      const updatedCategory: Category = {
        ...categories[categoryIndex],
        ...request,
        id: request.id // Ensure ID doesn't change
      };

      const updatedCategories = [...categories];
      updatedCategories[categoryIndex] = updatedCategory;
      this.saveCategories(updatedCategories);

      return of({
        success: true,
        data: updatedCategory,
        message: 'Category updated successfully'
      });
    } catch (error) {
      return of({
        success: false,
        error: 'Failed to update category'
      });
    }
  }

  /**
   * Delete a category
   */
  deleteCategory(id: string): Observable<ApiResponse<void>> {
    try {
      const categories = this.categoriesSubject.value;
      const categoryToDelete = categories.find(cat => cat.id === id);

      if (!categoryToDelete) {
        return of({
          success: false,
          error: 'Category not found'
        });
      }

      if (categoryToDelete.offerCount > 0) {
        return of({
          success: false,
          error: 'Cannot delete category with existing offers'
        });
      }

      const updatedCategories = categories.filter(cat => cat.id !== id);
      this.saveCategories(updatedCategories);

      return of({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      return of({
        success: false,
        error: 'Failed to delete category'
      });
    }
  }

  /**
   * Update offer count for a category
   */
  updateOfferCount(categoryId: string, count: number): void {
    const categories = this.categoriesSubject.value;
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);

    if (categoryIndex !== -1) {
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex] = {
        ...updatedCategories[categoryIndex],
        offerCount: Math.max(0, count) // Ensure count is not negative
      };
      this.saveCategories(updatedCategories);
    }
  }

  /**
   * Get category statistics
   */
  getCategoryStats(): Observable<{
    totalCategories: number;
    activeCategories: number;
    totalOffers: number;
  }> {
    return this.categories$.pipe(
      map(categories => ({
        totalCategories: categories.length,
        activeCategories: categories.filter(cat => cat.isActive).length,
        totalOffers: categories.reduce((sum, cat) => sum + cat.offerCount, 0)
      }))
    );
  }

  /**
   * Reset categories to defaults
   */
  resetToDefaults(): Observable<ApiResponse<Category[]>> {
    try {
      const defaultCategories: Category[] = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        offerCount: 0
      }));
      
      this.saveCategories(defaultCategories);
      
      return of({
        success: true,
        data: defaultCategories,
        message: 'Categories reset to defaults'
      });
    } catch (error) {
      return of({
        success: false,
        error: 'Failed to reset categories'
      });
    }
  }

  /**
   * Generate a unique ID for new categories
   */
  private generateId(): string {
    return 'cat_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}