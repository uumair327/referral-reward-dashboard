import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'admin_auth';
  private readonly DEFAULT_CREDENTIALS = {
    username: 'uumair327',
    password: 'Guest@123' // In production, this would be properly hashed and stored securely
  };

  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadAuthState();
  }

  /**
   * Load authentication state from localStorage
   */
  private loadAuthState(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        if (this.isValidAuthData(authData)) {
          this.currentUserSubject.next(authData);
        } else {
          this.clearAuthState();
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      this.clearAuthState();
    }
  }

  /**
   * Save authentication state to localStorage
   */
  private saveAuthState(user: AdminUser): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Validate stored auth data
   */
  private isValidAuthData(data: any): data is AdminUser {
    return data && 
           typeof data.id === 'string' && 
           typeof data.username === 'string' && 
           typeof data.email === 'string' && 
           typeof data.isAuthenticated === 'boolean' &&
           data.isAuthenticated === true;
  }

  /**
   * Authenticate admin user
   */
  login(username: string, password: string): Observable<{ success: boolean; error?: string; user?: AdminUser }> {
    return new Observable(observer => {
      // Simulate async authentication
      setTimeout(() => {
        if (username === this.DEFAULT_CREDENTIALS.username && 
            password === this.DEFAULT_CREDENTIALS.password) {
          
          const user: AdminUser = {
            id: 'admin_001',
            username: username,
            email: 'uumair327@referralrewards.com',
            isAuthenticated: true
          };

          this.saveAuthState(user);
          
          observer.next({ 
            success: true, 
            user 
          });
        } else {
          observer.next({ 
            success: false, 
            error: 'Invalid username or password' 
          });
        }
        observer.complete();
      }, 500); // Simulate network delay
    });
  }

  /**
   * Logout admin user
   */
  logout(): void {
    this.clearAuthState();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser !== null && currentUser.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has admin privileges (for future role-based access)
   */
  hasAdminAccess(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Refresh authentication token (placeholder for future JWT implementation)
   */
  refreshToken(): Observable<boolean> {
    return new Observable(observer => {
      // In a real implementation, this would refresh the JWT token
      const isAuth = this.isAuthenticated();
      observer.next(isAuth);
      observer.complete();
    });
  }

  /**
   * Change password (placeholder for future implementation)
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean; error?: string }> {
    return new Observable(observer => {
      if (currentPassword === this.DEFAULT_CREDENTIALS.password) {
        // In a real implementation, this would update the password securely
        observer.next({ success: true });
      } else {
        observer.next({ 
          success: false, 
          error: 'Current password is incorrect' 
        });
      }
      observer.complete();
    });
  }
}