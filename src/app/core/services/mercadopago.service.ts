import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { PedidoService } from './pedido.service';

// Resposta da Edge Function que cria a preferência MP
interface PreferenciaResponse {
  id: string;
  init_point: string;    // URL de checkout do Mercado Pago
  sandbox_init_point: string;
}

// Payload de webhook recebido do Mercado Pago
export interface MpWebhookPayload {
  type: string;          // 'payment'
  data: { id: string };  // ID do pagamento
}

@Injectable({ providedIn: 'root' })
export class MercadoPagoService {
  // Edge Function do Supabase que gerencia integração com MP
  private readonly edgeFnUrl = '/api/mercadopago';

  constructor(
    private readonly http: HttpClient,
    private readonly supa: SupabaseService,
    private readonly pedidoService: PedidoService
  ) {}

  /**
   * Cria uma preferência de pagamento no Mercado Pago via Edge Function.
   * Retorna a URL de checkout para redirecionar o cliente.
   */
  async criarPreferencia(pedidoId: string): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<PreferenciaResponse>(
        `${this.edgeFnUrl}/criar-preferencia`,
        { pedido_id: pedidoId }
      )
    );
    // Armazena o ID da preferência no pedido
    await this.supa.supabase
      .from('pedidos')
      .update({ mp_payment_id: response.id })
      .eq('id', pedidoId);

    return response.init_point;
  }

  /**
   * Processa webhook de confirmação de pagamento recebido do MP.
   * Atualiza o status do pedido conforme o status retornado.
   */
  async processarWebhook(payload: MpWebhookPayload): Promise<void> {
    if (payload.type !== 'payment') return;

    // Consulta detalhes do pagamento via Edge Function
    const pagamento = await firstValueFrom(
      this.http.get<{ status: string; external_reference: string }>(
        `${this.edgeFnUrl}/pagamento/${payload.data.id}`
      )
    );

    const pedidoId = pagamento.external_reference;
    const statusMp = pagamento.status;

    // Mapeia status do MP para status interno
    const novoStatus = this.mapearStatusMp(statusMp);
    if (novoStatus) {
      await this.pedidoService.atualizarStatus(pedidoId, novoStatus, statusMp);
    }
  }

  /**
   * Mapeia status do Mercado Pago para o status interno do pedido.
   */
  private mapearStatusMp(
    statusMp: string
  ): 'pago' | 'cancelado' | null {
    switch (statusMp) {
      case 'approved': return 'pago';
      case 'rejected':
      case 'cancelled': return 'cancelado';
      default: return null;
    }
  }
}
