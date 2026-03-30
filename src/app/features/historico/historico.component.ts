import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../core/services/pedido.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Pedido, STATUS_PEDIDO_LABELS, STATUS_PEDIDO_COLORS } from '../../core/models/pedido.model';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule, LoadingComponent],
  templateUrl: './historico.component.html',
})
export class HistoricoComponent {
  private readonly pedidoService = inject(PedidoService);
  private readonly toast = inject(ToastService);

  readonly pedidos = signal<Pedido[]>([]);
  readonly carregando = signal(false);
  readonly buscaRealizada = signal(false);

  readonly statusLabels = STATUS_PEDIDO_LABELS;
  readonly statusColors = STATUS_PEDIDO_COLORS;

  termoBusca = '';

  async buscar(): Promise<void> {
    const termo = this.termoBusca.trim();
    if (!termo) {
      this.toast.aviso('Informe seu CPF ou e-mail para buscar pedidos.');
      return;
    }

    this.carregando.set(true);
    this.buscaRealizada.set(false);

    try {
      const resultado = await this.pedidoService.buscarHistorico(termo);
      this.pedidos.set(resultado);
      this.buscaRealizada.set(true);

      if (resultado.length === 0) {
        this.toast.info('Nenhum pedido encontrado para este CPF/e-mail.');
      }
    } catch {
      this.toast.erro('Erro ao buscar histórico.');
    } finally {
      this.carregando.set(false);
    }
  }

  onKeyEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.buscar();
  }
}
