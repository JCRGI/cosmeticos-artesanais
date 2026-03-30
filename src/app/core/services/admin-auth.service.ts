import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

const STORAGE_KEY = 'admin_autenticado';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly _autenticado = signal<boolean>(
    sessionStorage.getItem(STORAGE_KEY) === 'true'
  );

  constructor(private readonly supa: SupabaseService) {}

  estaAutenticado(): boolean {
    return this._autenticado();
  }

  /**
   * Valida a senha do admin comparando com o valor armazenado
   * na tabela configuracoes (chave: 'admin_senha_hash').
   * Por simplicidade, aceita comparação direta em dev.
   * Em produção, use bcrypt via Edge Function.
   */
  async login(senha: string): Promise<boolean> {
    const { data } = await this.supa.supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'admin_senha')
      .maybeSingle();

    const senhaCorreta = data?.valor === senha;
    if (senhaCorreta) {
      this._autenticado.set(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
    return senhaCorreta;
  }

  logout(): void {
    this._autenticado.set(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
