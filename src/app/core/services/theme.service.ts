import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';
  private currentThemeSubject = new BehaviorSubject<Theme>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY) as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme: Theme = 'light';
    
    if (savedTheme) {
      theme = savedTheme;
    } else if (prefersDark) {
      theme = 'dark';
    }
    
    this.setTheme(theme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.currentThemeSubject.value === 'auto') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark ? 'dark' : 'light');
    } else {
      this.applyTheme(theme);
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const body = document.body;
    const html = document.documentElement;
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme');
    html.classList.remove('light-theme', 'dark-theme');
    
    // Add new theme class
    body.classList.add(`${theme}-theme`);
    html.classList.add(`${theme}-theme`);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
    }
  }

  toggleTheme(): void {
    const current = this.currentThemeSubject.value;
    const next: Theme = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
    this.setTheme(next);
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  isDarkMode(): boolean {
    const body = document.body;
    return body.classList.contains('dark-theme');
  }
}