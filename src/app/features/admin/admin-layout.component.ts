import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../../core/services/admin-auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="d-flex min-vh-100">
      <!-- Sidebar -->
      <nav class="bg-dark text-white d-flex flex-column p-3" style="width: 240px; min-width: 240px;">
        <div class="mb-4 px-2">
          <h6 class="text-white-50 small text-uppercase fw-bold mb-0">Painel Admin</h6>
          <p class="text-white fw-bold mb-0">
            <i class="bi bi-flower1 me-2 text-primary"></i>Cosméticos
          </p>
        </div>

        <ul class="nav nav-pills flex-column gap-1 flex-grow-1">
          <li class="nav-item">
            <a class="nav-link text-white-50"
               routerLink="/admin/dashboard"
               routerLinkActive="active bg-primary text-white">
              <i class="bi bi-speedometer2 me-2"></i>Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white-50"
               routerLink="/admin/pedidos"
               routerLinkActive="active bg-primary text-white">
              <i class="bi bi-bag me-2"></i>Pedidos
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white-50"
               routerLink="/admin/produtos"
               routerLinkActive="active bg-primary text-white">
              <i class="bi bi-box-seam me-2"></i>Produtos
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white-50"
               routerLink="/admin/configuracoes"
               routerLinkActive="active bg-primary text-white">
              <i class="bi bi-gear me-2"></i>Configurações
            </a>
          </li>
        </ul>

        <div class="border-top border-secondary pt-3 mt-3">
          <a routerLink="/" class="nav-link text-white-50 mb-1">
            <i class="bi bi-arrow-left me-2"></i>Ver loja
          </a>
          <button class="nav-link text-white-50 border-0 bg-transparent w-100 text-start"
            (click)="sair()">
            <i class="bi bi-box-arrow-right me-2"></i>Sair
          </button>
        </div>
      </nav>

      <!-- Conteúdo principal -->
      <main class="flex-grow-1 bg-light overflow-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  private readonly adminAuth = inject(AdminAuthService);
  private readonly router = inject(Router);

  sair(): void {
    this.adminAuth.logout();
    this.router.navigate(['/admin/login']);
  }
}
