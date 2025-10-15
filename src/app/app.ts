import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './shared/components/navigation/navigation.component';
import { UpdateNotificationComponent } from './shared/components/update-notification/update-notification.component';
import { InstantRefreshService } from './services/instant-refresh.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent, UpdateNotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  constructor(
    private router: Router,
    private instantRefreshService: InstantRefreshService
  ) {}

  ngOnInit(): void {
    // Initialize instant refresh service
    console.log('⚡ Instant refresh service initialized');
    
    // Enable cache bypassing for immediate updates
    this.instantRefreshService.bypassCache();
    
    // Handle redirects from 404 page
    const redirectUrl = sessionStorage.getItem('redirectUrl');
    if (redirectUrl) {
      sessionStorage.removeItem('redirectUrl');
      
      // Clean up the URL and navigate
      const cleanUrl = redirectUrl.replace('/referral-reward-dashboard', '');
      if (cleanUrl && cleanUrl !== '/') {
        this.router.navigateByUrl(cleanUrl).catch(() => {
          // If navigation fails, go to 404
          this.router.navigate(['/404']);
        });
      }
    }
  }
}
