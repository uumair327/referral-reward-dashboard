export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Referral & Rewards Dashboard',
  version: '1.0.0',
  features: {
    analytics: false,
    debugging: true,
    mockData: true
  },
  storage: {
    prefix: 'referral_dev_',
    enableEncryption: false
  },
  ui: {
    theme: 'default',
    enableAnimations: true,
    showDebugInfo: true
  }
};