import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visivel) {
      <div class="d-flex justify-content-center align-items-center py-5">
        <div
          class="spinner-border text-primary"
          [style.width.rem]="tamanho === 'lg' ? 3 : 1.5"
          [style.height.rem]="tamanho === 'lg' ? 3 : 1.5"
          role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        @if (mensagem) {
          <span class="ms-3 text-muted">{{ mensagem }}</span>
        }
      </div>
    }
  `,
})
export class LoadingComponent {
  @Input() visivel = true;
  @Input() mensagem = '';
  @Input() tamanho: 'sm' | 'lg' = 'lg';
}
