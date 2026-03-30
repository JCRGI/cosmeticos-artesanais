import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor HTTP que adiciona o token de autenticação admin
 * nas requisições destinadas às Edge Functions do Supabase (/api/*).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Apenas intercepta chamadas internas da API
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const token = sessionStorage.getItem('admin_autenticado') === 'true'
    ? sessionStorage.getItem('admin_token') ?? ''
    : '';

  if (!token) return next(req);

  const reqAutenticado = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(reqAutenticado);
};
