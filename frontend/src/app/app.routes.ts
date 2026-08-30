import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
    canActivate: [guestGuard]
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/task-list/task-list').then((m) => m.TaskList),
      },
      {
        path: 'team',
        loadComponent: () => import('./features/team/team').then((m) => m.Team),
        canActivate: [roleGuard(['manager', 'teamlead'])],
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users-list/users-list').then((m) => m.UsersList),
        canActivate: [roleGuard(['manager'])],
      },
    ],
  },
  {
    path: '**', loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound)
  },
];
