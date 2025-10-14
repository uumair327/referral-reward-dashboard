import { Routes } from '@angular/router';

export const publicRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'category/:id',
    loadComponent: () => import('./components/category-display/category-display.component').then(c => c.CategoryDisplayComponent)
  }
];