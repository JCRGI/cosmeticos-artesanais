import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../core/services/produto.service';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Produto } from '../../core/models/produto.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, LoadingComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly toast = inject(ToastService);

  readonly destaques = signal<Produto[]>([]);
  readonly carregando = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const todos = await this.produtoService.listarAtivos();
      // Exibe até 8 produtos como destaques
      this.destaques.set(todos.slice(0, 8));
    } catch {
      this.toast.erro('Erro ao carregar produtos em destaque.');
    } finally {
      this.carregando.set(false);
    }
  }

  adicionarAoCarrinho(produto: Produto): void {
    this.carrinho.adicionar(produto, 1);
    this.toast.sucesso(`"${produto.nome}" adicionado ao carrinho!`);
  }
}
