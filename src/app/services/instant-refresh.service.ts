import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InstantRefreshService {
  private readonly baseUrl = 'https://uumair327.github.io/referral-reward-dashboard';
  private lastDeploymentTime = '';
  private checkInterval = 30000; // Check every 30 seconds
  private updateAvailable$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.initializeDeploymentCheck();
  }

  private initializeDeploymentCheck(): void {
    // Get initial deployment time
    this.getDeploymentTime().then(time => {
      this.lastDeploymentTime = time;
      console.log('🕐 Initial deployment time:', time);
    });

    // Check for updates periodically
    interval(this.checkInterval).subscribe(() => {
      this.checkForUpdates();
    });
  }

  private async getDeploymentTime(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/deployment-time.txt?t=${Date.now()}`);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.log('📅 Deployment time check failed, using fallback');
    }
    
    // Fallback to current time if file doesn't exist
    return new Date().toISOString();
  }

  private async checkForUpdates(): Promise<void> {
    try {
      const currentTime = await this.getDeploymentTime();
      
      if (currentTime !== this.lastDeploymentTime && this.lastDeploymentTime !== '') {
        console.log('🆕 New deployment detected!');
        console.log('📅 Previous:', this.lastDeploymentTime);
        console.log('📅 Current:', currentTime);
        
        this.lastDeploymentTime = currentTime;
        this.updateAvailable$.next(true);
        
        // Auto-refresh after a short delay
        setTimeout(() => {
          this.forceRefresh();
        }, 5000);
      }
    } catch (error) {
      console.log('🔍 Update check failed:', error);
    }
  }

  public forceRefresh(): void {
    console.log('🔄 Forcing page refresh...');
    
    // Clear all caches
    this.clearAllCaches();
    
    // Add timestamp to URL to force refresh
    const url = new URL(window.location.href);
    url.searchParams.set('t', Date.now().toString());
    
    // Reload with new URL
    window.location.href = url.toString();
  }

  public clearAllCaches(): void {
    console.log('🧹 Clearing all caches...');
    
    // Clear localStorage
    const keysToRemove = ['categories', 'offers', 'lastUpdate', 'lastKnownBuild'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear service worker caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
  }

  public getUpdateAvailable$() {
    return this.updateAvailable$.asObservable();
  }

  public dismissUpdate(): void {
    this.updateAvailable$.next(false);
  }

  // Manual refresh trigger
  public checkNow(): void {
    console.log('🔍 Manual update check triggered...');
    this.checkForUpdates();
  }

  // Get cache-busted URL
  public getCacheBustedUrl(url: string): string {
    const cacheBustedUrl = new URL(url, window.location.origin);
    cacheBustedUrl.searchParams.set('t', Date.now().toString());
    cacheBustedUrl.searchParams.set('v', this.getVersionHash());
    return cacheBustedUrl.toString();
  }

  private getVersionHash(): string {
    // Create a simple hash based on current time and random number
    return btoa(Date.now().toString() + Math.random().toString()).substring(0, 8);
  }

  // Force immediate cache bypass
  public bypassCache(): void {
    // Add no-cache headers to all future requests
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const headers = new Headers(init?.headers);
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
      
      return originalFetch(input, {
        ...init,
        headers
      });
    };
  }
}