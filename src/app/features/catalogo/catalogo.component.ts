import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../core/services/produto.service';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Produto, TipoProduto } from '../../core/models/produto.model';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, FormsModule, LoadingComponent],
  templateUrl: './catalogo.component.html',
})
export class CatalogoComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly todos = signal<Produto[]>([]);
  readonly filtrados = signal<Produto[]>([]);
  readonly carregando = signal(true);

  filtroTipo: TipoProduto | '' = '';
  termoBusca = '';

  async ngOnInit(): Promise<void> {
    // Lê parâmetro de query ?tipo=personalizado
    this.route.queryParams.subscribe(params => {
      this.filtroTipo = (params['tipo'] as TipoProduto) || '';
      this.aplicarFiltros();
    });

    try {
      const produtos = await this.produtoService.listarAtivos();
      this.todos.set(produtos);
      this.aplicarFiltros();
    } catch {
      this.toast.erro('Erro ao carregar catálogo.');
    } finally {
      this.carregando.set(false);
    }
  }

  aplicarFiltros(): void {
    let resultado = this.todos();

    if (this.filtroTipo) {
      resultado = resultado.filter(p => p.tipo === this.filtroTipo);
    }

    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(
        p =>
          p.nome.toLowerCase().includes(termo) ||
          p.descricao.toLowerCase().includes(termo)
      );
    }

    this.filtrados.set(resultado);
  }

  limparFiltros(): void {
    this.filtroTipo = '';
    this.termoBusca = '';
    this.aplicarFiltros();
  }

  adicionarAoCarrinho(produto: Produto): void {
    this.carrinho.adicionar(produto, 1);
    this.toast.sucesso(`"${produto.nome}" adicionado ao carrinho!`);
  }
}
