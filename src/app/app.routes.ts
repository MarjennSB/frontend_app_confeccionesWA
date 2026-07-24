import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { LayoutComponent } from './shared/layout/layout';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'auth/login',
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
                loadComponent: () => import('./features/areas/areas-list/areas-list').then(c => c.AreasListComponent)
            },
            {
                path: 'responsible-officer',
                loadComponent: () => import('./features/responsible-officer/responsible-officer-list/responsible-officer-list').then(c => c.ResponsibleOfficerListComponent)
            },
            {
                path: 'parameters',
                loadComponent: () => import('./features/parameters/parameters-list/parameters-list').then(c => c.ParametersListComponent)
            },
            {
                path: 'landlords',
                loadComponent: () => import('./features/landlords/landlords-list/landlords-list').then(c => c.LandlordsListComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
