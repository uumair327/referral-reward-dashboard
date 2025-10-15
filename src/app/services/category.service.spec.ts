import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, DEFAULT_CATEGORIES, SortDirection } from '../models';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryService);
  });

  afterEach(() => {
    mockLocalStorage = {};
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default categories when localStorage is empty', () => {
      service.getAllCategories().subscribe(categories => {
        expect(categories.length).toBe(DEFAULT_CATEGORIES.length);
        expect(categories[0].offerCount).toBe(0);
      });
    });

    it('should load categories from localStorage when available', () => {
      const testCategories: Category[] = [
        {
          id: 'test1',
          name: 'Test Category',
          icon: 'test-icon',
          description: 'Test Description',
          isActive: true,
          offerCount: 5,
          displayOrder: 1
        }
      ];
      
      mockLocalStorage['referral_categories'] = JSON.stringify(testCategories);
      
      // Create new service instance to trigger initialization
      const newService = new CategoryService();
      
      newService.getAllCategories().subscribe(categories => {
        expect(categories.length).toBe(1);
        expect(categories[0].name).toBe('Test Category');
        expect(categories[0].offerCount).toBe(5);
      });
    });

    it('should handle localStorage parsing errors gracefully', () => {
      mockLocalStorage['referral_categories'] = 'invalid-json';
      
      const newService = new CategoryService();
      
      newService.getAllCategories().subscribe(categories => {
        expect(categories.length).toBe(DEFAULT_CATEGORIES.length);
      });
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', () => {
      service.getAllCategories().subscribe(categories => {
        expect(categories).toBeDefined();
        expect(Array.isArray(categories)).toBe(true);
      });
    });
  });

  describe('getActiveCategories', () => {
    it('should return only active categories', () => {
      // Add a test category that is inactive
      const createRequest: CreateCategoryRequest = {
        name: 'Inactive Category',
        icon: 'inactive-icon',
        description: 'Inactive Description'
      };
      
      service.createCategory(createRequest).subscribe(() => {
        // Update the category to be inactive
        service.getAllCategories().subscribe(categories => {
          const inactiveCategory = categories.find(c => c.name === 'Inactive Category');
          if (inactiveCategory) {
            const updateRequest: UpdateCategoryRequest = {
              id: inactiveCategory.id,
              isActive: false
            };
            
            service.updateCategory(updateRequest).subscribe(() => {
              service.getActiveCategories().subscribe(activeCategories => {
                expect(activeCategories.every(c => c.isActive)).toBe(true);
                expect(activeCategories.find(c => c.name === 'Inactive Category')).toBeUndefined();
              });
            });
          }
        });
      });
    });
  });

  describe('getCategoryById', () => {
    it('should return category by ID', () => {
      service.getAllCategories().subscribe(categories => {
        if (categories.length > 0) {
          const firstCategory = categories[0];
          service.getCategoryById(firstCategory.id).subscribe(category => {
            expect(category).toBeDefined();
            expect(category?.id).toBe(firstCategory.id);
          });
        }
      });
    });

    it('should return undefined for non-existent ID', () => {
      service.getCategoryById('non-existent-id').subscribe(category => {
        expect(category).toBeUndefined();
      });
    });
  });

  describe('createCategory', () => {
    it('should create a new category successfully', () => {
      const createRequest: CreateCategoryRequest = {
        name: 'New Category',
        icon: 'new-icon',
        description: 'New Description'
      };

      service.createCategory(createRequest).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data?.name).toBe('New Category');
        expect(response.data?.isActive).toBe(true);
        expect(response.data?.offerCount).toBe(0);
      });
    });

    it('should prevent duplicate category names', () => {
      const createRequest: CreateCategoryRequest = {
        name: 'Duplicate Category',
        icon: 'dup-icon',
        description: 'Duplicate Description'
      };

      service.createCategory(createRequest).subscribe(firstResponse => {
        expect(firstResponse.success).toBe(true);
        
        // Try to create another category with the same name
        service.createCategory(createRequest).subscribe(secondResponse => {
          expect(secondResponse.success).toBe(false);
          expect(secondResponse.error).toContain('already exists');
        });
      });
    });

    it('should handle creation errors gracefully', () => {
      // Simulate localStorage error
      spyOn(localStorage, 'setItem').and.throwError('Storage error');
      
      const createRequest: CreateCategoryRequest = {
        name: 'Error Category',
        icon: 'error-icon',
        description: 'Error Description'
      };

      service.createCategory(createRequest).subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Failed to create category');
      });
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category successfully', () => {
      const createRequest: CreateCategoryRequest = {
        name: 'Update Test Category',
        icon: 'update-icon',
        description: 'Update Description'
      };

      service.createCategory(createRequest).subscribe(createResponse => {
        expect(createResponse.success).toBe(true);
        
        if (createResponse.data) {
          const updateRequest: UpdateCategoryRequest = {
            id: createResponse.data.id,
            name: 'Updated Category Name',
            description: 'Updated Description'
          };

          service.updateCategory(updateRequest).subscribe(updateResponse => {
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.data?.name).toBe('Updated Category Name');
            expect(updateResponse.data?.description).toBe('Updated Description');
          });
        }
      });
    });

    it('should return error for non-existent category', () => {
      const updateRequest: UpdateCategoryRequest = {
        id: 'non-existent-id',
        name: 'Updated Name'
      };

      service.updateCategory(updateRequest).subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Category not found');
      });
    });

    it('should prevent duplicate names during update', () => {
      const createRequest1: CreateCategoryRequest = {
        name: 'Category One',
        icon: 'icon1',
        description: 'Description One'
      };

      const createRequest2: CreateCategoryRequest = {
        name: 'Category Two',
        icon: 'icon2',
        description: 'Description Two'
      };

      service.createCategory(createRequest1).subscribe(response1 => {
        service.createCategory(createRequest2).subscribe(response2 => {
          if (response1.data && response2.data) {
            const updateRequest: UpdateCategoryRequest = {
              id: response2.data.id,
              name: 'Category One' // Try to use existing name
            };

            service.updateCategory(updateRequest).subscribe(updateResponse => {
              expect(updateResponse.success).toBe(false);
              expect(updateResponse.error).toContain('already exists');
            });
          }
        });
      });
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category with no offers', () => {
      const createRequest: CreateCategoryRequest = {
        name: 'Delete Test Category',
        icon: 'delete-icon',
        description: 'Delete Description'
      };

      service.createCategory(createRequest).subscribe(createResponse => {
        if (createResponse.data) {
          service.deleteCategory(createResponse.data.id).subscribe(deleteResponse => {
            expect(deleteResponse.success).toBe(true);
            expect(deleteResponse.message).toContain('deleted successfully');
          });
        }
      });
    });

    it('should prevent deletion of category with offers', () => {
      const createRequest: CreateCategoryRequest = {
        name: 'Category with Offers',
        icon: 'offers-icon',
        description: 'Has offers'
      };

      service.createCategory(createRequest).subscribe(createResponse => {
        if (createResponse.data) {
          // Simulate category having offers
          service.updateOfferCount(createResponse.data.id, 5);
          
          service.deleteCategory(createResponse.data.id).subscribe(deleteResponse => {
            expect(deleteResponse.success).toBe(false);
            expect(deleteResponse.error).toContain('existing offers');
          });
        }
      });
    });

    it('should return error for non-existent category', () => {
      service.deleteCategory('non-existent-id').subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Category not found');
      });
    });
  });

  describe('updateOfferCount', () => {
    it('should update offer count for existing category', () => {
      service.getAllCategories().subscribe(categories => {
        if (categories.length > 0) {
          const categoryId = categories[0].id;
          service.updateOfferCount(categoryId, 10);
          
          service.getCategoryById(categoryId).subscribe(category => {
            expect(category?.offerCount).toBe(10);
          });
        }
      });
    });

    it('should not allow negative offer counts', () => {
      service.getAllCategories().subscribe(categories => {
        if (categories.length > 0) {
          const categoryId = categories[0].id;
          service.updateOfferCount(categoryId, -5);
          
          service.getCategoryById(categoryId).subscribe(category => {
            expect(category?.offerCount).toBe(0);
          });
        }
      });
    });

    it('should handle non-existent category gracefully', () => {
      // Should not throw error
      expect(() => {
        service.updateOfferCount('non-existent-id', 5);
      }).not.toThrow();
    });
  });

  describe('getCategoryStats', () => {
    it('should return correct statistics', () => {
      service.getCategoryStats().subscribe(stats => {
        expect(stats.totalCategories).toBeGreaterThan(0);
        expect(stats.activeCategories).toBeGreaterThanOrEqual(0);
        expect(stats.totalOffers).toBeGreaterThanOrEqual(0);
        expect(stats.activeCategories).toBeLessThanOrEqual(stats.totalCategories);
      });
    });
  });

  describe('resetToDefaults', () => {
    it('should reset categories to default values', () => {
      // First create a custom category
      const createRequest: CreateCategoryRequest = {
        name: 'Custom Category',
        icon: 'custom-icon',
        description: 'Custom Description'
      };

      service.createCategory(createRequest).subscribe(() => {
        service.resetToDefaults().subscribe(response => {
          expect(response.success).toBe(true);
          expect(response.data?.length).toBe(DEFAULT_CATEGORIES.length);
          
          service.getAllCategories().subscribe(categories => {
            expect(categories.length).toBe(DEFAULT_CATEGORIES.length);
            expect(categories.find(c => c.name === 'Custom Category')).toBeUndefined();
          });
        });
      });
    });
  });

  describe('getCategories with pagination and filtering', () => {
    beforeEach(() => {
      // Create test categories for pagination testing
      const testCategories = [
        { name: 'Active Category 1', icon: 'icon1', description: 'Description 1' },
        { name: 'Active Category 2', icon: 'icon2', description: 'Description 2' },
        { name: 'Inactive Category', icon: 'icon3', description: 'Description 3' }
      ];

      testCategories.forEach((cat, index) => {
        const createRequest: CreateCategoryRequest = cat;
        service.createCategory(createRequest).subscribe(response => {
          if (response.data && index === 2) {
            // Make the third category inactive
            const updateRequest: UpdateCategoryRequest = {
              id: response.data.id,
              isActive: false
            };
            service.updateCategory(updateRequest).subscribe();
          }
        });
      });
    });

    it('should return paginated results', () => {
      const params = {
        page: 1,
        limit: 2,
        sortBy: 'name',
        sortDirection: SortDirection.ASC
      };

      service.getCategories(params).subscribe(result => {
        expect(result.data.length).toBeLessThanOrEqual(2);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(2);
        expect(result.total).toBeGreaterThan(0);
      });
    });

    it('should filter by active status', () => {
      const params = {
        page: 1,
        limit: 10,
        isActive: true
      };

      service.getCategories(params).subscribe(result => {
        expect(result.data.every(cat => cat.isActive)).toBe(true);
      });
    });

    it('should filter by search term', () => {
      const params = {
        page: 1,
        limit: 10,
        searchTerm: 'Active'
      };

      service.getCategories(params).subscribe(result => {
        expect(result.data.every(cat => 
          cat.name.toLowerCase().includes('active') || 
          cat.description.toLowerCase().includes('active')
        )).toBe(true);
      });
    });

    it('should sort results correctly', () => {
      const params = {
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortDirection: SortDirection.ASC
      };

      service.getCategories(params).subscribe(result => {
        for (let i = 1; i < result.data.length; i++) {
          expect(result.data[i].name >= result.data[i - 1].name).toBe(true);
        }
      });
    });
  });
});