import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="not-found-container">
      <mat-card class="not-found-card">
        <mat-card-content>
          <div class="not-found-content">
            <div class="error-code">404</div>
            <div class="error-icon">
              <mat-icon>search_off</mat-icon>
            </div>
            
            <h1 class="error-title">Page Not Found</h1>
            <p class="error-message">
              The page you're looking for doesn't exist or has been moved.
              <br>
              Let's get you back on track!
            </p>
            
            <div class="error-actions">
              <button 
                mat-raised-button 
                color="primary"
                routerLink="/"
                class="action-button">
                <mat-icon>home</mat-icon>
                Go Home
              </button>
              
              <button 
                mat-stroked-button 
                color="primary"
                (click)="goBack()"
                class="action-button">
                <mat-icon>arrow_back</mat-icon>
                Go Back
              </button>
              
              <button 
                mat-button 
                color="accent"
                (click)="searchOffers()"
                class="action-button">
                <mat-icon>search</mat-icon>
                Browse Offers
              </button>
            </div>
            
            <div class="helpful-links">
              <h3>Popular Pages:</h3>
              <div class="links-grid">
                <a routerLink="/" class="helpful-link">
                  <mat-icon>home</mat-icon>
                  <span>Home</span>
                </a>
                <a routerLink="/category/demat-account" class="helpful-link">
                  <mat-icon>account_balance</mat-icon>
                  <span>Demat Accounts</span>
                </a>
                <a routerLink="/category/medical-app" class="helpful-link">
                  <mat-icon>medical_services</mat-icon>
                  <span>Medical Apps</span>
                </a>
                <a routerLink="/admin" class="helpful-link">
                  <mat-icon>admin_panel_settings</mat-icon>
                  <span>Admin</span>
                </a>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      padding: 20px;
    }
    
    .not-found-card {
      max-width: 600px;
      width: 100%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .not-found-content {
      padding: 40px 20px;
    }
    
    .error-code {
      font-size: 6rem;
      font-weight: 700;
      color: #1976d2;
      margin-bottom: 16px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      
      @media (max-width: 480px) {
        font-size: 4rem;
      }
    }
    
    .error-icon {
      margin-bottom: 24px;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #666;
      }
    }
    
    .error-title {
      font-size: 2rem;
      font-weight: 500;
      margin: 0 0 16px 0;
      color: #333;
      
      @media (max-width: 480px) {
        font-size: 1.5rem;
      }
    }
    
    .error-message {
      font-size: 1.1rem;
      color: #666;
      line-height: 1.6;
      margin: 0 0 32px 0;
    }
    
    .error-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      margin-bottom: 40px;
      
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
    
    .helpful-links {
      border-top: 1px solid #e0e0e0;
      padding-top: 32px;
      
      h3 {
        font-size: 1.2rem;
        margin: 0 0 20px 0;
        color: #333;
      }
    }
    
    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
      max-width: 400px;
      margin: 0 auto;
    }
    
    .helpful-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      text-decoration: none;
      color: #666;
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: rgba(25, 118, 210, 0.08);
        color: #1976d2;
        transform: translateY(-2px);
      }
      
      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        margin-bottom: 8px;
      }
      
      span {
        font-size: 0.9rem;
        font-weight: 500;
      }
    }
    
    @media (max-width: 480px) {
      .not-found-content {
        padding: 20px 16px;
      }
      
      .links-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goBack(): void {
    window.history.back();
  }

  searchOffers(): void {
    this.router.navigate(['/']);
  }
}