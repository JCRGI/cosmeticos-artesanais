import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Configuracao, ChaveConfiguracao } from '../models/configuracao.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracaoService {
  private cache: Map<string, string> = new Map();

  constructor(private readonly supa: SupabaseService) {}

  /** Busca o valor de uma configuração por chave */
  async obter(chave: ChaveConfiguracao): Promise<string> {
    if (this.cache.has(chave)) return this.cache.get(chave)!;

    const { data, error } = await this.supa.supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', chave)
      .single();
    if (error) throw error;

    const valor = data?.valor ?? '';
    this.cache.set(chave, valor);
    return valor;
  }

  /** Lista todas as configurações (admin) */
  async listarTodas(): Promise<Configuracao[]> {
    const { data, error } = await this.supa.supabase
      .from('configuracoes')
      .select('*')
      .order('chave');
    if (error) throw error;
    return data ?? [];
  }

  /** Atualiza o valor de uma configuração (admin) */
  async atualizar(chave: string, valor: string): Promise<void> {
    const { error } = await this.supa.supabase
      .from('configuracoes')
      .update({ valor })
      .eq('chave', chave);
    if (error) throw error;
    this.cache.set(chave, valor); // atualiza cache local
  }

  /** Invalida o cache para forçar releitura */
  limparCache(): void {
    this.cache.clear();
  }
}
