import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { SecureAuthService } from '../../../services/secure-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private secureAuthService: SecureAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAdminAccess(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAdminAccess(state.url);
  }

  private checkAdminAccess(url: string): Observable<boolean> {
    // Use secure authentication service
    return this.secureAuthService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user && user.isAuthenticated) {
          // Log access attempt for security monitoring
          console.log('🔐 Admin access granted:', {
            username: user.username,
            url,
            timestamp: new Date().toISOString(),
            sessionId: user.sessionId.substring(0, 8) + '...'
          });
          return true;
        } else {
          // Log unauthorized access attempt
          console.warn('🚨 Unauthorized admin access attempt:', {
            url,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
          });
          
          // Store the attempted URL for redirect after login
          sessionStorage.setItem('admin_redirect_url', url);
          
          // Redirect to admin login
          this.router.navigate(['/admin/login']);
          return false;
        }
      })
    );
  }
}