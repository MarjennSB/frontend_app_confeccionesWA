import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * guestGuard — protege rutas públicas (login).
 * Si el usuario YA está autenticado, redirige al dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router       = inject(Router);

  if (tokenService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
