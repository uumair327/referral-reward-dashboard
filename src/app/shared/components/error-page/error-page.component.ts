import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

export interface ErrorPageConfig {
  title: string;
  message: string;
  icon: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  customActions?: Array<{
    label: string;
    action: () => void;
    color?: 'primary' | 'accent' | 'warn';
  }>;
}

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="error-page-container">
      <mat-card class="error-card">
        <mat-card-content>
          <div class="error-content">
            <div class="error-icon">
              <mat-icon>{{ config.icon }}</mat-icon>
            </div>
            
            <h1 class="error-title">{{ config.title }}</h1>
            <p class="error-message">{{ config.message }}</p>
            
            <div class="error-actions">
              <button 
                *ngIf="config.showHomeButton !== false"
                mat-raised-button 
                color="primary"
                routerLink="/"
                class="action-button">
                <mat-icon>home</mat-icon>
                Go Home
              </button>
              
              <button 
                *ngIf="config.showBackButton"
                mat-stroked-button 
                color="primary"
                (click)="goBack()"
                class="action-button">
                <mat-icon>arrow_back</mat-icon>
                Go Back
              </button>
              
              <button 
                *ngFor="let action of config.customActions"
                mat-button
                [color]="action.color || 'primary'"
                (click)="action.action()"
                class="action-button">
                {{ action.label }}
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .error-page-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 20px;
    }
    
    .error-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .error-content {
      padding: 40px 20px;
    }
    
    .error-icon {
      margin-bottom: 24px;
      
      mat-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        color: #666;
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
      margin: 0 0 32px 0;
    }
    
    .error-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      
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
    
    @media (max-width: 480px) {
      .error-content {
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
export class ErrorPageComponent {
  @Input() config: ErrorPageConfig = {
    title: 'Oops! Something went wrong',
    message: 'We encountered an unexpected error. Please try again later.',
    icon: 'error_outline'
  };

  goBack(): void {
    window.history.back();
  }
}