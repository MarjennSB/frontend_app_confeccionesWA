import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);
  const user = tokenService.currentUser();

  // Si no hay usuario, mandarlo al login
  if (!user || !user.rol_nombre) {
    return router.createUrlTree(['/auth/login']);
  }

  // Obtenemos qué roles están permitidos para esta ruta específica
  const allowedRoles = route.data?.['roles'] as Array<string>;

  // Si la ruta no exige roles específicos, lo dejamos pasar
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Si el rol del usuario ESTÁ en la lista de permitidos, pasa
  if (allowedRoles.includes(user.rol_nombre)) {
    return true;
  }

  // Si es un Contador (CT) que intentó entrar al dashboard (y no estaba permitido),
  // lo redirigimos a su pantalla principal de facturas.
  if (user.rol_nombre === 'CT') {
    return router.createUrlTree(['/invoices']);
  }

  // Si es Operario (OP) lo mandamos a Producciones
  if (user.rol_nombre === 'OP') {
    return router.createUrlTree(['/productions']);
  }

  // Por si acaso, si no cumple nada, mandarlo a una pantalla genérica (puedes crear un 401 Unauthorized después)
  return router.createUrlTree(['/auth/login']);
};
