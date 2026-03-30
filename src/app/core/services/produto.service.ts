import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Produto, ProdutoForm, TipoProduto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly TABELA = 'produtos';
  private readonly BUCKET = 'produtos-imagens';

  constructor(private readonly supa: SupabaseService) {}

  /** Lista todos os produtos ativos */
  async listarAtivos(): Promise<Produto[]> {
    const { data, error } = await this.supa.supabase
      .from(this.TABELA)
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapear);
  }

  /** Lista todos os produtos (incluindo inativos) — painel admin */
  async listarTodos(): Promise<Produto[]> {
    const { data, error } = await this.supa.supabase
      .from(this.TABELA)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapear);
  }

  /** Busca produto por ID */
  async buscarPorId(id: string): Promise<Produto | null> {
    const { data, error } = await this.supa.supabase
      .from(this.TABELA)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ? this.mapear(data) : null;
  }

  /** Filtra produtos ativos por tipo */
  async filtrarPorTipo(tipo: TipoProduto): Promise<Produto[]> {
    const { data, error } = await this.supa.supabase
      .from(this.TABELA)
      .select('*')
      .eq('ativo', true)
      .eq('tipo', tipo)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapear);
  }

  /** Busca produtos por nome (pesquisa parcial) */
  async buscarPorNome(termo: string): Promise<Produto[]> {
    const { data, error } = await this.supa.supabase
      .from(this.TABELA)
      .select('*')
      .eq('ativo', true)
      .ilike('nome', `%${termo}%`);
    if (error) throw error;
    return (data ?? []).map(this.mapear);
  }

  /** Cria um novo produto (admin) */
  async criar(form: ProdutoForm): Promise<Produto> {
    const payload = this.desmapear(form);
    const { data, error } = await this.supa.supabase
      .from(this.TABELA)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return this.mapear(data);
  }

  /** Atualiza um produto existente (admin) */
  async atualizar(id: string, form: Partial<ProdutoForm>): Promise<Produto> {
    const payload = this.desmapear(form as ProdutoForm);
    const { data, error } = await this.supa.supabase
      .from(this.TABELA)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this.mapear(data);
  }

  /** Ativa ou desativa um produto (admin) */
  async alternarAtivo(id: string, ativo: boolean): Promise<void> {
    const { error } = await this.supa.supabase
      .from(this.TABELA)
      .update({ ativo })
      .eq('id', id);
    if (error) throw error;
  }

  /** Faz upload de imagem e retorna a URL pública */
  async uploadImagem(produtoId: string, arquivo: File): Promise<string> {
    const extensao = arquivo.name.split('.').pop();
    const caminho = `${produtoId}/${Date.now()}.${extensao}`;
    return this.supa.uploadImagem(this.BUCKET, caminho, arquivo);
  }

  // ----------------------------------------------------------------
  // Mapeamento snake_case (DB) <-> camelCase (TS)
  // ----------------------------------------------------------------

  private mapear(row: Record<string, unknown>): Produto {
    return {
      id: row['id'] as string,
      nome: row['nome'] as string,
      descricao: row['descricao'] as string,
      tipo: row['tipo'] as TipoProduto,
      preco: row['preco'] as number,
      imagens: (row['imagens'] as string[]) ?? [],
      ativo: row['ativo'] as boolean,
      estoqueQuantidade: row['estoque_quantidade'] as number | undefined,
      slaPreparo_dias: row['sla_preparo_dias'] as number,
      pesoGramas: row['peso_gramas'] as number,
      alturaCm: row['altura_cm'] as number,
      larguraCm: row['largura_cm'] as number,
      comprimentoCm: row['comprimento_cm'] as number,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    };
  }

  private desmapear(form: ProdutoForm): Record<string, unknown> {
    return {
      nome: form.nome,
      descricao: form.descricao,
      tipo: form.tipo,
      preco: form.preco,
      imagens: form.imagens,
      ativo: form.ativo,
      estoque_quantidade: form.estoqueQuantidade ?? null,
      sla_preparo_dias: form.slaPreparoDias,
      peso_gramas: form.pesoGramas,
      altura_cm: form.alturaCm,
      largura_cm: form.larguraCm,
      comprimento_cm: form.comprimentoCm,
    };
  }
}
