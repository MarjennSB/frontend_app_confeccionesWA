import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
