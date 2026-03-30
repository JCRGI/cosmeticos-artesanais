import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProdutoService } from '../../../core/services/produto.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { Produto, TipoProduto } from '../../../core/models/produto.model';

@Component({
  selector: 'app-produtos-admin',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './produtos-admin.component.html',
})
export class ProdutosAdminComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly produtos = signal<Produto[]>([]);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly modoEdicao = signal(false);
  readonly produtoEditando = signal<Produto | null>(null);

  form!: FormGroup;
  arquivosImagem: File[] = [];

  ngOnInit(): void {
    this.inicializarForm();
    this.carregar();
  }

  private inicializarForm(produto?: Produto): void {
    this.form = this.fb.group({
      nome: [produto?.nome ?? '', Validators.required],
      descricao: [produto?.descricao ?? '', Validators.required],
      tipo: [produto?.tipo ?? 'estoque', Validators.required],
      preco: [produto?.preco ?? 0, [Validators.required, Validators.min(0.01)]],
      ativo: [produto?.ativo ?? true],
      estoqueQuantidade: [produto?.estoqueQuantidade ?? null],
      slaPreparoDias: [produto?.slaPreparo_dias ?? 1, [Validators.required, Validators.min(1)]],
      pesoGramas: [produto?.pesoGramas ?? 100, [Validators.required, Validators.min(1)]],
      alturaCm: [produto?.alturaCm ?? 5, [Validators.required, Validators.min(1)]],
      larguraCm: [produto?.larguraCm ?? 5, [Validators.required, Validators.min(1)]],
      comprimentoCm: [produto?.comprimentoCm ?? 5, [Validators.required, Validators.min(1)]],
    });
  }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await this.produtoService.listarTodos();
      this.produtos.set(lista);
    } catch {
      this.toast.erro('Erro ao carregar produtos.');
    } finally {
      this.carregando.set(false);
    }
  }

  abrirCriacao(): void {
    this.produtoEditando.set(null);
    this.inicializarForm();
    this.modoEdicao.set(true);
  }

  abrirEdicao(produto: Produto): void {
    this.produtoEditando.set(produto);
    this.inicializarForm(produto);
    this.modoEdicao.set(true);
  }

  cancelar(): void {
    this.modoEdicao.set(false);
    this.produtoEditando.set(null);
    this.arquivosImagem = [];
  }

  onArquivosSelecionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.arquivosImagem = Array.from(input.files ?? []);
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;

    this.salvando.set(true);
    try {
      const f = this.form.value;
      const editando = this.produtoEditando();

      let imagens = editando?.imagens ?? [];

      // Upload de novas imagens
      if (this.arquivosImagem.length > 0) {
        const produtoId = editando?.id ?? crypto.randomUUID();
        const urls = await Promise.all(
          this.arquivosImagem.map(a => this.produtoService.uploadImagem(produtoId, a))
        );
        imagens = [...imagens, ...urls];
      }

      const payload = { ...f, imagens };

      if (editando) {
        await this.produtoService.atualizar(editando.id, payload);
        this.toast.sucesso('Produto atualizado com sucesso.');
      } else {
        await this.produtoService.criar(payload);
        this.toast.sucesso('Produto criado com sucesso.');
      }

      this.cancelar();
      await this.carregar();
    } catch {
      this.toast.erro('Erro ao salvar produto.');
    } finally {
      this.salvando.set(false);
    }
  }

  async alternarAtivo(produto: Produto): Promise<void> {
    try {
      await this.produtoService.alternarAtivo(produto.id, !produto.ativo);
      this.produtos.update(lista =>
        lista.map(p => p.id === produto.id ? { ...p, ativo: !p.ativo } : p)
      );
      this.toast.sucesso(`Produto ${!produto.ativo ? 'ativado' : 'desativado'}.`);
    } catch {
      this.toast.erro('Erro ao alterar status do produto.');
    }
  }

  get tipoAtual(): TipoProduto {
    return this.form.get('tipo')?.value;
  }
}
