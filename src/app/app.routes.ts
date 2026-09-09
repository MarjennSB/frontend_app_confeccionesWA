import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { rolesGuard } from './core/guards/roles-guard';
import { LayoutComponent } from './shared/layout/layout';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'auth/login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login').then(c => c.Login)
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard').then(c => c.DashboardComponent)
            },
            {
                path: 'services',
                canActivate: [rolesGuard],
                data: { roles: ['Super-Admin'] },
                loadComponent: () => import('./features/service/services-list/services-list').then(c => c.ServicesListComponent)
            },
            {
                path: 'contents',
                canActivate: [rolesGuard],
                data: { roles: ['Super-Admin'] },
                loadComponent: () => import('./features/content/content-list/content-list').then(c => c.ContentListComponent)
            },
            {
                path: 'notifications',
                canActivate: [rolesGuard],
                data: { roles: ['Super-Admin'] },
                loadComponent: () => import('./features/notification/notification-list/notification-list').then(c => c.NotificationListComponent)
            },
            {
                path: 'users',
                canActivate: [rolesGuard],
                data: { roles: ['Super-Admin'] },
                loadComponent: () => import('./features/users/users-list/users-list').then(c => c.UsersListComponent)
            },
            {
                path: 'roles',
                canActivate: [rolesGuard],
                data: { roles: ['Super-Admin'] },
                loadComponent: () => import('./features/roles/roles-list/roles-list').then(c => c.RolesListComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile').then(c => c.ProfileComponent)
            },
            {
                path: 'unauthorized',
                loadComponent: () => import('./features/unauthorized/unauthorized').then(c => c.UnauthorizedComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
