export interface AdminSettings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  analyticsEnabled: boolean;
  maintenanceMode: boolean;
}

export interface UpdateAdminSettingsRequest extends Partial<AdminSettings> {}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  siteTitle: 'Referral & Rewards Dashboard',
  siteDescription: 'Discover the best referral offers across various categories',
  contactEmail: 'admin@referralrewards.com',
  analyticsEnabled: false,
  maintenanceMode: false
};