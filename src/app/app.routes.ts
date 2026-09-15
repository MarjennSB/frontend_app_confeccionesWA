import { Routes } from '@angular/router';
import { authGuard }  from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { rolesGuard } from './core/guards/roles-guard';
import { LayoutComponent } from './shared/layout/layout';

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

            // Dashboard — accesible para todos los autenticados
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard').then(c => c.DashboardComponent)
            },

            // Órdenes de Compra — solo ADMINISTRADOR
            {
                path: 'purchase-orders',
                canActivate: [rolesGuard],
                data: { roles: ['ADMINISTRADOR'] },
                loadComponent: () => import('./features/purchase-orders/purchase-orders-list/purchase-orders-list').then(c => c.PurchaseOrdersListComponent)
            },

            // Producciones — solo ADMINISTRADOR
            {
                path: 'productions',
                canActivate: [rolesGuard],
                data: { roles: ['ADMINISTRADOR'] },
                loadComponent: () => import('./features/productions/productions-list/productions-list').then(c => c.ProductionsListComponent)
            },

            // Guías — solo ADMINISTRADOR
            {
                path: 'guides',
                canActivate: [rolesGuard],
                data: { roles: ['ADMINISTRADOR'] },
                loadComponent: () => import('./features/guides/guides-list/guides-list').then(c => c.GuidesListComponent)
            },

            // Facturas — solo ADMINISTRADOR
            {
                path: 'invoices',
                canActivate: [rolesGuard],
                data: { roles: ['ADMINISTRADOR'] },
                loadComponent: () => import('./features/invoices/invoices-list/invoices-list').then(c => c.InvoicesListComponent)
            },

            // Colores — solo ADMINISTRADOR
            {
                path: 'colores',
                canActivate: [rolesGuard],
                data: { roles: ['ADMINISTRADOR'] },
                loadComponent: () => import('./features/colores/colores-list/colores-list').then(c => c.ColoresListComponent)
            },

            // Usuarios — solo ADMINISTRADOR
            {
                path: 'users',
                canActivate: [rolesGuard],
                data: { roles: ['ADMINISTRADOR'] },
                loadComponent: () => import('./features/users/users-list/users-list').then(c => c.UsersListComponent)
            },

            // Roles — solo ADMINISTRADOR
            {
                path: 'roles',
                canActivate: [rolesGuard],
                data: { roles: ['ADMINISTRADOR'] },
                loadComponent: () => import('./features/roles/roles-list/roles-list').then(c => c.RolesListComponent)
            },

            // Perfil — accesible para todos los autenticados
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile').then(c => c.ProfileComponent)
            },

            // Sin acceso
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
