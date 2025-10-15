import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
  isHandset$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  currentRoute = '';
  sidenavOpened = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
    
    this.isAdmin$ = this.authService.currentUser$.pipe(
      map(user => user?.isAuthenticated || false)
    );
  }

  ngOnInit(): void {
    // Track current route for navigation highlighting
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      // Close sidenav on navigation for mobile
      this.isHandset$.subscribe(isHandset => {
        if (isHandset) {
          this.sidenavOpened = false;
        }
      });
    });
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  closeSidenav(): void {
    this.sidenavOpened = false;
  }

  isRouteActive(route: string): boolean {
    if (route === '/') {
      return this.currentRoute === '/';
    }
    return this.currentRoute.startsWith(route);
  }

  navigateAndClose(route: string): void {
    this.router.navigate([route]);
    this.closeSidenav();
  }
}