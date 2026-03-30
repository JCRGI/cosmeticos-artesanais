# Cosméticos Artesanais — E-commerce

Loja virtual para venda de cremes e hidratantes artesanais — produtos de estoque e personalizados (manipulados sob encomenda).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 20 + TypeScript + Bootstrap 5 |
| Backend / DB | Supabase (PostgreSQL + Edge Functions) |
| Pagamento | Mercado Pago Checkout Pro |
| Frete | Melhor Envio API |
| Deploy | Vercel (frontend) + Supabase (backend) |

---

## Pré-requisitos

- Node.js 20+
- Angular CLI 20: `npm install -g @angular/cli@20`
- Conta no [Supabase](https://supabase.com)
- Conta no [Mercado Pago](https://www.mercadopago.com.br/developers)
- Conta no [Melhor Envio](https://melhorenvio.com.br)

---

## Setup local

### 1. Clonar e instalar dependências

```bash
git clone <repo-url>
cd cosmeticos-artesanais
npm install
```

### 2. Configurar variáveis de ambiente

Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://SEU_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'SUA_SUPABASE_ANON_KEY',
  mercadoPagoPublicKey: 'SUA_MP_PUBLIC_KEY',
};
```

### 3. Criar o banco de dados no Supabase

Execute no SQL Editor do painel do Supabase:

```
Conteúdo de: supabase/migrations/001_initial_schema.sql
```

### 4. Criar bucket de imagens no Supabase Storage

Painel Supabase → Storage → New bucket:
- Nome: `produtos-imagens`
- Public bucket: **sim**

### 5. Configurar senha do admin

```sql
INSERT INTO configuracoes (chave, valor, descricao)
VALUES ('admin_senha', 'SUA_SENHA_AQUI', 'Senha do painel administrativo');
```

### 6. Iniciar o servidor de desenvolvimento

```bash
ng serve
```

- Loja: `http://localhost:4200`
- Admin: `http://localhost:4200/admin`

---

## Estrutura do projeto

```
src/
  app/
    core/
      services/        # supabase, mercadopago, melhorenvio, pedido, produto, carrinho, admin-auth
      models/          # interfaces TypeScript de todas as entidades
      guards/          # admin.guard
      interceptors/    # auth.interceptor (token admin)
    shared/
      components/      # header, footer, loading, toast, carrinho-sidebar
    features/
      home/            # página inicial com destaques
      catalogo/        # grid de produtos com filtros
      produto-detalhe/ # detalhes + personalização
      checkout/        # identificação, endereço, frete, pagamento
      confirmacao-pedido/
      historico/       # busca por CPF ou e-mail
      admin/
        dashboard/     # métricas do dia
        produtos/      # CRUD de produtos + upload de imagens
        pedidos/       # listagem, filtro e atualização de status
        configuracoes/ # chave-valor do sistema
  environments/
    environment.ts
    environment.prod.ts
supabase/
  migrations/
    001_initial_schema.sql
```

---

## Deploy

### Vercel (frontend)

1. Conecte o repositório no [Vercel](https://vercel.com)
2. Framework preset: **Angular**
3. Configure as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `MP_PUBLIC_KEY`

### Supabase Edge Functions

Crie as funções em `supabase/functions/`:
- `mercadopago/` — criar preferência de pagamento + processar webhook
- `melhorenvio/` — calcular opções de frete

Configure os secrets:
```bash
supabase secrets set MP_ACCESS_TOKEN=seu_token
supabase secrets set MELHORENVIO_TOKEN=seu_token
```

---

## Modelo de identidade do cliente

Sem login obrigatório. O cliente é identificado por **CPF ou e-mail** no checkout.
Na próxima compra o sistema reconhece automaticamente o histórico.
Após a compra, o cliente pode opcionalmente definir uma senha.

---

## Fluxo de pagamento

```
Checkout
  → Criar pedido (status: aguardando_pagamento)
  → Criar preferência MP via Edge Function
  → Redirecionar para Checkout Pro do Mercado Pago
  → Webhook MP → Edge Function → Atualizar status do pedido
  → Cliente retorna para /confirmacao?pedido_id=xxx
```

---

## Commits semânticos

```
feat:      nova funcionalidade
fix:       correção de bug
chore:     tarefas de manutenção (deps, config)
style:     ajustes de estilo/layout
refactor:  refatoração sem mudança de comportamento
```
