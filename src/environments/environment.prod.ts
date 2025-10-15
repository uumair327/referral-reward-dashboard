export const environment = {
  production: true,
  apiUrl: '', // No backend API for GitHub Pages
  appName: 'Referral & Rewards Dashboard',
  version: '1.0.0',
  baseHref: '/referral-reward-dashboard/',
  features: {
    analytics: true,
    debugging: false,
    mockData: true // Use mock data for GitHub Pages
  },
  storage: {
    prefix: 'referral_',
    enableEncryption: false // Simplified for demo
  },
  ui: {
    theme: 'default',
    enableAnimations: true,
    showDebugInfo: false
  },
  deployment: {
    platform: 'github-pages',
    enableServiceWorker: true,
    enablePWA: true
  }
};