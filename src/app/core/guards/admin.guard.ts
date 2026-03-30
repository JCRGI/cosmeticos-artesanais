import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

/** Guard que protege todas as rotas do painel admin */
export const adminGuard: CanActivateFn = () => {
  const adminAuth = inject(AdminAuthService);
  const router = inject(Router);

  if (adminAuth.estaAutenticado()) {
    return true;
  }

  // Redireciona para login admin
  return router.createUrlTree(['/admin/login']);
};
