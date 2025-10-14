import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  ReferralOffer, 
  CreateReferralOfferRequest, 
  UpdateReferralOfferRequest,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  FilterParams,
  OfferStatus
} from '../models';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private readonly STORAGE_KEY = 'referral_offers';
  private offersSubject = new BehaviorSubject<ReferralOffer[]>([]);
  public offers$ = this.offersSubject.asObservable();

  constructor(private categoryService: CategoryService) {
    this.loadOffers();
  }

  /**
   * Load offers from localStorage
   */
  private loadOffers(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const offers = JSON.parse(stored) as ReferralOffer[];
        // Convert date strings back to Date objects
        const parsedOffers = offers.map(offer => ({
          ...offer,
          createdAt: new Date(offer.createdAt),
          updatedAt: new Date(offer.updatedAt)
        }));
        this.offersSubject.next(parsedOffers);
      } else {
        this.offersSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      this.offersSubject.next([]);
    }
  }

  /**
   * Save offers to localStorage and update category counts
   */
  private saveOffers(offers: ReferralOffer[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offers));
      this.offersSubject.next(offers);
      this.updateCategoryCounts(offers);
    } catch (error) {
      console.error('Error saving offers:', error);
    }
  }

  /**
   * Update category offer counts
   */
  private updateCategoryCounts(offers: ReferralOffer[]): void {
    const categoryCounts = new Map<string, number>();
    
    offers.forEach(offer => {
      if (offer.isActive) {
        const currentCount = categoryCounts.get(offer.categoryId) || 0;
        categoryCounts.set(offer.categoryId, currentCount + 1);
      }
    });

    // Update each category's offer count
    this.categoryService.getAllCategories().subscribe(categories => {
      categories.forEach(category => {
        const count = categoryCounts.get(category.id) || 0;
        this.categoryService.updateOfferCount(category.id, count);
      });
    });
  }

  /**
   * Get all offers
   */
  getAllOffers(): Observable<ReferralOffer[]> {
    return this.offers$;
  }

  /**
   * Get active offers only
   */
  getActiveOffers(): Observable<ReferralOffer[]> {
    return this.offers$.pipe(
      map(offers => offers.filter(offer => offer.isActive))
    );
  }

  /**
   * Get offers with pagination and filtering
   */
  getOffers(params: PaginationParams & FilterParams): Observable<PaginatedResponse<ReferralOffer>> {
    return this.offers$.pipe(
      map(offers => {
        let filtered = [...offers];

        // Apply filters
        if (params.categoryId) {
          filtered = filtered.filter(offer => offer.categoryId === params.categoryId);
        }

        if (params.isActive !== undefined) {
          filtered = filtered.filter(offer => offer.isActive === params.isActive);
        }

        if (params.searchTerm) {
          const searchLower = params.searchTerm.toLowerCase();
          filtered = filtered.filter(offer => 
            offer.title.toLowerCase().includes(searchLower) ||
            offer.description.toLowerCase().includes(searchLower) ||
            (offer.referralCode && offer.referralCode.toLowerCase().includes(searchLower))
          );
        }

        // Apply sorting
        if (params.sortBy) {
          filtered.sort((a, b) => {
            const aValue = a[params.sortBy as keyof ReferralOffer];
            const bValue = b[params.sortBy as keyof ReferralOffer];
            
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;
            
            if (aValue < bValue) return params.sortDirection === 'desc' ? 1 : -1;
            if (aValue > bValue) return params.sortDirection === 'desc' ? -1 : 1;
            return 0;
          });
        } else {
          // Default sort by updatedAt (newest first)
          filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
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
   * Get offers by category
   */
  getOffersByCategory(categoryId: string): Observable<ReferralOffer[]> {
    return this.offers$.pipe(
      map(offers => offers.filter(offer => 
        offer.categoryId === categoryId && offer.isActive
      ))
    );
  }

  /**
   * Get offer by ID
   */
  getOfferById(id: string): Observable<ReferralOffer | undefined> {
    return this.offers$.pipe(
      map(offers => offers.find(offer => offer.id === id))
    );
  }

  /**
   * Create a new offer
   */
  createOffer(request: CreateReferralOfferRequest): Observable<ApiResponse<ReferralOffer>> {
    try {
      const offers = this.offersSubject.value;
      
      // Check if referral code is unique within the category (if provided)
      if (request.referralCode) {
        const existingOffer = offers.find(offer => 
          offer.categoryId === request.categoryId && 
          offer.referralCode === request.referralCode
        );
        
        if (existingOffer) {
          return of({
            success: false,
            error: 'Referral code already exists in this category'
          });
        }
      }

      const newOffer: ReferralOffer = {
        id: this.generateId(),
        title: request.title,
        description: request.description,
        referralLink: request.referralLink,
        referralCode: request.referralCode,
        categoryId: request.categoryId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        clickCount: 0
      };

      const updatedOffers = [...offers, newOffer];
      this.saveOffers(updatedOffers);

      return of({
        success: true,
        data: newOffer,
        message: 'Offer created successfully'
      });
    } catch (error) {
      return of({
        success: false,
        error: 'Failed to create offer'
      });
    }
  }

  /**
   * Update an existing offer
   */
  updateOffer(request: UpdateReferralOfferRequest): Observable<ApiResponse<ReferralOffer>> {
    try {
      const offers = this.offersSubject.value;
      const offerIndex = offers.findIndex(offer => offer.id === request.id);

      if (offerIndex === -1) {
        return of({
          success: false,
          error: 'Offer not found'
        });
      }

      // Check for duplicate referral code (excluding current offer)
      if (request.referralCode) {
        const duplicateOffer = offers.find(offer => 
          offer.id !== request.id && 
          offer.categoryId === (request.categoryId || offers[offerIndex].categoryId) &&
          offer.referralCode === request.referralCode
        );
        
        if (duplicateOffer) {
          return of({
            success: false,
            error: 'Referral code already exists in this category'
          });
        }
      }

      const updatedOffer: ReferralOffer = {
        ...offers[offerIndex],
        ...request,
        id: request.id, // Ensure ID doesn't change
        updatedAt: new Date()
      };

      const updatedOffers = [...offers];
      updatedOffers[offerIndex] = updatedOffer;
      this.saveOffers(updatedOffers);

      return of({
        success: true,
        data: updatedOffer,
        message: 'Offer updated successfully'
      });
    } catch (error) {
      return of({
        success: false,
        error: 'Failed to update offer'
      });
    }
  }

  /**
   * Delete an offer
   */
  deleteOffer(id: string): Observable<ApiResponse<void>> {
    try {
      const offers = this.offersSubject.value;
      const offerExists = offers.some(offer => offer.id === id);

      if (!offerExists) {
        return of({
          success: false,
          error: 'Offer not found'
        });
      }

      const updatedOffers = offers.filter(offer => offer.id !== id);
      this.saveOffers(updatedOffers);

      return of({
        success: true,
        message: 'Offer deleted successfully'
      });
    } catch (error) {
      return of({
        success: false,
        error: 'Failed to delete offer'
      });
    }
  }

  /**
   * Toggle offer active status
   */
  toggleOfferStatus(id: string): Observable<ApiResponse<ReferralOffer>> {
    const offers = this.offersSubject.value;
    const offerIndex = offers.findIndex(offer => offer.id === id);

    if (offerIndex === -1) {
      return of({
        success: false,
        error: 'Offer not found'
      });
    }

    const updatedOffer = {
      ...offers[offerIndex],
      isActive: !offers[offerIndex].isActive,
      updatedAt: new Date()
    };

    const updatedOffers = [...offers];
    updatedOffers[offerIndex] = updatedOffer;
    this.saveOffers(updatedOffers);

    return of({
      success: true,
      data: updatedOffer,
      message: `Offer ${updatedOffer.isActive ? 'activated' : 'deactivated'} successfully`
    });
  }

  /**
   * Track click on referral link
   */
  trackClick(id: string): Observable<ApiResponse<void>> {
    const offers = this.offersSubject.value;
    const offerIndex = offers.findIndex(offer => offer.id === id);

    if (offerIndex === -1) {
      return of({
        success: false,
        error: 'Offer not found'
      });
    }

    const updatedOffer = {
      ...offers[offerIndex],
      clickCount: (offers[offerIndex].clickCount || 0) + 1,
      updatedAt: new Date()
    };

    const updatedOffers = [...offers];
    updatedOffers[offerIndex] = updatedOffer;
    this.saveOffers(updatedOffers);

    return of({
      success: true,
      message: 'Click tracked successfully'
    });
  }

  /**
   * Get offer statistics
   */
  getOfferStats(): Observable<{
    totalOffers: number;
    activeOffers: number;
    totalClicks: number;
    offersByCategory: { [categoryId: string]: number };
  }> {
    return this.offers$.pipe(
      map(offers => {
        const offersByCategory: { [categoryId: string]: number } = {};
        
        offers.forEach(offer => {
          if (offer.isActive) {
            offersByCategory[offer.categoryId] = (offersByCategory[offer.categoryId] || 0) + 1;
          }
        });

        return {
          totalOffers: offers.length,
          activeOffers: offers.filter(offer => offer.isActive).length,
          totalClicks: offers.reduce((sum, offer) => sum + (offer.clickCount || 0), 0),
          offersByCategory
        };
      })
    );
  }

  /**
   * Search offers across all categories
   */
  searchOffers(searchTerm: string, limit: number = 10): Observable<ReferralOffer[]> {
    return this.offers$.pipe(
      map(offers => {
        if (!searchTerm.trim()) {
          return [];
        }

        const searchLower = searchTerm.toLowerCase();
        return offers
          .filter(offer => 
            offer.isActive && (
              offer.title.toLowerCase().includes(searchLower) ||
              offer.description.toLowerCase().includes(searchLower) ||
              (offer.referralCode && offer.referralCode.toLowerCase().includes(searchLower))
            )
          )
          .slice(0, limit);
      })
    );
  }

  /**
   * Bulk update offers
   */
  bulkUpdateOffers(offerIds: string[], updates: Partial<ReferralOffer>): Observable<ApiResponse<ReferralOffer[]>> {
    try {
      const offers = this.offersSubject.value;
      const updatedOffers = [...offers];
      const modifiedOffers: ReferralOffer[] = [];

      offerIds.forEach(id => {
        const offerIndex = updatedOffers.findIndex(offer => offer.id === id);
        if (offerIndex !== -1) {
          updatedOffers[offerIndex] = {
            ...updatedOffers[offerIndex],
            ...updates,
            id, // Preserve original ID
            updatedAt: new Date()
          };
          modifiedOffers.push(updatedOffers[offerIndex]);
        }
      });

      if (modifiedOffers.length === 0) {
        return of({
          success: false,
          error: 'No offers found to update'
        });
      }

      this.saveOffers(updatedOffers);

      return of({
        success: true,
        data: modifiedOffers,
        message: `${modifiedOffers.length} offers updated successfully`
      });
    } catch (error) {
      return of({
        success: false,
        error: 'Failed to bulk update offers'
      });
    }
  }

  /**
   * Generate a unique ID for new offers
   */
  private generateId(): string {
    return 'offer_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}