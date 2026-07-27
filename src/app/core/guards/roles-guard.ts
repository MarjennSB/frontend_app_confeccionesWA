import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token';

export const rolesGuard: CanActivateFn = (route) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  if (allowedRoles.length === 0 || tokenService.hasRole(...allowedRoles)) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
