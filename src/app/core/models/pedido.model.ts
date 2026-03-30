// Modelo de Pedido e Itens
import { EnderecoForm } from './endereco.model';

export type StatusPedido =
  | 'aguardando_pagamento'
  | 'pago'
  | 'em_preparo'
  | 'enviado'
  | 'entregue'
  | 'cancelado';

export interface ItemPedido {
  id: string;
  pedidoId: string;
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  personalizacao?: Record<string, string>;
}

export interface Pedido {
  id: string;
  clienteId: string;
  status: StatusPedido;
  valorProdutos: number;
  valorFrete: number;
  valorTotal: number;
  enderecoEntrega: EnderecoForm;
  metodoFrete: string;
  prazoFreteDias: number;
  slaPreparoDias: number;
  previsaoEntrega: string;       // date ISO string
  mpPaymentId?: string;
  mpStatus?: string;
  createdAt: string;
  updatedAt: string;
  itens?: ItemPedido[];           // carregado via join quando necessário
}

// DTO para criação de pedido no checkout
export interface CriarPedidoRequest {
  clienteId: string;
  enderecoEntrega: EnderecoForm;
  metodoFrete: string;
  valorFrete: number;
  prazoFreteDias: number;
  itens: {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    personalizacao?: Record<string, string>;
  }[];
}

// Rótulos amigáveis para exibição de status
export const STATUS_PEDIDO_LABELS: Record<StatusPedido, string> = {
  aguardando_pagamento: 'Aguardando Pagamento',
  pago: 'Pago',
  em_preparo: 'Em Preparo',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

// Cores Bootstrap para cada status (badge)
export const STATUS_PEDIDO_COLORS: Record<StatusPedido, string> = {
  aguardando_pagamento: 'warning',
  pago: 'info',
  em_preparo: 'primary',
  enviado: 'secondary',
  entregue: 'success',
  cancelado: 'danger',
};
