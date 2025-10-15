import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InstantRefreshService } from '../../../services/instant-refresh.service';

@Component({
  selector: 'app-update-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <!-- This component handles update notifications via snackbar -->
  `,
  styles: [`
    :host {
      display: none;
    }
  `]
})
export class UpdateNotificationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private instantRefreshService: InstantRefreshService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Listen for update notifications
    this.instantRefreshService.getUpdateAvailable$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(updateAvailable => {
        if (updateAvailable) {
          this.showUpdateNotification();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private showUpdateNotification(): void {
    const snackBarRef = this.snackBar.open(
      '🆕 New update available! Refresh to see the latest changes.',
      'REFRESH NOW',
      {
        duration: 0, // Don't auto-dismiss
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['update-snackbar']
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.instantRefreshService.forceRefresh();
    });

    // Auto-dismiss after 30 seconds if user doesn't act
    setTimeout(() => {
      if (snackBarRef) {
        snackBarRef.dismiss();
        this.instantRefreshService.dismissUpdate();
      }
    }, 30000);
  }
}