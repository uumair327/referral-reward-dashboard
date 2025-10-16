import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../services/firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-realtime-sync',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sync-indicator" [class.online]="isOnline" [class.syncing]="isSyncing">
      <div class="sync-status">
        <span class="status-dot"></span>
        <span class="status-text">{{ statusText }}</span>
      </div>
      <div class="last-update" *ngIf="lastUpdate">
        Last updated: {{ lastUpdate | date:'short' }}
      </div>
    </div>
  `,
  styles: [`
    .sync-indicator {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .sync-status {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ff4444;
      animation: pulse 2s infinite;
    }

    .sync-indicator.online .status-dot {
      background: #44ff44;
      animation: none;
    }

    .sync-indicator.syncing .status-dot {
      background: #ffaa00;
      animation: pulse 1s infinite;
    }

    .last-update {
      font-size: 10px;
      opacity: 0.8;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    @media (max-width: 768px) {
      .sync-indicator {
        top: 5px;
        right: 5px;
        padding: 6px 10px;
        font-size: 11px;
      }
      
      .last-update {
        display: none;
      }
    }
  `]
})
export class RealtimeSyncComponent implements OnInit, OnDestroy {
  isOnline = false;
  isSyncing = false;
  statusText = 'Offline';
  lastUpdate: Date | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.checkConnectionStatus();
    this.setupDataSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private checkConnectionStatus(): void {
    // Check if we're online
    this.isOnline = navigator.onLine;
    this.updateStatusText();

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateStatusText();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateStatusText();
    });
  }

  private setupDataSubscriptions(): void {
    // Subscribe to categories updates
    const categoriesSub = this.firebaseService.getCategories().subscribe(() => {
      this.onDataUpdate();
    });

    // Subscribe to offers updates
    const offersSub = this.firebaseService.getOffers().subscribe(() => {
      this.onDataUpdate();
    });

    this.subscriptions.push(categoriesSub, offersSub);
  }

  private onDataUpdate(): void {
    this.isSyncing = true;
    this.lastUpdate = new Date();
    this.updateStatusText();

    // Reset syncing status after a short delay
    setTimeout(() => {
      this.isSyncing = false;
      this.updateStatusText();
    }, 1000);
  }

  private updateStatusText(): void {
    if (this.isSyncing) {
      this.statusText = 'Syncing...';
    } else if (this.isOnline) {
      this.statusText = 'Live';
    } else {
      this.statusText = 'Offline';
    }
  }
}