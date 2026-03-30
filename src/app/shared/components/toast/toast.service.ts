import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  mensagem: string;
  tipo: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _contador = 0;
  private readonly _toasts = signal<ToastMessage[]>([]);

  readonly toasts = this._toasts.asReadonly();

  /** Exibe um toast e o remove automaticamente após o tempo definido */
  mostrar(
    mensagem: string,
    tipo: ToastMessage['tipo'] = 'info',
    duracaoMs = 4000
  ): void {
    const id = ++this._contador;
    this._toasts.update(lista => [...lista, { id, mensagem, tipo }]);
    setTimeout(() => this.remover(id), duracaoMs);
  }

  sucesso(mensagem: string): void {
    this.mostrar(mensagem, 'success');
  }

  erro(mensagem: string): void {
    this.mostrar(mensagem, 'danger', 6000);
  }

  aviso(mensagem: string): void {
    this.mostrar(mensagem, 'warning');
  }

  info(mensagem: string): void {
    this.mostrar(mensagem, 'info');
  }

  remover(id: number): void {
    this._toasts.update(lista => lista.filter(t => t.id !== id));
  }
}
