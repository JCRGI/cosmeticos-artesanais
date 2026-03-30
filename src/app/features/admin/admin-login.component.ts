import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="card border-0 shadow-sm p-5" style="width: 380px;">
        <div class="text-center mb-4">
          <i class="bi bi-flower1 text-primary" style="font-size: 3rem;"></i>
          <h4 class="fw-bold mt-2">Painel Admin</h4>
          <p class="text-muted small">Cosméticos Artesanais</p>
        </div>

        <div class="mb-3">
          <label class="form-label">Senha</label>
          <input
            type="password"
            class="form-control"
            [(ngModel)]="senha"
            placeholder="Digite a senha do admin"
            (keydown.enter)="entrar()">
        </div>

        <button
          class="btn btn-primary w-100"
          [disabled]="carregando()"
          (click)="entrar()">
          @if (carregando()) {
            <span class="spinner-border spinner-border-sm me-2"></span>
          }
          Entrar
        </button>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  private readonly adminAuth = inject(AdminAuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  senha = '';
  readonly carregando = signal(false);

  async entrar(): Promise<void> {
    if (!this.senha) return;
    this.carregando.set(true);
    try {
      const ok = await this.adminAuth.login(this.senha);
      if (ok) {
        await this.router.navigate(['/admin/dashboard']);
      } else {
        this.toast.erro('Senha incorreta.');
      }
    } finally {
      this.carregando.set(false);
    }
  }
}
