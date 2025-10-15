import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private readonly version = '2.1.0';
  private readonly buildDate = '2025-01-15T08:45:00Z';
  private readonly buildNumber = Date.now().toString();

  constructor() {
    // Log version info to console for debugging
    console.log(`🚀 Referral Dashboard v${this.version}`);
    console.log(`📅 Build Date: ${this.buildDate}`);
    console.log(`🔢 Build Number: ${this.buildNumber}`);
  }

  getVersion(): string {
    return this.version;
  }

  getBuildDate(): string {
    return this.buildDate;
  }

  getBuildNumber(): string {
    return this.buildNumber;
  }

  getFullVersionInfo(): { version: string; buildDate: string; buildNumber: string } {
    return {
      version: this.version,
      buildDate: this.buildDate,
      buildNumber: this.buildNumber
    };
  }

  // Method to check if this is a fresh deployment
  checkDeploymentFreshness(): boolean {
    const lastKnownBuild = localStorage.getItem('lastKnownBuild');
    const currentBuild = this.buildNumber;
    
    if (lastKnownBuild !== currentBuild) {
      localStorage.setItem('lastKnownBuild', currentBuild);
      console.log('🆕 New deployment detected!');
      return true;
    }
    
    return false;
  }

  // Force cache refresh if needed
  forceCacheRefresh(): void {
    if (this.checkDeploymentFreshness()) {
      console.log('🔄 Clearing cache for new deployment...');
      
      // Clear relevant caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Clear localStorage items that might be cached
      const keysToRemove = ['categories', 'offers', 'lastUpdate'];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }
}