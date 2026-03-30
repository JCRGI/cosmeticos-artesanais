import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { StatusPedido, STATUS_PEDIDO_LABELS, STATUS_PEDIDO_COLORS } from '../../../core/models/pedido.model';

interface ResumoStatus {
  status: StatusPedido;
  quantidade: number;
}

interface DashboardData {
  pedidosHoje: number;
  receitaHoje: number;
  pedidosPendentes: number;
  porStatus: ResumoStatus[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, LoadingComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly supa = inject(SupabaseService);

  readonly dados = signal<DashboardData | null>(null);
  readonly carregando = signal(true);
  readonly statusLabels = STATUS_PEDIDO_LABELS;
  readonly statusColors = STATUS_PEDIDO_COLORS;

  readonly totalPedidos = computed(() =>
    this.dados()?.porStatus.reduce((soma, s) => soma + s.quantidade, 0) ?? 0
  );

  async ngOnInit(): Promise<void> {
    try {
      const hoje = new Date().toISOString().split('T')[0];

      // Pedidos de hoje
      const { data: pedidosHoje } = await this.supa.supabase
        .from('pedidos')
        .select('id, valor_total, status')
        .gte('created_at', `${hoje}T00:00:00`);

      const total = (pedidosHoje ?? []).length;
      const receita = (pedidosHoje ?? [])
        .filter(p => p.status === 'pago' || p.status === 'em_preparo' || p.status === 'enviado' || p.status === 'entregue')
        .reduce((soma, p) => soma + (p.valor_total as number), 0);

      // Agrupamento por status (todos os pedidos)
      const { data: todosPedidos } = await this.supa.supabase
        .from('pedidos')
        .select('status');

      const contagem: Record<string, number> = {};
      for (const p of todosPedidos ?? []) {
        contagem[p.status as string] = (contagem[p.status as string] ?? 0) + 1;
      }
      const porStatus: ResumoStatus[] = Object.entries(contagem).map(
        ([status, quantidade]) => ({ status: status as StatusPedido, quantidade })
      );

      const pendentes = contagem['aguardando_pagamento'] ?? 0;

      this.dados.set({
        pedidosHoje: total,
        receitaHoje: receita,
        pedidosPendentes: pendentes,
        porStatus,
      });
    } finally {
      this.carregando.set(false);
    }
  }
}
