import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { SessionService } from '../services/session.service';

/**
 * authErrorInterceptor — maneja errores HTTP 401 (No Autorizado).
 *
 * Cuando el backend devuelve 401:
 *  - Limpia el token y el usuario del storage.
 *  - Si el error NO viene del endpoint de login o register,
 *    activa la señal sessionExpired para mostrar el modal correspondiente.
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService   = inject(TokenService);
  const sessionService = inject(SessionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        tokenService.removeToken();

        // No mostrar modal de sesión expirada si es un intento de login/register
        const isAuthEndpoint = req.url.includes('/auth/login') ||
                               req.url.includes('/auth/register');

        if (!isAuthEndpoint) {
          sessionService.triggerExpired();
        }
      }
      return throwError(() => error);
    })
  );
};
