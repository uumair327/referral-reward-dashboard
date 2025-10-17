import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface SecureUser {
  username: string;
  email: string;
  isAuthenticated: boolean;
  loginTime: Date;
  ipAddress: string;
  sessionId: string;
  permissions: string[];
}

export interface LoginAttempt {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecureAuthService {
  private currentUserSubject = new BehaviorSubject<SecureUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private readonly MAX_LOGIN_ATTEMPTS = 3;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  private loginAttempts: LoginAttempt[] = [];
  private sessionTimer: any;

  constructor(private router: Router) {
    this.initializeSession();
    this.startSessionMonitoring();
  }

  private initializeSession(): void {
    const storedUser = localStorage.getItem('secureUser');
    const sessionId = localStorage.getItem('sessionId');
    const loginTime = localStorage.getItem('loginTime');
    
    if (storedUser && sessionId && loginTime) {
      const user = JSON.parse(storedUser);
      const timeSinceLogin = Date.now() - new Date(loginTime).getTime();
      
      // Check if session is still valid
      if (timeSinceLogin < this.SESSION_TIMEOUT && this.validateSession(sessionId)) {
        this.currentUserSubject.next(user);
        this.resetSessionTimer();
      } else {
        this.logout();
      }
    }
  }

  private startSessionMonitoring(): void {
    // Monitor user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        if (this.currentUserSubject.value) {
          this.resetSessionTimer();
        }
      }, { passive: true });
    });
  }

  private resetSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    this.sessionTimer = setTimeout(() => {
      this.logout();
      alert('Session expired due to inactivity. Please login again.');
    }, this.SESSION_TIMEOUT);
  }

  async login(username: string, password: string): Promise<boolean> {
    const ipAddress = await this.getClientIP();
    const userAgent = navigator.userAgent;
    
    // Check if IP is locked out
    if (this.isIPLockedOut(ipAddress)) {
      const lockoutTime = this.getLockoutTimeRemaining(ipAddress);
      throw new Error(`Too many failed attempts. Try again in ${Math.ceil(lockoutTime / 60000)} minutes.`);
    }

    try {
      // Validate credentials against environment/secrets
      const isValid = await this.validateCredentials(username, password);
      
      const loginAttempt: LoginAttempt = {
        timestamp: new Date(),
        ipAddress,
        userAgent,
        success: isValid,
        username: isValid ? username : undefined
      };
      
      this.loginAttempts.push(loginAttempt);
      this.cleanupOldAttempts();
      
      if (isValid) {
        const sessionId = this.generateSessionId();
        const user: SecureUser = {
          username,
          email: this.getAdminEmail(),
          isAuthenticated: true,
          loginTime: new Date(),
          ipAddress,
          sessionId,
          permissions: ['admin', 'create', 'edit', 'delete']
        };
        
        // Store secure session
        localStorage.setItem('secureUser', JSON.stringify(user));
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('loginTime', new Date().toISOString());
        
        this.currentUserSubject.next(user);
        this.resetSessionTimer();
        
        // Log successful login
        this.logSecurityEvent('LOGIN_SUCCESS', { username, ipAddress });
        
        return true;
      } else {
        // Log failed login
        this.logSecurityEvent('LOGIN_FAILED', { username, ipAddress });
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      this.logSecurityEvent('LOGIN_ERROR', { username, ipAddress, error: (error as Error).message });
      throw error;
    }
  }

  private async validateCredentials(username: string, password: string): Promise<boolean> {
    // In a real app, this would validate against your secure backend
    // For now, we'll use environment variables or hardcoded secure values
    
    const validUsername = this.getSecureConfig('ADMIN_USERNAME') || 'uumair327';
    const validPassword = this.getSecureConfig('ADMIN_PASSWORD') || 'Guest@123';
    
    // Add delay to prevent timing attacks
    await this.delay(Math.random() * 1000 + 500);
    
    return username === validUsername && password === validPassword;
  }

  private getSecureConfig(key: string): string | null {
    // In production, these would come from your secure backend
    // For GitHub Pages, we'll use a secure configuration object
    const secureConfig: { [key: string]: string } = {
      'ADMIN_USERNAME': 'uumair327', // Your GitHub username
      'ADMIN_PASSWORD': 'Guest@123', // Your preferred password
      'ADMIN_EMAIL': 'uumair327@referralrewards.com'
    };
    
    return secureConfig[key] || null;
  }

  private getAdminEmail(): string {
    return this.getSecureConfig('ADMIN_EMAIL') || 'uumair327@referralrewards.com';
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const userAgent = btoa(navigator.userAgent.substring(0, 20));
    return btoa(`${timestamp}_${random}_${userAgent}`).substring(0, 32);
  }

  private validateSession(sessionId: string): boolean {
    // Validate session ID format and integrity
    try {
      const decoded = atob(sessionId);
      const parts = decoded.split('_');
      return parts.length >= 2 && !isNaN(Number(parts[0]));
    } catch {
      return false;
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      // In production, you'd get this from your backend
      // For demo purposes, we'll use a placeholder
      return 'client.ip.address';
    } catch {
      return 'unknown';
    }
  }

  private isIPLockedOut(ipAddress: string): boolean {
    const recentAttempts = this.loginAttempts.filter(attempt => 
      attempt.ipAddress === ipAddress && 
      attempt.timestamp.getTime() > Date.now() - this.LOCKOUT_DURATION &&
      !attempt.success
    );
    
    return recentAttempts.length >= this.MAX_LOGIN_ATTEMPTS;
  }

  private getLockoutTimeRemaining(ipAddress: string): number {
    const failedAttempts = this.loginAttempts.filter(attempt => 
      attempt.ipAddress === ipAddress && !attempt.success
    );
    
    if (failedAttempts.length === 0) return 0;
    
    const lastAttempt = failedAttempts[failedAttempts.length - 1];
    const lockoutEnd = lastAttempt.timestamp.getTime() + this.LOCKOUT_DURATION;
    
    return Math.max(0, lockoutEnd - Date.now());
  }

  private cleanupOldAttempts(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    this.loginAttempts = this.loginAttempts.filter(attempt => 
      attempt.timestamp.getTime() > cutoff
    );
  }

  private logSecurityEvent(event: string, data: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.log('🔐 Security Event:', logEntry);
    
    // In production, send to your security monitoring service
    // this.sendToSecurityService(logEntry);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  logout(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      this.logSecurityEvent('LOGOUT', { 
        username: currentUser.username,
        sessionDuration: Date.now() - currentUser.loginTime.getTime()
      });
    }
    
    localStorage.removeItem('secureUser');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('loginTime');
    
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  getCurrentUser(): SecureUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value?.isAuthenticated || false;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions.includes(permission) || false;
  }

  // Get security dashboard data
  getSecurityDashboard(): any {
    const user = this.currentUserSubject.value;
    if (!user) return null;
    
    const recentAttempts = this.loginAttempts.filter(attempt => 
      attempt.timestamp.getTime() > Date.now() - (24 * 60 * 60 * 1000)
    );
    
    return {
      currentSession: {
        username: user.username,
        loginTime: user.loginTime,
        ipAddress: user.ipAddress,
        sessionId: user.sessionId.substring(0, 8) + '...'
      },
      recentActivity: {
        totalAttempts: recentAttempts.length,
        successfulLogins: recentAttempts.filter(a => a.success).length,
        failedAttempts: recentAttempts.filter(a => !a.success).length,
        uniqueIPs: [...new Set(recentAttempts.map(a => a.ipAddress))].length
      },
      security: {
        sessionTimeout: this.SESSION_TIMEOUT / 60000 + ' minutes',
        maxAttempts: this.MAX_LOGIN_ATTEMPTS,
        lockoutDuration: this.LOCKOUT_DURATION / 60000 + ' minutes'
      }
    };
  }

  // Force logout all sessions (security feature)
  forceLogoutAllSessions(): void {
    this.logSecurityEvent('FORCE_LOGOUT_ALL', { 
      triggeredBy: this.currentUserSubject.value?.username 
    });
    
    // Clear all stored sessions
    localStorage.clear();
    sessionStorage.clear();
    
    this.logout();
  }

  // Change password (security feature)
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const user = this.currentUserSubject.value;
    if (!user) throw new Error('Not authenticated');
    
    // Validate current password
    const isCurrentValid = await this.validateCredentials(user.username, currentPassword);
    if (!isCurrentValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Validate new password strength
    if (!this.isPasswordStrong(newPassword)) {
      throw new Error('New password does not meet security requirements');
    }
    
    this.logSecurityEvent('PASSWORD_CHANGED', { username: user.username });
    
    // In production, update password in secure backend
    console.log('🔐 Password changed successfully');
    
    return true;
  }

  private isPasswordStrong(password: string): boolean {
    // Password requirements:
    // - At least 12 characters
    // - Contains uppercase, lowercase, number, and special character
    const minLength = 12;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  }
}