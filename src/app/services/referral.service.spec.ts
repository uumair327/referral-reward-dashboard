import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReferralService } from './referral.service';
import { CategoryService } from './category.service';
import { ReferralOffer, CreateReferralOfferRequest, UpdateReferralOfferRequest } from '../models';

describe('ReferralService', () => {
  let service: ReferralService;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    // Create spy for CategoryService
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', [
      'getAllCategories', 
      'updateOfferCount'
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy }
      ]
    });

    service = TestBed.inject(ReferralService);
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;

    // Setup default category service behavior
    categoryService.getAllCategories.and.returnValue(of([
      {
        id: 'cat1',
        name: 'Test Category',
        icon: 'test-icon',
        description: 'Test Description',
        isActive: true,
        offerCount: 0,
        displayOrder: 1
      }
    ]));
  });

  afterEach(() => {
    mockLocalStorage = {};
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty offers when localStorage is empty', () => {
      service.getAllOffers().subscribe(offers => {
        expect(offers.length).toBe(0);
      });
    });

    it('should load offers from localStorage when available', () => {
      const testOffers: ReferralOffer[] = [
        {
          id: 'offer1',
          title: 'Test Offer',
          description: 'Test Description',
          referralLink: 'https://example.com',
          referralCode: 'TEST123',
          categoryId: 'cat1',
          isActive: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          clickCount: 5
        }
      ];
      
      mockLocalStorage['referral_offers'] = JSON.stringify(testOffers);
      
      // Create new service instance to trigger initialization
      const newService = new ReferralService(categoryService);
      
      newService.getAllOffers().subscribe(offers => {
        expect(offers.length).toBe(1);
        expect(offers[0].title).toBe('Test Offer');
        expect(offers[0].clickCount).toBe(5);
        expect(offers[0].createdAt instanceof Date).toBe(true);
      });
    });

    it('should handle localStorage parsing errors gracefully', () => {
      mockLocalStorage['referral_offers'] = 'invalid-json';
      
      const newService = new ReferralService(categoryService);
      
      newService.getAllOffers().subscribe(offers => {
        expect(offers.length).toBe(0);
      });
    });
  });

  describe('getAllOffers', () => {
    it('should return all offers', () => {
      service.getAllOffers().subscribe(offers => {
        expect(offers).toBeDefined();
        expect(Array.isArray(offers)).toBe(true);
      });
    });
  });

  describe('getActiveOffers', () => {
    it('should return only active offers', () => {
      const createRequest1: CreateReferralOfferRequest = {
        title: 'Active Offer',
        description: 'Active Description',
        referralLink: 'https://example.com/active',
        categoryId: 'cat1'
      };

      const createRequest2: CreateReferralOfferRequest = {
        title: 'Inactive Offer',
        description: 'Inactive Description',
        referralLink: 'https://example.com/inactive',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest1).subscribe(() => {
        service.createOffer(createRequest2).subscribe(response => {
          if (response.data) {
            // Make the second offer inactive
            const updateRequest: UpdateReferralOfferRequest = {
              id: response.data.id,
              isActive: false
            };
            
            service.updateOffer(updateRequest).subscribe(() => {
              service.getActiveOffers().subscribe(activeOffers => {
                expect(activeOffers.every(offer => offer.isActive)).toBe(true);
                expect(activeOffers.find(offer => offer.title === 'Inactive Offer')).toBeUndefined();
              });
            });
          }
        });
      });
    });
  });

  describe('getOfferById', () => {
    it('should return offer by ID', () => {
      const createRequest: CreateReferralOfferRequest = {
        title: 'Test Offer',
        description: 'Test Description',
        referralLink: 'https://example.com',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest).subscribe(response => {
        if (response.data) {
          service.getOfferById(response.data.id).subscribe(offer => {
            expect(offer).toBeDefined();
            expect(offer?.id).toBe(response.data?.id);
            expect(offer?.title).toBe('Test Offer');
          });
        }
      });
    });

    it('should return undefined for non-existent ID', () => {
      service.getOfferById('non-existent-id').subscribe(offer => {
        expect(offer).toBeUndefined();
      });
    });
  });

  describe('createOffer', () => {
    it('should create a new offer successfully', () => {
      const createRequest: CreateReferralOfferRequest = {
        title: 'New Offer',
        description: 'New Description',
        referralLink: 'https://example.com/new',
        referralCode: 'NEW123',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data?.title).toBe('New Offer');
        expect(response.data?.isActive).toBe(true);
        expect(response.data?.clickCount).toBe(0);
        expect(response.data?.createdAt instanceof Date).toBe(true);
        expect(response.data?.updatedAt instanceof Date).toBe(true);
      });
    });

    it('should prevent duplicate referral codes within the same category', () => {
      const createRequest1: CreateReferralOfferRequest = {
        title: 'First Offer',
        description: 'First Description',
        referralLink: 'https://example.com/first',
        referralCode: 'DUPLICATE123',
        categoryId: 'cat1'
      };

      const createRequest2: CreateReferralOfferRequest = {
        title: 'Second Offer',
        description: 'Second Description',
        referralLink: 'https://example.com/second',
        referralCode: 'DUPLICATE123',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest1).subscribe(firstResponse => {
        expect(firstResponse.success).toBe(true);
        
        service.createOffer(createRequest2).subscribe(secondResponse => {
          expect(secondResponse.success).toBe(false);
          expect(secondResponse.error).toContain('already exists');
        });
      });
    });

    it('should allow same referral code in different categories', () => {
      const createRequest1: CreateReferralOfferRequest = {
        title: 'First Offer',
        description: 'First Description',
        referralLink: 'https://example.com/first',
        referralCode: 'SAME123',
        categoryId: 'cat1'
      };

      const createRequest2: CreateReferralOfferRequest = {
        title: 'Second Offer',
        description: 'Second Description',
        referralLink: 'https://example.com/second',
        referralCode: 'SAME123',
        categoryId: 'cat2'
      };

      service.createOffer(createRequest1).subscribe(firstResponse => {
        expect(firstResponse.success).toBe(true);
        
        service.createOffer(createRequest2).subscribe(secondResponse => {
          expect(secondResponse.success).toBe(true);
        });
      });
    });

    it('should handle creation errors gracefully', () => {
      spyOn(localStorage, 'setItem').and.throwError('Storage error');
      
      const createRequest: CreateReferralOfferRequest = {
        title: 'Error Offer',
        description: 'Error Description',
        referralLink: 'https://example.com/error',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest).subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Failed to create offer');
      });
    });
  });

  describe('updateOffer', () => {
    it('should update an existing offer successfully', () => {
      const createRequest: CreateReferralOfferRequest = {
        title: 'Original Title',
        description: 'Original Description',
        referralLink: 'https://example.com/original',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest).subscribe(createResponse => {
        if (createResponse.data) {
          const updateRequest: UpdateReferralOfferRequest = {
            id: createResponse.data.id,
            title: 'Updated Title',
            description: 'Updated Description'
          };

          service.updateOffer(updateRequest).subscribe(updateResponse => {
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.data?.title).toBe('Updated Title');
            expect(updateResponse.data?.description).toBe('Updated Description');
            expect(updateResponse.data?.updatedAt.getTime()).toBeGreaterThan(createResponse.data!.updatedAt.getTime());
          });
        }
      });
    });

    it('should return error for non-existent offer', () => {
      const updateRequest: UpdateReferralOfferRequest = {
        id: 'non-existent-id',
        title: 'Updated Title'
      };

      service.updateOffer(updateRequest).subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Offer not found');
      });
    });

    it('should prevent duplicate referral codes during update', () => {
      const createRequest1: CreateReferralOfferRequest = {
        title: 'First Offer',
        description: 'First Description',
        referralLink: 'https://example.com/first',
        referralCode: 'FIRST123',
        categoryId: 'cat1'
      };

      const createRequest2: CreateReferralOfferRequest = {
        title: 'Second Offer',
        description: 'Second Description',
        referralLink: 'https://example.com/second',
        referralCode: 'SECOND123',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest1).subscribe(() => {
        service.createOffer(createRequest2).subscribe(response2 => {
          if (response2.data) {
            const updateRequest: UpdateReferralOfferRequest = {
              id: response2.data.id,
              referralCode: 'FIRST123' // Try to use existing code
            };

            service.updateOffer(updateRequest).subscribe(updateResponse => {
              expect(updateResponse.success).toBe(false);
              expect(updateResponse.error).toContain('already exists');
            });
          }
        });
      });
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer successfully', () => {
      const createRequest: CreateReferralOfferRequest = {
        title: 'Delete Test Offer',
        description: 'Delete Description',
        referralLink: 'https://example.com/delete',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest).subscribe(createResponse => {
        if (createResponse.data) {
          service.deleteOffer(createResponse.data.id).subscribe(deleteResponse => {
            expect(deleteResponse.success).toBe(true);
            expect(deleteResponse.message).toContain('deleted successfully');
            
            // Verify offer is actually deleted
            service.getOfferById(createResponse.data!.id).subscribe(offer => {
              expect(offer).toBeUndefined();
            });
          });
        }
      });
    });

    it('should return error for non-existent offer', () => {
      service.deleteOffer('non-existent-id').subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Offer not found');
      });
    });
  });

  describe('toggleOfferStatus', () => {
    it('should toggle offer status successfully', () => {
      const createRequest: CreateReferralOfferRequest = {
        title: 'Toggle Test Offer',
        description: 'Toggle Description',
        referralLink: 'https://example.com/toggle',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest).subscribe(createResponse => {
        if (createResponse.data) {
          const originalStatus = createResponse.data.isActive;
          
          service.toggleOfferStatus(createResponse.data.id).subscribe(toggleResponse => {
            expect(toggleResponse.success).toBe(true);
            expect(toggleResponse.data?.isActive).toBe(!originalStatus);
            expect(toggleResponse.message).toContain(originalStatus ? 'deactivated' : 'activated');
          });
        }
      });
    });

    it('should return error for non-existent offer', () => {
      service.toggleOfferStatus('non-existent-id').subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Offer not found');
      });
    });
  });

  describe('trackClick', () => {
    it('should increment click count successfully', () => {
      const createRequest: CreateReferralOfferRequest = {
        title: 'Click Test Offer',
        description: 'Click Description',
        referralLink: 'https://example.com/click',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest).subscribe(createResponse => {
        if (createResponse.data) {
          const originalClickCount = createResponse.data.clickCount || 0;
          
          service.trackClick(createResponse.data.id).subscribe(trackResponse => {
            expect(trackResponse.success).toBe(true);
            
            service.getOfferById(createResponse.data!.id).subscribe(updatedOffer => {
              expect(updatedOffer?.clickCount).toBe(originalClickCount + 1);
            });
          });
        }
      });
    });

    it('should return error for non-existent offer', () => {
      service.trackClick('non-existent-id').subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Offer not found');
      });
    });
  });

  describe('getOffersByCategory', () => {
    it('should return offers for specific category', () => {
      const createRequest1: CreateReferralOfferRequest = {
        title: 'Category 1 Offer',
        description: 'Category 1 Description',
        referralLink: 'https://example.com/cat1',
        categoryId: 'cat1'
      };

      const createRequest2: CreateReferralOfferRequest = {
        title: 'Category 2 Offer',
        description: 'Category 2 Description',
        referralLink: 'https://example.com/cat2',
        categoryId: 'cat2'
      };

      service.createOffer(createRequest1).subscribe(() => {
        service.createOffer(createRequest2).subscribe(() => {
          service.getOffersByCategory('cat1').subscribe(offers => {
            expect(offers.length).toBe(1);
            expect(offers[0].categoryId).toBe('cat1');
            expect(offers[0].title).toBe('Category 1 Offer');
          });
        });
      });
    });

    it('should return only active offers for category', () => {
      const createRequest: CreateReferralOfferRequest = {
        title: 'Inactive Category Offer',
        description: 'Inactive Description',
        referralLink: 'https://example.com/inactive',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest).subscribe(response => {
        if (response.data) {
          // Make offer inactive
          const updateRequest: UpdateReferralOfferRequest = {
            id: response.data.id,
            isActive: false
          };
          
          service.updateOffer(updateRequest).subscribe(() => {
            service.getOffersByCategory('cat1').subscribe(offers => {
              expect(offers.find(offer => offer.id === response.data!.id)).toBeUndefined();
            });
          });
        }
      });
    });
  });

  describe('searchOffers', () => {
    beforeEach(() => {
      // Create test offers for search
      const testOffers = [
        {
          title: 'Amazon Prime Offer',
          description: 'Get Amazon Prime membership',
          referralLink: 'https://amazon.com/prime',
          referralCode: 'PRIME123',
          categoryId: 'cat1'
        },
        {
          title: 'Netflix Subscription',
          description: 'Stream movies and shows',
          referralLink: 'https://netflix.com',
          referralCode: 'NETFLIX456',
          categoryId: 'cat1'
        }
      ];

      testOffers.forEach(offer => {
        service.createOffer(offer).subscribe();
      });
    });

    it('should search offers by title', () => {
      service.searchOffers('Amazon').subscribe(offers => {
        expect(offers.length).toBeGreaterThan(0);
        expect(offers[0].title.toLowerCase()).toContain('amazon');
      });
    });

    it('should search offers by description', () => {
      service.searchOffers('movies').subscribe(offers => {
        expect(offers.length).toBeGreaterThan(0);
        expect(offers[0].description.toLowerCase()).toContain('movies');
      });
    });

    it('should search offers by referral code', () => {
      service.searchOffers('PRIME').subscribe(offers => {
        expect(offers.length).toBeGreaterThan(0);
        expect(offers[0].referralCode?.toLowerCase()).toContain('prime');
      });
    });

    it('should return empty array for empty search term', () => {
      service.searchOffers('').subscribe(offers => {
        expect(offers.length).toBe(0);
      });
    });

    it('should limit search results', () => {
      service.searchOffers('offer', 1).subscribe(offers => {
        expect(offers.length).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('getOfferStats', () => {
    it('should return correct statistics', () => {
      const createRequest: CreateReferralOfferRequest = {
        title: 'Stats Test Offer',
        description: 'Stats Description',
        referralLink: 'https://example.com/stats',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest).subscribe(response => {
        if (response.data) {
          // Track some clicks
          service.trackClick(response.data.id).subscribe(() => {
            service.trackClick(response.data!.id).subscribe(() => {
              service.getOfferStats().subscribe(stats => {
                expect(stats.totalOffers).toBeGreaterThan(0);
                expect(stats.activeOffers).toBeGreaterThan(0);
                expect(stats.totalClicks).toBeGreaterThanOrEqual(2);
                expect(stats.offersByCategory['cat1']).toBeGreaterThan(0);
              });
            });
          });
        }
      });
    });
  });

  describe('bulkUpdateOffers', () => {
    it('should update multiple offers successfully', () => {
      const createRequest1: CreateReferralOfferRequest = {
        title: 'Bulk Update 1',
        description: 'Description 1',
        referralLink: 'https://example.com/bulk1',
        categoryId: 'cat1'
      };

      const createRequest2: CreateReferralOfferRequest = {
        title: 'Bulk Update 2',
        description: 'Description 2',
        referralLink: 'https://example.com/bulk2',
        categoryId: 'cat1'
      };

      service.createOffer(createRequest1).subscribe(response1 => {
        service.createOffer(createRequest2).subscribe(response2 => {
          if (response1.data && response2.data) {
            const offerIds = [response1.data.id, response2.data.id];
            const updates = { isActive: false };

            service.bulkUpdateOffers(offerIds, updates).subscribe(bulkResponse => {
              expect(bulkResponse.success).toBe(true);
              expect(bulkResponse.data?.length).toBe(2);
              expect(bulkResponse.data?.every(offer => !offer.isActive)).toBe(true);
            });
          }
        });
      });
    });

    it('should return error when no offers found', () => {
      service.bulkUpdateOffers(['non-existent-1', 'non-existent-2'], { isActive: false }).subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toContain('No offers found');
      });
    });
  });
});

