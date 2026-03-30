import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import {
  Pedido,
  StatusPedido,
  STATUS_PEDIDO_LABELS,
  STATUS_PEDIDO_COLORS,
} from '../../../core/models/pedido.model';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule, LoadingComponent],
  templateUrl: './pedidos-admin.component.html',
})
export class PedidosAdminComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly toast = inject(ToastService);

  readonly pedidos = signal<Pedido[]>([]);
  readonly carregando = signal(true);
  readonly pedidoSelecionado = signal<Pedido | null>(null);

  readonly statusLabels = STATUS_PEDIDO_LABELS;
  readonly statusColors = STATUS_PEDIDO_COLORS;
  readonly statusOpcoes = Object.keys(STATUS_PEDIDO_LABELS) as StatusPedido[];

  filtroStatus: StatusPedido | '' = '';

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await this.pedidoService.listarTodos(
        this.filtroStatus || undefined
      );
      this.pedidos.set(lista);
    } catch {
      this.toast.erro('Erro ao carregar pedidos.');
    } finally {
      this.carregando.set(false);
    }
  }

  verDetalhes(pedido: Pedido): void {
    this.pedidoSelecionado.set(pedido);
  }

  fecharDetalhes(): void {
    this.pedidoSelecionado.set(null);
  }

  async alterarStatus(pedido: Pedido, novoStatus: StatusPedido): Promise<void> {
    try {
      await this.pedidoService.atualizarStatus(pedido.id, novoStatus);
      this.toast.sucesso('Status atualizado com sucesso.');
      // Atualiza localmente
      this.pedidos.update(lista =>
        lista.map(p => p.id === pedido.id ? { ...p, status: novoStatus } : p)
      );
      if (this.pedidoSelecionado()?.id === pedido.id) {
        this.pedidoSelecionado.update(p => p ? { ...p, status: novoStatus } : null);
      }
    } catch {
      this.toast.erro('Erro ao atualizar status.');
    }
  }
}
