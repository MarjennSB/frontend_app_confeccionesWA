import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { SessionService } from '../services/session.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const sessionService = inject(SessionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        tokenService.removeToken();
        // Solo mostramos el modal de "Sesion Expirada" si no estamos intentando loguearnos
        if (!req.url.includes('/auth/login')) {
          sessionService.triggerExpired();
        }
      }
      return throwError(() => error);
    })
  );
};
