# Checklist de Ativação — Cosméticos Artesanais

Siga este guia passo a passo para ativar completamente o e-commerce em produção.

## 1. Configurar Supabase

### 1.1 Criar projeto
- [ ] Acesse [supabase.com](https://supabase.com)
- [ ] Faça login ou crie conta
- [ ] Clique em "New Project"
- [ ] Escolha uma organização e um nome para o projeto
- [ ] Anote os valores para a próxima etapa:
  - **SUPABASE_URL**: ex. `https://xxxxxxxxxxxx.supabase.co`
  - **SUPABASE_ANON_KEY**: chave pública (encontre em Settings → API)

### 1.2 Executar migração SQL
- [ ] Na dashboard do Supabase, acesse **SQL Editor**
- [ ] Clique em "New Query"
- [ ] Copie e cole o conteúdo completo de `supabase/migrations/001_initial_schema.sql`
- [ ] Clique em "Run" ou execute com `Ctrl+Enter`
- [ ] Verifique se todas as tabelas foram criadas (veja em Schemas)

### 1.3 Criar bucket de storage
- [ ] Na dashboard do Supabase, acesse **Storage**
- [ ] Clique em "Create a new bucket"
- [ ] Nome: `produtos-imagens`
- [ ] Marque "Public bucket"
- [ ] Clique em Create

### 1.4 Configurar admin (opcional em desenvolvimento)
- [ ] Na dashboard, acesse **SQL Editor**
- [ ] Execute:
  ```sql
  INSERT INTO configuracoes (chave, valor, descricao)
  VALUES ('admin_senha', 'SENHA_SUPER_SECRETA_AQUI', 'Senha do painel administrativo');
  ```
- [ ] Substitua `SENHA_SUPER_SECRETA_AQUI` por uma senha forte

## 2. Configurar Mercado Pago

- [ ] Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
- [ ] Crie ou acesse sua conta
- [ ] Vá para **Credenciais** (ou **Credentials**)
- [ ] Anote a **Public Key** (chave pública) 
  - Em desenvolvimento: use a chave de TEST
  - Em produção: use chave LIVE

## 3. Configurar Melhor Envio (opcional para MVP)

- [ ] Acesse [Melhor Envio](https://melhorenvio.com.br)
- [ ] Crie conta e integre com sua loja
- [ ] Obtenha um token de API (será guardado apenas no backend/Supabase)

## 4. Deploy no Vercel

### 4.1 Enviar código para GitHub
- [ ] Suba seu repositório para GitHub (ou outro git provider suportado pelo Vercel)
- [ ] Confirme que `vercel.json` está no repositório raiz

### 4.2 Conectar Vercel
- [ ] Acesse [vercel.com](https://vercel.com) e faça login
- [ ] Clique em "New Project"
- [ ] Selecione o repositório `cosmeticos-artesanais`
- [ ] Deixe as configurações padrão (Angular será detectado automaticamente)
- [ ] Clique em "Deploy"

### 4.3 Adicionar variáveis de ambiente
- [ ] Após o primeiro deploy (que falhará), vá para **Configurações → Environment Variables**
- [ ] Adicione as 3 variáveis obrigatórias:
  
  | Nome | Valor | Exemplo |
  |------|-------|---------|
  | `SUPABASE_URL` | URL do seu projeto Supabase | `https://abcd1234.supabase.co` |
  | `SUPABASE_ANON_KEY` | Chave pública do Supabase | `eyJhbGc...` (string longa) |
  | `MP_PUBLIC_KEY` | Chave pública do Mercado Pago | `TEST-xxxxxxxxxxxx` |

- [ ] Salve as variáveis

### 4.4 Redeployar
- [ ] Volte para **Deployments**
- [ ] Clique no botão "..." do último deploy
- [ ] Selecione "Redeploy"
- [ ] Aguarde o build ser concluído (deve ser bem-sucedido agora)

## 5. Testar em Produção

- [ ] Acesse a URL do Vercel (ex: `https://seu-projeto.vercel.app`)
- [ ] A loja deve carregar sem erros
- [ ] Tente:
  - [ ] Navegar no catálogo
  - [ ] Ver detalhes de um produto
  - [ ] Adicionar item ao carrinho
  - [ ] Acessar `/admin` e fazer login com a senha configurada

## 6. Próximos passos (pós-MVP)

- [ ] Configurar edge functions do Supabase para webhooks do Mercado Pago
- [ ] Implementar integração completa com Melhor Envio
- [ ] Configurar domínio personalizado no Vercel
- [ ] Configurar SSL/TLS (automático no Vercel)
- [ ] Monitorar logs e erros em produção

## Referência Rápida: Encontrar Credenciais

### Supabase
1. Dashboard → Settings (engrenagem no canto inferior esquerdo)
2. Abra "API"
3. **Project URL** = SUPABASE_URL
4. **Project API keys** → **anon/public** = SUPABASE_ANON_KEY

### Mercado Pago
1. Painel de controle → Configurações de Integrações (ou Developers)
2. **Credenciais** → selecione ambiente (TEST/LIVE)
3. **Chave Pública** = MP_PUBLIC_KEY

### Vercel
1. Projeto → Settings
2. **Environment Variables**
3. Adicione as 3 variáveis

---

**Status**: ⏳ Pronto para ativação
**Última atualização**: 30 de março de 2026
