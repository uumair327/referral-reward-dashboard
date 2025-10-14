import { Routes } from '@angular/router';
import { Component } from '@angular/core';

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
    path: '',
    component: PlaceholderAdminComponent
  },
  {
    path: 'category/:id',
    component: PlaceholderCategoryMgmtComponent
  },
  {
    path: 'utilities',
    component: PlaceholderUtilitiesComponent
  }
];