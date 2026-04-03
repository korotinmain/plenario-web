import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { PublicLayoutComponent } from './core/layout/public-layout/public-layout.component';
import { ProtectedLayoutComponent } from './core/layout/protected-layout/protected-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Public routes (auth area)
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
    ],
  },

  // Standalone auth result pages (no layout wrapper)
  {
    path: 'confirm-email',
    loadComponent: () =>
      import('./features/auth/pages/confirm-email/confirm-email.component').then(
        (m) => m.ConfirmEmailComponent,
      ),
  },

  // Protected routes (authenticated area)
  {
    path: '',
    component: ProtectedLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/pages/projects-list/projects-list.component').then(
            (m) => m.ProjectsListComponent,
          ),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./features/projects/pages/project-details/project-details.component').then(
            (m) => m.ProjectDetailsComponent,
          ),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/pages/tasks-list/tasks-list.component').then(
            (m) => m.TasksListComponent,
          ),
      },
      {
        path: 'tasks/today',
        loadComponent: () =>
          import('./features/tasks/pages/tasks-today/tasks-today.component').then(
            (m) => m.TasksTodayComponent,
          ),
      },
      {
        path: 'tasks/upcoming',
        loadComponent: () =>
          import('./features/tasks/pages/tasks-upcoming/tasks-upcoming.component').then(
            (m) => m.TasksUpcomingComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/pages/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
