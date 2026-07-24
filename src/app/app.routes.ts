import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'landlords',
        pathMatch: 'full'
    },
    {
        path: 'auth/login',
        loadComponent: () => import('./features/auth/login/login').then(c => c.Login)
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
