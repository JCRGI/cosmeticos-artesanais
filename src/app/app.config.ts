import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Detecção de mudanças otimizada
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Roteamento com binding de inputs e transições de view
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    // HTTP Client com interceptor de autenticação admin
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
