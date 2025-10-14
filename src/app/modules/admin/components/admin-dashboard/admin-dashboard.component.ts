import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AuthService, AdminUser } from '../../../../services/auth.service';
import { CategoryService } from '../../../../services/category.service';
import { ReferralService } from '../../../../services/referral.service';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

interface DashboardStats {
  totalCategories: number;
  activeCategories: number;
  totalOffers: number;
  activeOffers: number;
  totalClicks: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser$: Observable<AdminUser | null>;
  isHandset$: Observable<boolean>;
  stats$: Observable<DashboardStats>;
  
  navigationItems: NavigationItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin' },
    { label: 'Categories', icon: 'category', route: '/admin/categories' },
    { label: 'Offers', icon: 'local_offer', route: '/admin/offers' },
    { label: 'Utilities', icon: 'build', route: '/admin/utilities' },
    { label: 'Settings', icon: 'settings', route: '/admin/settings' }
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private categoryService: CategoryService,
    private referralService: ReferralService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(map(result => result.matches));

    // Combine stats from both services
    this.stats$ = combineLatest([
      this.categoryService.getCategoryStats(),
      this.referralService.getOfferStats()
    ]).pipe(
      map(([categoryStats, offerStats]) => ({
        totalCategories: categoryStats.totalCategories,
        activeCategories: categoryStats.activeCategories,
        totalOffers: offerStats.totalOffers,
        activeOffers: offerStats.activeOffers,
        totalClicks: offerStats.totalClicks
      }))
    );
  }

  ngOnInit(): void {
    // Update navigation badges based on stats
    this.stats$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(stats => {
      this.updateNavigationBadges(stats);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateNavigationBadges(stats: DashboardStats): void {
    // Update categories badge
    const categoriesItem = this.navigationItems.find(item => item.route === '/admin/categories');
    if (categoriesItem) {
      categoriesItem.badge = stats.activeCategories;
    }

    // Update offers badge
    const offersItem = this.navigationItems.find(item => item.route === '/admin/offers');
    if (offersItem) {
      offersItem.badge = stats.activeOffers;
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onNavigate(route: string): void {
    this.router.navigate([route]);
  }

  onViewPublicSite(): void {
    window.open('/', '_blank');
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}