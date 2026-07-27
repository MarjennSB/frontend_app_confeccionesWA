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
                path: 'scan-monitor',
                loadComponent: () => import('./features/scan-monitor/scan-monitor').then(c => c.ScanMonitorComponent)
            },
            {
                path: 'networks',
                loadComponent: () => import('./features/networks/networks').then(c => c.Networks)
            },
            {
                path: 'devices',
                loadComponent: () => import('./features/devices/devices').then(c => c.Devices)
            },
            {
                path: 'users',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./features/users/users-list/users-list').then(c => c.UsersListComponent)
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
