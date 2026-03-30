import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { CarrinhoSidebarComponent } from '../carrinho-sidebar/carrinho-sidebar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, CarrinhoSidebarComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly carrinho = inject(CarrinhoService);
  carrinhoAberto = false;

  abrirCarrinho(): void {
    this.carrinhoAberto = true;
  }

  fecharCarrinho(): void {
    this.carrinhoAberto = false;
  }
}
