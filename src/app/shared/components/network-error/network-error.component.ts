import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-network-error',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="network-error-container">
      <mat-card class="network-error-card">
        <mat-card-content>
          <div class="network-error-content">
            <div class="error-icon" [class.offline]="!isOnline">
              <mat-icon>{{ isOnline ? 'wifi' : 'wifi_off' }}</mat-icon>
            </div>
            
            <h1 class="error-title">
              {{ isOnline ? 'Connection Restored!' : 'No Internet Connection' }}
            </h1>
            
            <p class="error-message" *ngIf="!isOnline">
              Please check your internet connection and try again.
              We'll automatically retry when your connection is restored.
            </p>
            
            <p class="error-message" *ngIf="isOnline">
              Your internet connection has been restored. You can continue using the application.
            </p>
            
            <div class="connection-status">
              <div class="status-indicator" [class.online]="isOnline" [class.offline]="!isOnline">
                <span class="status-dot"></span>
                <span class="status-text">{{ isOnline ? 'Online' : 'Offline' }}</span>
              </div>
            </div>
            
            <div class="error-actions" *ngIf="!isOnline">
              <button 
                mat-raised-button 
                color="primary"
                (click)="retryConnection()"
                [disabled]="isRetrying"
                class="action-button">
                <mat-icon>refresh</mat-icon>
                {{ isRetrying ? 'Checking...' : 'Try Again' }}
              </button>
              
              <button 
                mat-stroked-button 
                color="primary"
                (click)="goOffline()"
                class="action-button">
                <mat-icon>offline_bolt</mat-icon>
                Continue Offline
              </button>
            </div>
            
            <div class="error-actions" *ngIf="isOnline">
              <button 
                mat-raised-button 
                color="primary"
                (click)="reload()"
                class="action-button">
                <mat-icon>refresh</mat-icon>
                Reload Page
              </button>
            </div>
            
            <div class="offline-tips" *ngIf="!isOnline">
              <h3>While you're offline:</h3>
              <ul>
                <li>Previously loaded content may still be available</li>
                <li>Your data will be saved locally when possible</li>
                <li>Changes will sync when connection is restored</li>
              </ul>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .network-error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      padding: 20px;
    }
    
    .network-error-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .network-error-content {
      padding: 40px 20px;
    }
    
    .error-icon {
      margin-bottom: 24px;
      
      mat-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        color: #4caf50;
        transition: color 0.3s ease;
      }
      
      &.offline mat-icon {
        color: #f44336;
      }
    }
    
    .error-title {
      font-size: 2rem;
      font-weight: 500;
      margin: 0 0 16px 0;
      color: #333;
    }
    
    .error-message {
      font-size: 1.1rem;
      color: #666;
      line-height: 1.5;
      margin: 0 0 24px 0;
    }
    
    .connection-status {
      margin: 24px 0;
    }
    
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
      
      &.online {
        background-color: rgba(76, 175, 80, 0.1);
        color: #4caf50;
        
        .status-dot {
          background-color: #4caf50;
        }
      }
      
      &.offline {
        background-color: rgba(244, 67, 54, 0.1);
        color: #f44336;
        
        .status-dot {
          background-color: #f44336;
        }
      }
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    .error-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      margin: 32px 0;
      
      @media (min-width: 480px) {
        flex-direction: row;
        justify-content: center;
      }
    }
    
    .action-button {
      min-width: 140px;
      
      mat-icon {
        margin-right: 8px;
      }
    }
    
    .offline-tips {
      border-top: 1px solid #e0e0e0;
      padding-top: 24px;
      text-align: left;
      
      h3 {
        font-size: 1.1rem;
        margin: 0 0 12px 0;
        color: #333;
        text-align: center;
      }
      
      ul {
        margin: 0;
        padding-left: 20px;
        color: #666;
        
        li {
          margin-bottom: 8px;
          line-height: 1.4;
        }
      }
    }
    
    @media (max-width: 480px) {
      .network-error-content {
        padding: 20px 16px;
      }
      
      .error-title {
        font-size: 1.5rem;
      }
      
      .error-icon mat-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
      }
    }
  `]
})
export class NetworkErrorComponent implements OnInit, OnDestroy {
  isOnline = navigator.onLine;
  isRetrying = false;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Listen for online/offline events
    fromEvent(window, 'online').pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isOnline = true;
    });

    fromEvent(window, 'offline').pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isOnline = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retryConnection(): void {
    this.isRetrying = true;
    
    // Simulate checking connection
    setTimeout(() => {
      this.isOnline = navigator.onLine;
      this.isRetrying = false;
      
      if (this.isOnline) {
        // Optionally reload the page or emit an event
        window.location.reload();
      }
    }, 2000);
  }

  goOffline(): void {
    // Handle offline mode - you can emit an event or navigate
    console.log('Continuing in offline mode');
  }

  reload(): void {
    window.location.reload();
  }
}