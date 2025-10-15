import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  conversionRate: number;
  averageCommission: number;
  topPerformingOffers: OfferPerformance[];
  revenueByCategory: CategoryRevenue[];
  monthlyTrend: MonthlyRevenue[];
}

export interface OfferPerformance {
  offerId: string;
  title: string;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  category: string;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  conversions: number;
  averageCommission: number;
  percentage: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  conversions: number;
  growth: number;
}

export interface ConversionEvent {
  id: string;
  offerId: string;
  offerTitle: string;
  category: string;
  timestamp: Date;
  commission: number;
  userId?: string;
  source: string;
  conversionType: 'signup' | 'purchase' | 'subscription' | 'lead';
}

@Injectable({
  providedIn: 'root'
})
export class RevenueTrackingService {
  private revenueMetricsSubject = new BehaviorSubject<RevenueMetrics | null>(null);
  public revenueMetrics$ = this.revenueMetricsSubject.asObservable();

  private conversions: ConversionEvent[] = [];
  private clickTracking: { [offerId: string]: number } = {};

  constructor() {
    this.initializeRevenueTracking();
    this.loadStoredData();
  }

  private initializeRevenueTracking(): void {
    // Initialize with sample data for demonstration
    this.generateSampleData();
    this.calculateMetrics();
  }

  private loadStoredData(): void {
    const storedConversions = localStorage.getItem('revenueConversions');
    const storedClicks = localStorage.getItem('clickTracking');
    
    if (storedConversions) {
      this.conversions = JSON.parse(storedConversions);
    }
    
    if (storedClicks) {
      this.clickTracking = JSON.parse(storedClicks);
    }
  }

  private saveData(): void {
    localStorage.setItem('revenueConversions', JSON.stringify(this.conversions));
    localStorage.setItem('clickTracking', JSON.stringify(this.clickTracking));
  }

  // Track offer clicks
  trackOfferClick(offerId: string, offerTitle: string, category: string): void {
    if (!this.clickTracking[offerId]) {
      this.clickTracking[offerId] = 0;
    }
    this.clickTracking[offerId]++;
    
    console.log('💰 Offer click tracked:', {
      offerId,
      offerTitle,
      category,
      totalClicks: this.clickTracking[offerId],
      timestamp: new Date()
    });
    
    this.saveData();
    this.calculateMetrics();
  }

  // Record conversion (when user completes action)
  recordConversion(
    offerId: string,
    offerTitle: string,
    category: string,
    commission: number,
    conversionType: 'signup' | 'purchase' | 'subscription' | 'lead',
    userId?: string
  ): void {
    const conversion: ConversionEvent = {
      id: this.generateId(),
      offerId,
      offerTitle,
      category,
      timestamp: new Date(),
      commission,
      userId,
      source: 'referral-dashboard',
      conversionType
    };
    
    this.conversions.push(conversion);
    
    console.log('🎉 Conversion recorded:', conversion);
    
    this.saveData();
    this.calculateMetrics();
    
    // Show success notification
    this.showConversionNotification(conversion);
  }

  private showConversionNotification(conversion: ConversionEvent): void {
    // In a real app, this would show a toast notification
    console.log(`💰 New conversion! ₹${conversion.commission} from ${conversion.offerTitle}`);
  }

  private calculateMetrics(): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate total revenue
    const totalRevenue = this.conversions.reduce((sum, conv) => sum + conv.commission, 0);
    
    // Calculate monthly revenue
    const monthlyConversions = this.conversions.filter(conv => 
      conv.timestamp >= startOfMonth
    );
    const monthlyRevenue = monthlyConversions.reduce((sum, conv) => sum + conv.commission, 0);
    
    // Calculate daily revenue
    const dailyConversions = this.conversions.filter(conv => 
      conv.timestamp >= startOfDay
    );
    const dailyRevenue = dailyConversions.reduce((sum, conv) => sum + conv.commission, 0);
    
    // Calculate conversion rate
    const totalClicks = Object.values(this.clickTracking).reduce((sum, clicks) => sum + clicks, 0);
    const conversionRate = totalClicks > 0 ? (this.conversions.length / totalClicks) * 100 : 0;
    
    // Calculate average commission
    const averageCommission = this.conversions.length > 0 ? 
      totalRevenue / this.conversions.length : 0;
    
    // Calculate top performing offers
    const topPerformingOffers = this.calculateTopPerformingOffers();
    
    // Calculate revenue by category
    const revenueByCategory = this.calculateRevenueByCategory();
    
    // Calculate monthly trend
    const monthlyTrend = this.calculateMonthlyTrend();
    
    const metrics: RevenueMetrics = {
      totalRevenue,
      monthlyRevenue,
      dailyRevenue,
      conversionRate,
      averageCommission,
      topPerformingOffers,
      revenueByCategory,
      monthlyTrend
    };
    
