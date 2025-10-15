import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfflineHandlerService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();

  constructor(
    private swUpdate: SwUpdate,
    private router: Router
  ) {
    this.initializeOfflineHandling();
  }

  private initializeOfflineHandling(): void {
    // Listen for online/offline events
    fromEvent(window, 'online').subscribe(() => {
      this.isOnlineSubject.next(true);
      this.handleOnline();
    });

    fromEvent(window, 'offline').subscribe(() => {
      this.isOnlineSubject.next(false);
      this.handleOffline();
    });

    // Handle service worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          if (confirm('New version available. Load new version?')) {
            window.location.reload();
          }
        }
      });
    }
  }

  private handleOnline(): void {
    console.log('Application is back online');
    
    // Sync any pending data
    this.syncPendingData();
    
    // Show success message
    this.showConnectionRestoredMessage();
  }

  private handleOffline(): void {
    console.log('Application is offline');
    
    // Show offline message
    this.showOfflineMessage();
  }

  private syncPendingData(): void {
    // Implement data synchronization logic here
    // This could include syncing localStorage data to server
    console.log('Syncing pending data...');
  }

  private showConnectionRestoredMessage(): void {
    // You can integrate with a toast/snackbar service here
    console.log('Connection restored!');
  }

  private showOfflineMessage(): void {
    // You can integrate with a toast/snackbar service here
    console.log('You are now offline. Some features may be limited.');
  }

  public isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  public navigateToNetworkError(): void {
    this.router.navigate(['/network-error']);
  }

  public retryConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simple connectivity check
      fetch('/assets/icons/icon-72x72.png', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      .then(() => {
        this.isOnlineSubject.next(true);
        resolve(true);
      })
      .catch(() => {
        this.isOnlineSubject.next(false);
        resolve(false);
      });
    });
  }
}