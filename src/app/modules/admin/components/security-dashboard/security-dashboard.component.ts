import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { SecureAuthService } from '../../../../services/secure-auth.service';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="security-dashboard">
      <h2>🔐 Security Dashboard</h2>
      
      <!-- Current Session Info -->
      <mat-card class="session-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>account_circle</mat-icon>
            Current Session
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="session-info" *ngIf="securityData">
            <div class="info-row">
              <strong>Username:</strong> {{ securityData.currentSession.username }}
            </div>
            <div class="info-row">
              <strong>Login Time:</strong> {{ securityData.currentSession.loginTime | date:'medium' }}
            </div>
            <div class="info-row">
              <strong>Session ID:</strong> {{ securityData.currentSession.sessionId }}
            </div>
            <div class="info-row">
              <strong>IP Address:</strong> {{ securityData.currentSession.ipAddress }}
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="warn" (click)="forceLogoutAll()">
            <mat-icon>logout</mat-icon>
            Force Logout All Sessions
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Security Statistics -->
      <mat-card class="stats-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>analytics</mat-icon>
            Security Statistics (Last 24 Hours)
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="stats-grid" *ngIf="securityData">
            <div class="stat-item success">
              <div class="stat-number">{{ securityData.recentActivity.successfulLogins }}</div>
              <div class="stat-label">Successful Logins</div>
            </div>
            <div class="stat-item error">
              <div class="stat-number">{{ securityData.recentActivity.failedAttempts }}</div>
              <div class="stat-label">Failed Attempts</div>
            </div>
            <div class="stat-item info">
              <div class="stat-number">{{ securityData.recentActivity.totalAttempts }}</div>
              <div class="stat-label">Total Attempts</div>
            </div>
            <div class="stat-item warning">
              <div class="stat-number">{{ securityData.recentActivity.uniqueIPs }}</div>
              <div class="stat-label">Unique IPs</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Security Settings -->
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>security</mat-icon>
            Security Configuration
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="security-settings" *ngIf="securityData">
            <div class="setting-item">
              <mat-icon>timer</mat-icon>
              <span><strong>Session Timeout:</strong> {{ securityData.security.sessionTimeout }}</span>
            </div>
            <div class="setting-item">
              <mat-icon>block</mat-icon>
              <span><strong>Max Login Attempts:</strong> {{ securityData.security.maxAttempts }}</span>
            </div>
            <div class="setting-item">
              <mat-icon>lock_clock</mat-icon>
              <span><strong>Lockout Duration:</strong> {{ securityData.security.lockoutDuration }}</span>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="changePassword()">
            <mat-icon>vpn_key</mat-icon>
            Change Password
          </button>
          <button mat-button (click)="refreshSecurityData()">
            <mat-icon>refresh</mat-icon>
            Refresh Data
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Security Tips -->
      <mat-card class="tips-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>lightbulb</mat-icon>
            Security Best Practices
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="security-tips">
            <mat-chip-listbox>
              <mat-chip-option *ngFor="let tip of securityTips">
                {{ tip }}
              </mat-chip-option>
            </mat-chip-listbox>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .security-dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .security-dashboard h2 {
      margin-bottom: 20px;
      color: #1976d2;
    }

    .session-card, .stats-card, .settings-card, .tips-card {
      margin-bottom: 20px;
    }

    .session-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-row {
      padding: 4px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin: 16px 0;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      border-radius: 8px;
      border: 2px solid;
    }

    .stat-item.success {
      border-color: #4caf50;
      background-color: rgba(76, 175, 80, 0.1);
    }

    .stat-item.error {
      border-color: #f44336;
      background-color: rgba(244, 67, 54, 0.1);
    }

    .stat-item.info {
      border-color: #2196f3;
      background-color: rgba(33, 150, 243, 0.1);
    }

    .stat-item.warning {
      border-color: #ff9800;
      background-color: rgba(255, 152, 0, 0.1);
    }

    .stat-number {
      font-size: 2em;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.9em;
      opacity: 0.8;
    }

    .security-settings {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .security-tips {
      margin: 16px 0;
    }

    mat-chip-listbox {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .security-dashboard {
        padding: 10px;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class SecurityDashboardComponent implements OnInit {
  securityData: any = null;
  securityTips = [
    '🔐 Use strong, unique passwords',
    '🚫 Never share admin credentials',
    '⏰ Log out when finished',
    '🔍 Monitor login attempts regularly',
    '📱 Use secure networks only',
    '🔄 Change passwords periodically',
    '👀 Review security logs weekly'
  ];

  constructor(
    private secureAuthService: SecureAuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSecurityData();
  }

  loadSecurityData(): void {
    this.securityData = this.secureAuthService.getSecurityDashboard();
    
    if (!this.securityData) {
      this.snackBar.open('⚠️ Security data not available. Please login first.', 'Close', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  refreshSecurityData(): void {
    this.loadSecurityData();
    this.snackBar.open('🔄 Security data refreshed', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  forceLogoutAll(): void {
    const confirmed = confirm(
      '⚠️ This will log out all active sessions and require re-authentication. Continue?'
    );
    
    if (confirmed) {
      this.secureAuthService.forceLogoutAllSessions();
      this.snackBar.open('🚨 All sessions logged out successfully', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  changePassword(): void {
    const currentPassword = prompt('🔐 Enter current password:');
    if (!currentPassword) return;
    
    const newPassword = prompt('🆕 Enter new password (min 12 chars, mixed case, numbers, symbols):');
    if (!newPassword) return;
    
    const confirmPassword = prompt('✅ Confirm new password:');
    if (newPassword !== confirmPassword) {
      this.snackBar.open('❌ Passwords do not match', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.secureAuthService.changePassword(currentPassword, newPassword)
      .then(() => {
        this.snackBar.open('✅ Password changed successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      })
      .catch((error) => {
        this.snackBar.open(`❌ ${error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      });
  }
}