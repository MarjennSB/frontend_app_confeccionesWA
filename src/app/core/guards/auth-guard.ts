import { inject } from '@angular/core';
import { TokenService } from '../services/token';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.isAuthenticated()) {
    return true;
  }
  

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
