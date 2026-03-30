import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
  Pedido,
  ItemPedido,
  StatusPedido,
  CriarPedidoRequest,
} from '../models/pedido.model';
import { Cliente, ClienteForm } from '../models/cliente.model';
import { EnderecoForm } from '../models/endereco.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private readonly supa: SupabaseService) {}

  // ----------------------------------------------------------------
  // Identificação / criação de cliente
  // ----------------------------------------------------------------

  /**
   * Busca cliente por CPF ou e-mail.
   * Se não encontrar, cria um novo registro.
   */
  async identificarOuCriarCliente(form: ClienteForm): Promise<Cliente> {
    const supabase = this.supa.supabase;

    // Tenta encontrar por CPF
    if (form.cpf) {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('cpf', form.cpf)
        .maybeSingle();
      if (data) return this.mapearCliente(data);
    }

    // Tenta encontrar por e-mail
    if (form.email) {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', form.email)
        .maybeSingle();
      if (data) return this.mapearCliente(data);
    }

    // Cria novo cliente
    const { data, error } = await supabase
      .from('clientes')
      .insert({
        cpf: form.cpf ?? null,
        email: form.email ?? null,
        nome: form.nome,
        telefone: form.telefone ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapearCliente(data);
  }

  // ----------------------------------------------------------------
  // Criação de pedido completo
  // ----------------------------------------------------------------

  /**
   * Cria o pedido com todos os itens.
   * Calcula a previsão de entrega: hoje + MAX(sla_preparo) + prazo_frete.
   */
  async criarPedido(req: CriarPedidoRequest): Promise<Pedido> {
    const supabase = this.supa.supabase;

    // Busca SLA de preparo de cada produto
    const produtoIds = req.itens.map(i => i.produtoId);
    const { data: produtos, error: errProd } = await supabase
      .from('produtos')
      .select('id, sla_preparo_dias')
      .in('id', produtoIds);
    if (errProd) throw errProd;

    // MAX SLA entre todos os itens
    const maxSla = (produtos ?? []).reduce(
      (max, p) => Math.max(max, p.sla_preparo_dias as number),
      0
    );

    // Cálculo de valores
    const valorProdutos = req.itens.reduce(
      (total, item) => total + item.precoUnitario * item.quantidade,
      0
    );
    const valorTotal = valorProdutos + req.valorFrete;

    // Previsão de entrega = hoje + maxSla (dias úteis) + prazo frete (dias corridos)
    const previsaoEntrega = this.calcularPrevisaoEntrega(
      maxSla,
      req.prazoFreteDias
    );

    // Insere pedido
    const { data: pedidoRow, error: errPedido } = await supabase
      .from('pedidos')
      .insert({
        cliente_id: req.clienteId,
        status: 'aguardando_pagamento',
        valor_produtos: valorProdutos,
        valor_frete: req.valorFrete,
        valor_total: valorTotal,
        endereco_entrega: req.enderecoEntrega,
        metodo_frete: req.metodoFrete,
        prazo_frete_dias: req.prazoFreteDias,
        sla_preparo_dias: maxSla,
        previsao_entrega: previsaoEntrega,
      })
      .select()
      .single();
    if (errPedido) throw errPedido;

    // Insere itens do pedido
    const itensPayload = req.itens.map(item => ({
      pedido_id: pedidoRow.id,
      produto_id: item.produtoId,
      quantidade: item.quantidade,
      preco_unitario: item.precoUnitario,
      personalizacao: item.personalizacao ?? null,
    }));
    const { error: errItens } = await supabase
      .from('itens_pedido')
      .insert(itensPayload);
    if (errItens) throw errItens;

    return this.mapearPedido(pedidoRow);
  }

  // ----------------------------------------------------------------
  // Consultas
  // ----------------------------------------------------------------

  /** Busca histórico de pedidos por CPF ou e-mail */
  async buscarHistorico(cpfOuEmail: string): Promise<Pedido[]> {
    const supabase = this.supa.supabase;

    // Determina se é e-mail ou CPF (e-mail contém @)
    const campo = cpfOuEmail.includes('@') ? 'email' : 'cpf';

    const { data: cliente } = await supabase
      .from('clientes')
      .select('id')
      .eq(campo, cpfOuEmail)
      .maybeSingle();

    if (!cliente) return [];

    const { data, error } = await supabase
      .from('pedidos')
      .select('*, itens_pedido(*)')
      .eq('cliente_id', cliente.id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data ?? []).map(row => ({
      ...this.mapearPedido(row),
      itens: (row.itens_pedido ?? []).map(this.mapearItem),
    }));
  }

  /** Busca pedido por ID com itens */
  async buscarPorId(pedidoId: string): Promise<Pedido | null> {
    const { data, error } = await this.supa.supabase
      .from('pedidos')
      .select('*, itens_pedido(*)')
      .eq('id', pedidoId)
      .single();
    if (error) throw error;
    if (!data) return null;
    return {
      ...this.mapearPedido(data),
      itens: (data.itens_pedido ?? []).map(this.mapearItem),
    };
  }

  /** Lista todos os pedidos (admin) com filtro opcional por status */
  async listarTodos(status?: StatusPedido): Promise<Pedido[]> {
    let query = this.supa.supabase
      .from('pedidos')
      .select('*, itens_pedido(*)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(row => ({
      ...this.mapearPedido(row),
      itens: (row.itens_pedido ?? []).map(this.mapearItem),
    }));
  }

  /** Atualiza o status de um pedido (admin ou webhook MP) */
  async atualizarStatus(
    pedidoId: string,
    status: StatusPedido,
    mpStatus?: string
  ): Promise<void> {
    const payload: Record<string, unknown> = { status };
    if (mpStatus !== undefined) payload['mp_status'] = mpStatus;

    const { error } = await this.supa.supabase
      .from('pedidos')
      .update(payload)
      .eq('id', pedidoId);
    if (error) throw error;
  }

  // ----------------------------------------------------------------
  // Cálculo de datas
  // ----------------------------------------------------------------

  /**
   * Calcula a data de previsão de entrega.
   * - sla: dias úteis (segunda a sexta) a partir de hoje
   * - prazoFrete: dias corridos adicionados após o SLA
   */
  private calcularPrevisaoEntrega(sla: number, prazoFrete: number): string {
    const data = new Date();

    // Adiciona dias úteis para preparo
    let diasUteis = 0;
    while (diasUteis < sla) {
      data.setDate(data.getDate() + 1);
      const dia = data.getDay();
      if (dia !== 0 && dia !== 6) diasUteis++; // ignora sábado (6) e domingo (0)
    }

    // Adiciona dias corridos para frete
    data.setDate(data.getDate() + prazoFrete);

    return data.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // ----------------------------------------------------------------
  // Mapeamento snake_case (DB) → camelCase (TS)
  // ----------------------------------------------------------------

  private mapearCliente(row: Record<string, unknown>): Cliente {
    return {
      id: row['id'] as string,
      cpf: row['cpf'] as string | undefined,
      email: row['email'] as string | undefined,
      nome: row['nome'] as string,
      telefone: row['telefone'] as string | undefined,
      temSenha: row['tem_senha'] as boolean,
      createdAt: row['created_at'] as string,
    };
  }

  private mapearPedido(row: Record<string, unknown>): Pedido {
    return {
      id: row['id'] as string,
      clienteId: row['cliente_id'] as string,
      status: row['status'] as StatusPedido,
      valorProdutos: row['valor_produtos'] as number,
      valorFrete: row['valor_frete'] as number,
      valorTotal: row['valor_total'] as number,
      enderecoEntrega: row['endereco_entrega'] as EnderecoForm,
      metodoFrete: row['metodo_frete'] as string,
      prazoFreteDias: row['prazo_frete_dias'] as number,
      slaPreparoDias: row['sla_preparo_dias'] as number,
      previsaoEntrega: row['previsao_entrega'] as string,
      mpPaymentId: row['mp_payment_id'] as string | undefined,
      mpStatus: row['mp_status'] as string | undefined,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    };
  }

  private mapearItem(row: Record<string, unknown>): ItemPedido {
    return {
      id: row['id'] as string,
      pedidoId: row['pedido_id'] as string,
      produtoId: row['produto_id'] as string,
      quantidade: row['quantidade'] as number,
      precoUnitario: row['preco_unitario'] as number,
      personalizacao: row['personalizacao'] as Record<string, string> | undefined,
    };
  }
}
