import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  template: '<h1>Public Home - Coming Soon</h1>',
  standalone: true
})
export class PlaceholderHomeComponent {}

@Component({
  template: '<h1>Category Display - Coming Soon</h1>',
  standalone: true
})
export class PlaceholderCategoryComponent {}

export const publicRoutes: Routes = [
  {
    path: '',
    component: PlaceholderHomeComponent
  },
  {
    path: 'category/:id',
    component: PlaceholderCategoryComponent
  }
];