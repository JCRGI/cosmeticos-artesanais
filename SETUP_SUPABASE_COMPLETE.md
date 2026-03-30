# ✅ Setup Supabase Completo

Toda a configuração inicial do Supabase foi aplicada com sucesso!

## O que foi feito:

### ✔️ Migração 001 — Schema Completo
- 6 tabelas principais (produtos, clientes, endereços, pedidos, itens_pedido, configuracoes)
- 2 ENUMs (tipo_produto, status_pedido)
- Triggers para updated_at automático
- Row Level Security (RLS) configurado
- Índices para performance

### ✔️ Migração 002 — Storage
- Bucket `produtos-imagens` criado e público
- Políticas de RLS para leitura pública
- Restrições de upload/delete apenas via service_role (backend)

### ✔️ Migração 003 — Admin
- Senha padrão: `admin123` (pode ser alterada em `configuracoes.admin_senha`)

## Credenciais do Supabase

```
Project ID: lejhdnigpobmrmcpkkgb

Encontre essas informações em: Supabase Dashboard → Settings → API

SUPABASE_URL=https://lejhdnigpobmrmcpkkgb.supabase.co
SUPABASE_ANON_KEY=eyJ... (chave pública/anon)
SUPABASE_SERVICE_KEY=eyJ... (chave service_role - apenas backend)
```

## Próximos passos imediatos:

### 1. Obter as credenciais corretas
```
1. Acesse: https://supabase.com/dashboard/project/lejhdnigpobmrmcpkkgb/settings/api
2. Copie:
   - Project URL → SUPABASE_URL
   - anon public key → SUPABASE_ANON_KEY
   - service_role secret → guardar apenas no backend/Vercel
```

### 2. Configurar Vercel

```bash
# Acesse https://vercel.com/dashboard
# Projeto → Settings → Environment Variables

SUPABASE_URL = https://lejhdnigpobmrmcpkkgb.supabase.co
SUPABASE_ANON_KEY = eyJ...seu_valor..
MP_PUBLIC_KEY = TEST-xxxx..seu_valor..
```

### 3. Redeploy no Vercel

Após adicionar as variáveis, clique em "Redeploy" para que o build pegue os valores corretos.

## Informações importantes

- **Token Supabase**: Salvo durante setup, não será mais necessário localmente
- **Senha admin padrão**: `admin123` → mude em produção!
- **Banco de dados**: Totalmente pronto para receber dados
- **RLS**: Ativado em todas as tabelas para segurança

## Para testar localmente

Atualize `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://lejhdnigpobmrmcpkkgb.supabase.co',
  supabaseAnonKey: 'eyJ...seu_valor..',
  mercadoPagoPublicKey: 'TEST-xxxx..seu_valor..',
};
```

Depois:
```bash
npm start
```

---

**Status**: ✅ Setup Supabase 100% completo  
**Data**: 30 de março de 2026
