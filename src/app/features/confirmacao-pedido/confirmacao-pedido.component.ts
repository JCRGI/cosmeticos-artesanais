import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PedidoService } from '../../core/services/pedido.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Pedido } from '../../core/models/pedido.model';
import { STATUS_PEDIDO_LABELS, STATUS_PEDIDO_COLORS } from '../../core/models/pedido.model';

@Component({
  selector: 'app-confirmacao-pedido',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, LoadingComponent],
  templateUrl: './confirmacao-pedido.component.html',
})
export class ConfirmacaoPedidoComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly route = inject(ActivatedRoute);

  readonly pedido = signal<Pedido | null>(null);
  readonly carregando = signal(true);
  readonly statusLabels = STATUS_PEDIDO_LABELS;
  readonly statusColors = STATUS_PEDIDO_COLORS;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.queryParamMap.get('pedido_id')
      ?? this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.carregando.set(false);
      return;
    }

    try {
      const pedido = await this.pedidoService.buscarPorId(id);
      this.pedido.set(pedido);
    } finally {
      this.carregando.set(false);
    }
  }
}
