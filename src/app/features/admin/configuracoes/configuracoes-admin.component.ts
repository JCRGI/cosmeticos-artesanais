import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracaoService } from '../../../core/services/configuracao.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { Configuracao } from '../../../core/models/configuracao.model';

@Component({
  selector: 'app-configuracoes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './configuracoes-admin.component.html',
})
export class ConfiguracoesAdminComponent implements OnInit {
  private readonly configService = inject(ConfiguracaoService);
  private readonly toast = inject(ToastService);

  readonly configs = signal<Configuracao[]>([]);
  readonly carregando = signal(true);
  readonly salvando = signal<string | null>(null); // chave sendo salva

  // Mapa editável localmente
  valores: Record<string, string> = {};

  // Chaves que contêm tokens (ocultas com ••••)
  readonly chavesSensiveis = new Set([
    'mp_access_token',
    'melhorenvio_token',
    'admin_senha',
  ]);

  readonly visibilidadeSensiveis: Record<string, boolean> = {};

  async ngOnInit(): Promise<void> {
    try {
      const lista = await this.configService.listarTodas();
      this.configs.set(lista);
      for (const c of lista) {
        this.valores[c.chave] = c.valor;
        this.visibilidadeSensiveis[c.chave] = false;
      }
    } catch {
      this.toast.erro('Erro ao carregar configurações.');
    } finally {
      this.carregando.set(false);
    }
  }

  async salvar(chave: string): Promise<void> {
    this.salvando.set(chave);
    try {
      await this.configService.atualizar(chave, this.valores[chave]);
      this.toast.sucesso('Configuração salva.');
    } catch {
      this.toast.erro('Erro ao salvar configuração.');
    } finally {
      this.salvando.set(null);
    }
  }

  toggleVisibilidade(chave: string): void {
    this.visibilidadeSensiveis[chave] = !this.visibilidadeSensiveis[chave];
  }

  tipoInput(chave: string): string {
    if (!this.chavesSensiveis.has(chave)) return 'text';
    return this.visibilidadeSensiveis[chave] ? 'text' : 'password';
  }
}
