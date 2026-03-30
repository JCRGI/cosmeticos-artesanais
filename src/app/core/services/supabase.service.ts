import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  /** Expõe o cliente para uso nos serviços derivados */
  get supabase(): SupabaseClient {
    return this.client;
  }

  // ----------------------------------------------------------------
  // Métodos CRUD genéricos
  // ----------------------------------------------------------------

  /** Seleciona registros de uma tabela com filtros opcionais */
  async select<T>(
    tabela: string,
    filtros: Record<string, unknown> = {},
    colunas = '*'
  ): Promise<T[]> {
    let query = this.client.from(tabela).select(colunas);
    for (const [chave, valor] of Object.entries(filtros)) {
      query = query.eq(chave, valor as string);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as T[];
  }

  /** Busca um único registro pelo ID */
  async selectById<T>(tabela: string, id: string, colunas = '*'): Promise<T | null> {
    const { data, error } = await this.client
      .from(tabela)
      .select(colunas)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as T | null;
  }

  /** Insere um registro e retorna o objeto criado */
  async insert<T>(tabela: string, payload: Partial<T>): Promise<T> {
    const { data, error } = await this.client
      .from(tabela)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  }

  /** Atualiza registros que satisfazem os filtros */
  async update<T>(
    tabela: string,
    id: string,
    payload: Partial<T>
  ): Promise<T> {
    const { data, error } = await this.client
      .from(tabela)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  }

  /** Remove um registro pelo ID */
  async delete(tabela: string, id: string): Promise<void> {
    const { error } = await this.client.from(tabela).delete().eq('id', id);
    if (error) throw error;
  }

  // ----------------------------------------------------------------
  // Upload de imagens para o Supabase Storage
  // ----------------------------------------------------------------

  /**
   * Faz upload de um arquivo para o bucket especificado.
   * @returns URL pública do arquivo no Storage
   */
  async uploadImagem(bucket: string, caminho: string, arquivo: File): Promise<string> {
    const { error } = await this.client.storage
      .from(bucket)
      .upload(caminho, arquivo, { upsert: true });
    if (error) throw error;

    const { data } = this.client.storage.from(bucket).getPublicUrl(caminho);
    return data.publicUrl;
  }

  /** Remove uma imagem do Storage pelo caminho */
  async removerImagem(bucket: string, caminho: string): Promise<void> {
    const { error } = await this.client.storage.from(bucket).remove([caminho]);
    if (error) throw error;
  }
}
