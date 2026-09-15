import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { environment } from '../../../environments/environment';

/**
 * jwtInterceptor — adjunta el Bearer token JWT en cada request
 * que apunte al API del backend (environment.apiUrl).
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token        = tokenService.getToken();

  // Solo añade el header si hay token y la URL es la del API
  if (token && req.url.startsWith(environment.apiUrl)) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
