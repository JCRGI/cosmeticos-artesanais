import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrinho, Produto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  // Estado do carrinho usando Signals (Angular 20)
  private readonly _itens = signal<ItemCarrinho[]>([]);

  readonly itens = this._itens.asReadonly();

  readonly totalItens = computed(() =>
    this._itens().reduce((total, item) => total + item.quantidade, 0)
  );

  readonly valorTotal = computed(() =>
    this._itens().reduce(
      (total, item) => total + item.produto.preco * item.quantidade,
      0
    )
  );

  readonly estaVazio = computed(() => this._itens().length === 0);

  /** Adiciona produto ao carrinho ou incrementa quantidade se já existir */
  adicionar(
    produto: Produto,
    quantidade = 1,
    personalizacao?: Record<string, string>
  ): void {
    this._itens.update(itens => {
      const indice = itens.findIndex(i => i.produto.id === produto.id);
      if (indice >= 0) {
        const copia = [...itens];
        copia[indice] = {
          ...copia[indice],
          quantidade: copia[indice].quantidade + quantidade,
        };
        return copia;
      }
      return [...itens, { produto, quantidade, personalizacao }];
    });
  }

  /** Remove um item do carrinho pelo ID do produto */
  remover(produtoId: string): void {
    this._itens.update(itens => itens.filter(i => i.produto.id !== produtoId));
  }

  /** Altera a quantidade de um item */
  alterarQuantidade(produtoId: string, quantidade: number): void {
    if (quantidade <= 0) {
      this.remover(produtoId);
      return;
    }
    this._itens.update(itens =>
      itens.map(i =>
        i.produto.id === produtoId ? { ...i, quantidade } : i
      )
    );
  }

  /** Esvazia o carrinho */
  limpar(): void {
    this._itens.set([]);
  }
}
