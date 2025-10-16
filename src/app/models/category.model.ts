export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
  offerCount: number;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  description: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
  isActive?: boolean;
}

export enum CategoryId {
  DEMAT_ACCOUNT = 'demat-account',
  MEDICAL_APP = 'medical-app',
  HOSPITALITY_HOTEL = 'hospitality-hotel',
  ENTERTAINMENT = 'entertainment',
  ONLINE_PRODUCTS = 'online-products'
}

export const DEFAULT_CATEGORIES: Omit<Category, 'offerCount' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: CategoryId.DEMAT_ACCOUNT,
    name: 'Demat Account',
    icon: 'account_balance',
    description: 'Stock trading and investment account referrals',
    isActive: true,
    displayOrder: 1
  },
  {
    id: CategoryId.MEDICAL_APP,
    name: 'Medical App',
    icon: 'medical_services',
    description: 'Healthcare and medical service applications',
    isActive: true,
    displayOrder: 2
  },
  {
    id: CategoryId.HOSPITALITY_HOTEL,
    name: 'Hospitality & Hotel',
    icon: 'hotel',
    description: 'Hotel bookings and hospitality services',
    isActive: true,
    displayOrder: 3
  },
  {
    id: CategoryId.ENTERTAINMENT,
    name: 'Entertainment',
    icon: 'movie',
    description: 'Streaming services and entertainment platforms',
    isActive: true,
    displayOrder: 4
  },
  {
    id: CategoryId.ONLINE_PRODUCTS,
    name: 'Online Products',
    icon: 'shopping_cart',
    description: 'E-commerce platforms like Amazon, Flipkart',
    isActive: true,
    displayOrder: 5
  }
];