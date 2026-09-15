import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * rolesGuard — protege rutas por rol.
 *
 * Uso en rutas:
 *   data: { roles: ['ADMINISTRADOR'] }
 *
 * Si la ruta no define roles, se permite el acceso a cualquier usuario autenticado.
 * Si el usuario no tiene el rol requerido, redirige a /unauthorized.
 *
 * Roles disponibles en el sistema:
 *   - 'ADMINISTRADOR'
 *   - 'USUARIO EXTERNO'
 */
export const rolesGuard: CanActivateFn = (route) => {
  const tokenService = inject(TokenService);
  const router       = inject(Router);

  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  // Sin restricción de rol definida → cualquier autenticado puede acceder
  if (allowedRoles.length === 0) {
    return true;
  }

  // Verificar si el rol del usuario está en la lista de roles permitidos
  if (tokenService.hasRole(...allowedRoles)) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
