import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { rolesGuard } from './core/guards/roles-guard';
import { LayoutComponent } from './shared/layout/layout';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
    // ─── Redirect raíz ────────────────────────────────────────────
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },

    // ─── Rutas Públicas (solo para NO autenticados) ───────────────
    {
        path: 'auth/login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login').then(c => c.Login)
    },

    // ─── Rutas Privadas (requieren autenticación) ─────────────────
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                canActivate: [roleGuard],
                data: { roles: ['AD', 'GT'] }, // <-- ¡Magia! Solo Admin y Gerente pasan
                loadComponent: () => import('./features/dashboard/dashboard').then(c => c.DashboardComponent)
            },
            {
                path: 'purchase-orders',
                canActivate: [rolesGuard],
                data: { roles: ['AD', 'OP'] },
                loadComponent: () => import('./features/purchase-orders/purchase-orders-list/purchase-orders-list').then(c => c.PurchaseOrdersListComponent)
            },
            {
                path: 'productions',
                canActivate: [rolesGuard],
                data: { roles: ['AD'] },
                loadComponent: () => import('./features/productions/productions-list/productions-list').then(c => c.ProductionsListComponent)
            },
            {
                path: 'guides',
                canActivate: [rolesGuard],
                data: { roles: ['AD', 'OP'] },
                loadComponent: () => import('./features/guides/guides-list/guides-list').then(c => c.GuidesListComponent)
            },
            {
                path: 'invoices',
                canActivate: [rolesGuard],
                data: { roles: ['AD', 'CT'] },
                loadComponent: () => import('./features/invoices/invoices-list/invoices-list').then(c => c.InvoicesListComponent)
            },
            {
                path: 'colores',
                canActivate: [rolesGuard],
                data: { roles: ['AD', 'OP'] },
                loadComponent: () => import('./features/colores/colores-list/colores-list').then(c => c.ColoresListComponent)
            },
            {
                path: 'users',
                canActivate: [rolesGuard],
                data: { roles: ['AD'] },
                loadComponent: () => import('./features/users/users-list/users-list').then(c => c.UsersListComponent)
            },
            {
                path: 'roles',
                canActivate: [rolesGuard],
                data: { roles: ['AD'] },
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

    // ─── Wildcard ──────────────────────────────────────────────────
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
