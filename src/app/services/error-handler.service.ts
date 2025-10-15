import { Injectable, ErrorHandler } from '@angular/core';
import { Router } from '@angular/router';

export interface AppError {
  message: string;
  stack?: string;
  timestamp: Date;
  url?: string;
  userAgent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private router: Router) {}

  handleError(error: any): void {
    const appError: AppError = {
      message: error.message || 'An unexpected error occurred',
      stack: error.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Log error to console in development
    if (!this.isProduction()) {
      console.error('Global Error Handler:', error);
      console.error('Error Details:', appError);
    }

    // Log error to external service in production
    if (this.isProduction()) {
      this.logErrorToService(appError);
    }

    // Handle specific error types
    this.handleSpecificErrors(error);
  }

  private handleSpecificErrors(error: any): void {
    // Handle network errors
    if (this.isNetworkError(error)) {
      this.showNetworkErrorMessage();
      return;
    }

    // Handle authentication errors
    if (this.isAuthError(error)) {
      this.handleAuthError();
      return;
    }

    // Handle route not found errors
    if (this.isRouteError(error)) {
      this.router.navigate(['/404']);
      return;
    }

    // Default error handling
    this.showGenericErrorMessage();
  }

  private isNetworkError(error: any): boolean {
    return error.name === 'HttpErrorResponse' || 
           error.message?.includes('Network') ||
           error.message?.includes('fetch');
  }

  private isAuthError(error: any): boolean {
    return error.status === 401 || 
           error.status === 403 ||
           error.message?.includes('Unauthorized');
  }

  private isRouteError(error: any): boolean {
    return error.message?.includes('Cannot match any routes') ||
           error.message?.includes('404');
  }

  private showNetworkErrorMessage(): void {
    // You can integrate with a toast/snackbar service here
    console.warn('Network error detected. Please check your connection.');
  }

  private handleAuthError(): void {
    // Clear any stored auth tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Redirect to login
    this.router.navigate(['/admin']);
  }

  private showGenericErrorMessage(): void {
    console.warn('An unexpected error occurred. Please try again.');
  }

  private logErrorToService(error: AppError): void {
    // In a real application, you would send this to an error tracking service
    // like Sentry, LogRocket, or your own logging endpoint
    
    // For now, we'll store it in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(error);
      
      // Keep only the last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  private isProduction(): boolean {
    return window.location.hostname !== 'localhost' && 
           !window.location.hostname.includes('127.0.0.1');
  }
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private router: Router) {}

  /**
   * Handle application-specific errors
   */
  handleAppError(error: any, context?: string): void {
    console.error(`Error in ${context || 'application'}:`, error);
    
    // You can add specific error handling logic here
    if (error.status === 404) {
      this.router.navigate(['/404']);
    }
  }

  /**
   * Get stored errors for debugging
   */
  getStoredErrors(): AppError[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors(): void {
    localStorage.removeItem('app_errors');
  }

  /**
   * Check if the application is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Handle offline scenarios
   */
  handleOfflineError(): void {
    console.warn('Application is offline. Some features may not work.');
  }
}