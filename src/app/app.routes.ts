import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // ----------------------------------------------------------------
  // Rotas públicas
  // ----------------------------------------------------------------
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Cosméticos Artesanais — Início',
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./features/catalogo/catalogo.component').then(m => m.CatalogoComponent),
    title: 'Catálogo — Cosméticos Artesanais',
  },
  {
    path: 'produto/:id',
    loadComponent: () =>
      import('./features/produto-detalhe/produto-detalhe.component').then(
        m => m.ProdutoDetalheComponent
      ),
    title: 'Produto — Cosméticos Artesanais',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Checkout — Cosméticos Artesanais',
  },
  {
    path: 'confirmacao',
    loadComponent: () =>
      import('./features/confirmacao-pedido/confirmacao-pedido.component').then(
        m => m.ConfirmacaoPedidoComponent
      ),
    title: 'Pedido Confirmado — Cosméticos Artesanais',
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./features/historico/historico.component').then(m => m.HistoricoComponent),
    title: 'Meus Pedidos — Cosméticos Artesanais',
  },

  // ----------------------------------------------------------------
  // Rotas Admin
  // ----------------------------------------------------------------
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'Login — Admin',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            m => m.DashboardComponent
          ),
        title: 'Dashboard — Admin',
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/admin/pedidos/pedidos-admin.component').then(
            m => m.PedidosAdminComponent
          ),
        title: 'Pedidos — Admin',
      },
      {
        path: 'produtos',
        loadComponent: () =>
          import('./features/admin/produtos/produtos-admin.component').then(
            m => m.ProdutosAdminComponent
          ),
        title: 'Produtos — Admin',
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./features/admin/configuracoes/configuracoes-admin.component').then(
            m => m.ConfiguracoesAdminComponent
          ),
        title: 'Configurações — Admin',
      },
    ],
  },

  // ----------------------------------------------------------------
  // Rota 404 — redireciona para home
  // ----------------------------------------------------------------
  {
    path: '**',
    redirectTo: '',
  },
];
