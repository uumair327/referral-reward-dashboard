import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { AdminGuard } from './guards/admin.guard';

@Component({
  template: '<h1>Admin Dashboard - Coming Soon</h1>',
  standalone: true
})
export class PlaceholderAdminComponent {}

@Component({
  template: '<h1>Category Management - Coming Soon</h1>',
  standalone: true
})
export class PlaceholderCategoryMgmtComponent {}

@Component({
  template: '<h1>Admin Utilities - Coming Soon</h1>',
  standalone: true
})
export class PlaceholderUtilitiesComponent {}

export const adminRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/admin-login/admin-login.component').then(c => c.AdminLoginComponent)
  },
  {
    path: '',
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/category-management/category-management.component').then(c => c.CategoryManagementComponent)
      },
      {
        path: 'offers',
        loadComponent: () => import('./components/offer-management/offer-management.component').then(c => c.OfferManagementComponent)
      },
      {
        path: 'utilities',
        loadComponent: () => import('./components/utilities/utilities.component').then(c => c.UtilitiesComponent)
      }
    ]
  }
];