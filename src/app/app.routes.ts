import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/public/public.routes').then(m => m.publicRoutes)
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: '404',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: 'network-error',
    loadComponent: () => import('./shared/components/network-error/network-error.component').then(m => m.NetworkErrorComponent)
  },
  {
    path: 'error',
    loadComponent: () => import('./shared/components/error-page/error-page.component').then(m => m.ErrorPageComponent)
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];
