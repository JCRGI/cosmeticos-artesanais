import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      aria-live="polite"
      aria-atomic="true"
      class="position-fixed bottom-0 end-0 p-3"
      style="z-index: 1100">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast show align-items-center text-bg-{{ toast.tipo }} border-0 mb-2"
          role="alert"
          aria-live="assertive"
          aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body">
              <i class="bi {{ iconePorTipo(toast.tipo) }} me-2"></i>
              {{ toast.mensagem }}
            </div>
            <button
              type="button"
              class="btn-close btn-close-white me-2 m-auto"
              aria-label="Fechar"
              (click)="toastService.remover(toast.id)">
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastComponent implements OnDestroy {
  constructor(readonly toastService: ToastService) {}

  iconePorTipo(tipo: ToastMessage['tipo']): string {
    const icones: Record<ToastMessage['tipo'], string> = {
      success: 'bi-check-circle-fill',
      danger: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill',
    };
    return icones[tipo];
  }

  ngOnDestroy(): void {}
}
