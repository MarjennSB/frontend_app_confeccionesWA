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
                path: 'areas',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador', 'Coordinador'] },
                loadComponent: () => import('./features/areas/areas-list/areas-list').then(c => c.AreasListComponent)
            },
            {
                path: 'responsible-officer',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador', 'Coordinador'] },
                loadComponent: () => import('./features/responsible-officer/responsible-officer-list/responsible-officer-list').then(c => c.ResponsibleOfficerListComponent)
            },
            {
                path: 'parameters',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador', 'Coordinador'] },
                loadComponent: () => import('./features/parameters/parameters-list/parameters-list').then(c => c.ParametersListComponent)
            },
            {
                path: 'landlords',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador', 'Coordinador', 'Operador'] },
                loadComponent: () => import('./features/landlords/landlords-list/landlords-list').then(c => c.LandlordsListComponent)
            },
            {
                path: 'landlord-service',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador', 'Coordinador', 'Operador'] },
                loadComponent: () => import('./features/landlord-service/landlord-service-list/landlord-service-list').then(c => c.LandlordServiceListComponent)
            },
            {
                path: 'request-certificates',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador', 'Coordinador', 'Operador'] },
                loadComponent: () => import('./features/request-certificates/request-certificates-list/request-certificates-list').then(c => c.RequestCertificatesListComponent)
            },
            {
                path: 'certificates',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador', 'Coordinador', 'Operador'] },
                loadComponent: () => import('./features/certificates/certificates-list/certificates-list').then(c => c.CertificatesListComponent)
            },
            {
                path: 'certificates/generate/:requestId',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador', 'Coordinador', 'Operador'] },
                loadComponent: () => import('./features/certificates/generate-certificate/generate-certificate').then(c => c.GenerateCertificateComponent)
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
