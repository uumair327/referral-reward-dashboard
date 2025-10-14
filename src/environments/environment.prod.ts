export const environment = {
  production: true,
  apiUrl: 'https://api.referralrewards.com/api',
  appName: 'Referral & Rewards Dashboard',
  version: '1.0.0',
  features: {
    analytics: true,
    debugging: false,
    mockData: false
  },
  storage: {
    prefix: 'referral_',
    enableEncryption: true
  },
  ui: {
    theme: 'default',
    enableAnimations: true,
    showDebugInfo: false
  }
};