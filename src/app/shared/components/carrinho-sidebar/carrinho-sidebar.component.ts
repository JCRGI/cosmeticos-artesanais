import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarrinhoService } from '../../../core/services/carrinho.service';

@Component({
  selector: 'app-carrinho-sidebar',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './carrinho-sidebar.component.html',
})
export class CarrinhoSidebarComponent {
  @Input() aberto = false;
  @Output() fechar = new EventEmitter<void>();

  readonly carrinho = inject(CarrinhoService);

  onFechar(): void {
    this.fechar.emit();
  }

  removerItem(produtoId: string): void {
    this.carrinho.remover(produtoId);
  }

  alterarQuantidade(produtoId: string, delta: number, quantidadeAtual: number): void {
    this.carrinho.alterarQuantidade(produtoId, quantidadeAtual + delta);
  }
}