    this.revenueMetricsSubject.next(metrics);
  }

  private calculateTopPerformingOffers(): OfferPerformance[] {
    const offerMap = new Map<string, OfferPerformance>();
    
    // Initialize with clicks
    Object.entries(this.clickTracking).forEach(([offerId, clicks]) => {
      if (!offerMap.has(offerId)) {
        offerMap.set(offerId, {
          offerId,
          title: this.getOfferTitle(offerId),
          clicks,
          conversions: 0,
          revenue: 0,
          conversionRate: 0,
          category: this.getOfferCategory(offerId)
        });
      }
    });
    
    // Add conversions
    this.conversions.forEach(conv => {
      if (offerMap.has(conv.offerId)) {
        const offer = offerMap.get(conv.offerId)!;
        offer.conversions++;
        offer.revenue += conv.commission;
        offer.conversionRate = (offer.conversions / offer.clicks) * 100;
      }
    });
    
    return Array.from(offerMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private calculateRevenueByCategory(): CategoryRevenue[] {
    const categoryMap = new Map<string, CategoryRevenue>();
    
    this.conversions.forEach(conv => {
      if (!categoryMap.has(conv.category)) {
        categoryMap.set(conv.category, {
          category: conv.category,
          revenue: 0,
          conversions: 0,
          averageCommission: 0,
          percentage: 0
        });
      }
      
      const category = categoryMap.get(conv.category)!;
      category.revenue += conv.commission;
      category.conversions++;
    });
    
    const totalRevenue = this.conversions.reduce((sum, conv) => sum + conv.commission, 0);
    
    // Calculate percentages and averages
    categoryMap.forEach(category => {
      category.averageCommission = category.revenue / category.conversions;
      category.percentage = totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0;
    });
    
    return Array.from(categoryMap.values())
      .sort((a, b) => b.revenue - a.revenue);
  }

  private calculateMonthlyTrend(): MonthlyRevenue[] {
    const monthlyMap = new Map<string, MonthlyRevenue>();
    
    this.conversions.forEach(conv => {
      const monthKey = conv.timestamp.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          revenue: 0,
          conversions: 0,
          growth: 0
        });
      }
      
      const month = monthlyMap.get(monthKey)!;
      month.revenue += conv.commission;
      month.conversions++;
    });
    
    const months = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    
    // Calculate growth rates
    for (let i = 1; i < months.length; i++) {
      const current = months[i];
      const previous = months[i - 1];
      current.growth = previous.revenue > 0 ? 
        ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;
    }
    
    return months;
  }

  private getOfferTitle(offerId: string): string {
    // In a real app, this would fetch from your offers service
    const offerTitles: { [key: string]: string } = {
      'zerodha-referral': 'Zerodha Demat Account',
      'upstox-referral': 'Upstox Trading Account',
      'groww-referral': 'Groww Investment Platform',
      'hdfc-credit-card': 'HDFC Credit Card',
      'makemytrip-hotels': 'MakeMyTrip Hotel Booking'
    };
    return offerTitles[offerId] || `Offer ${offerId}`;
  }

  private getOfferCategory(offerId: string): string {
    // In a real app, this would fetch from your offers service
    const offerCategories: { [key: string]: string } = {
      'zerodha-referral': 'demat-account',
      'upstox-referral': 'demat-account',
      'groww-referral': 'demat-account',
      'hdfc-credit-card': 'credit-cards',
      'makemytrip-hotels': 'hospitality-hotel'
    };
    return offerCategories[offerId] || 'general';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private generateSampleData(): void {
    // Generate sample conversions for demonstration
    const sampleConversions: ConversionEvent[] = [
      {
        id: '1',
        offerId: 'zerodha-referral',
        offerTitle: 'Zerodha Demat Account',
        category: 'demat-account',
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        commission: 1500,
        conversionType: 'signup',
        source: 'referral-dashboard'
      },
      {
        id: '2',
        offerId: 'upstox-referral',
        offerTitle: 'Upstox Trading Account',
        category: 'demat-account',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        commission: 1200,
        conversionType: 'signup',
        source: 'referral-dashboard'
      },
      {
        id: '3',
        offerId: 'hdfc-credit-card',
        offerTitle: 'HDFC Credit Card',
        category: 'credit-cards',
        timestamp: new Date(Date.now() - 259200000), // 3 days ago
        commission: 2500,
        conversionType: 'signup',
        source: 'referral-dashboard'
      }
    ];
    
    // Only add sample data if no real data exists
    if (this.conversions.length === 0) {
      this.conversions = sampleConversions;
    }
    
    // Sample click data
    if (Object.keys(this.clickTracking).length === 0) {
      this.clickTracking = {
        'zerodha-referral': 45,
        'upstox-referral': 38,
        'groww-referral': 32,
        'hdfc-credit-card': 28,
        'makemytrip-hotels': 52
      };
    }
  }

  // Public methods for components
  getRevenueMetrics(): Observable<RevenueMetrics | null> {
    return this.revenueMetrics$;
  }

  getCurrentMetrics(): RevenueMetrics | null {
    return this.revenueMetricsSubject.value;
  }

  getConversions(): ConversionEvent[] {
    return [...this.conversions];
  }

  getClickTracking(): { [offerId: string]: number } {
    return { ...this.clickTracking };
  }

  // Export data for analysis
  exportRevenueData(): string {
    const data = {
      conversions: this.conversions,
      clickTracking: this.clickTracking,
      metrics: this.getCurrentMetrics(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Clear all data (admin function)
  clearAllData(): void {
    this.conversions = [];
    this.clickTracking = {};
    localStorage.removeItem('revenueConversions');
    localStorage.removeItem('clickTracking');
    this.calculateMetrics();
  }

  // Get revenue projections
  getRevenueProjections(): any {
    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) return null;
    
    const monthlyAverage = currentMetrics.monthlyRevenue;
    const growthRate = 0.15; // 15% monthly growth assumption
    
    return {
      nextMonth: monthlyAverage * (1 + growthRate),
      next3Months: monthlyAverage * 3 * (1 + growthRate),
      next6Months: monthlyAverage * 6 * (1 + growthRate * 1.5),
      nextYear: monthlyAverage * 12 * (1 + growthRate * 2)
    };
  }
}