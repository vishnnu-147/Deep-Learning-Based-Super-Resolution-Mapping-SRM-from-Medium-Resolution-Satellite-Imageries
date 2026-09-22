import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Satellite Super Resolution | AI-Powered Earth Observation'
  },
  {
    path: 'workspace',
    loadComponent: () => import('./features/workspace/workspace.component').then(m => m.WorkspaceComponent),
    title: 'Workspace | Satellite Super Resolution'
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent),
    title: 'Analytics | Satellite Super Resolution'
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
    title: 'History | Satellite Super Resolution'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
