import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
  },
  {
    path: 'category/:id',
    loadComponent: () => import('./components/category-management/category-management.component').then(c => c.CategoryManagementComponent)
  },
  {
    path: 'utilities',
    loadComponent: () => import('./components/utilities/utilities.component').then(c => c.UtilitiesComponent)
  }
];