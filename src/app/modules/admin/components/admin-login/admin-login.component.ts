import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../services/auth.service';
import { SecureAuthService } from '../../../../services/secure-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  loginAttempts = 0;
  maxAttempts = 3;
  lockoutTime = 0;
  showSecurityInfo = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private secureAuthService: SecureAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Redirect if already authenticated with secure service
    if (this.secureAuthService.isAuthenticated()) {
      this.redirectToAdmin();
    }
    
    // Show security information
    this.showSecurityInfo = true;
    
    // Log page access for security monitoring
    console.log('🔐 Admin login page accessed:', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      const { username, password } = this.loginForm.value;

      try {
        const success = await this.secureAuthService.login(username, password);
        
        if (success) {
          this.snackBar.open('🔐 Secure login successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loginAttempts = 0;
          this.redirectToAdmin();
        }
      } catch (error: any) {
        this.loginAttempts++;
        this.loading = false;
        
        let errorMessage = 'Login failed';
        if (error.message.includes('Too many failed attempts')) {
          errorMessage = error.message;
          this.lockoutTime = 15; // 15 minutes
          this.startLockoutTimer();
        } else if (error.message.includes('Invalid credentials')) {
          errorMessage = `Invalid credentials (${this.loginAttempts}/${this.maxAttempts} attempts)`;
        }
        
        this.snackBar.open(`🚨 ${errorMessage}`, 'Close', {
          duration: 8000,
          panelClass: ['error-snackbar']
        });
        
        // Clear password field for security
        this.loginForm.patchValue({ password: '' });
        
        console.error('🔐 Secure login error:', error);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private redirectToAdmin(): void {
    // Check for stored redirect URL
    const redirectUrl = sessionStorage.getItem('admin_redirect_url');
    if (redirectUrl) {
      sessionStorage.removeItem('admin_redirect_url');
      this.router.navigateByUrl(redirectUrl);
    } else {
      this.router.navigate(['/admin']);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
    }
    return '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  private startLockoutTimer(): void {
    const timer = setInterval(() => {
      this.lockoutTime--;
      if (this.lockoutTime <= 0) {
        clearInterval(timer);
      }
    }, 60000); // Update every minute
  }

  getLockoutMessage(): string {
    if (this.lockoutTime > 0) {
      return `Account locked. Try again in ${this.lockoutTime} minutes.`;
    }
    return '';
  }

  isFormDisabled(): boolean {
    return this.loading || this.lockoutTime > 0;
  }

  getSecurityInfo(): string[] {
    return [
      '🔐 Secure admin access with enhanced protection',
      '🛡️ Session timeout: 30 minutes of inactivity',
      '🚨 Maximum 3 login attempts before lockout',
      '⏰ 15-minute lockout after failed attempts',
      '📊 All access attempts are logged and monitored'
    ];
  }
}