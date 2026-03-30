# 🚀 Guia Completo: Deploy no Vercel

## Passo 1: Preparar o repositório GitHub

### 1.1 Enviar código para GitHub (se ainda não fez)

```bash
# No seu terminal, na pasta do projeto:
git add .
git commit -m "Setup completo: Supabase, scripts e configurações"
git push origin main
```

**Se ainda não tem repositório:**
1. Crie um novo repositório em [github.com/new](https://github.com/new)
2. Nome: `cosmeticos-artesanais`
3. Depois execute:

```bash
git remote add origin https://github.com/SEU_USER/cosmeticos-artesanais.git
git branch -M main
git push -u origin main
```

---

## Passo 2: Conectar Vercel

### 2.1 Acesse Vercel

1. Vá para [vercel.com](https://vercel.com)
2. Faça login com GitHub (ou crie conta)
3. Clique em **"New Project"** ou **"Add New Project"**

### 2.2 Importar repositório

1. Clique em **"Import Project"**
2. Cole a URL do seu repositório GitHub:
   ```
   https://github.com/SEU_USER/cosmeticos-artesanais
   ```
3. Clique em **"Import"**

### 2.3 Configurar projeto

Na tela de configuração:

- **Framework Preset**: Deixe selecionado **"Other"** (o Vercel detectará Angular automaticamente)
- **Root Directory**: deixe em branco `.` (raiz do projeto)
- **Build Command**: deixe padrão (será usado do vercel.json)
- **Output Directory**: deixe padrão

---

## Passo 3: Adicionar Variáveis de Ambiente

### 3.1 IMPORTANTE: Não comitar credenciais!

O arquivo `vercel.json` já está configurado. As variáveis irão para o Vercel, não para o Git.

### 3.2 Adicionar as 3 variáveis

Antes de fazer deploy, clique em:

**→ Environment Variables** (na tela de configuração)

Adicione estas 3 variáveis:

| Nome | Valor |
|------|-------|
| `SUPABASE_URL` | `https://lejhdnigpobmrmcpkkgb.supabase.co` |
| `SUPABASE_ANON_KEY` | **(ver instruções abaixo)** |
| `MP_PUBLIC_KEY` | **(ver instruções abaixo)** |

---

## Passo 4: Obter as Credenciais

### 4.1 SUPABASE_ANON_KEY

1. Acesse o [Dashboard Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto: `lejhdnigpobmrmcpkkgb`
3. Vá para **Settings** (engrenagem no canto inferior esquerdo)
4. Clique em **"API"**
5. Copie a chave sob **"Project API keys"** → **"anon public"**
6. Cole em Vercel como `SUPABASE_ANON_KEY`

### 4.2 MP_PUBLIC_KEY

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Faça login
3. Menu **"Credenciais"**
4. Selecione ambiente **"TEST"** (para homolog) ou **"LIVE"** (produção)
5. Copie a **"Chave Pública"**
6. Cole em Vercel como `MP_PUBLIC_KEY`

---

## Passo 5: Deploy

### 5.1 Deploy inicial

1. Após adicionar as 3 variáveis
2. Clique em **"Deploy"**
3. Aguarde o build (leva 2-3 minutos)
4. Se sucesso, você terá uma URL: `https://seu-projeto.vercel.app`

### 5.2 Se o deploy falhar

Verifique:
- [ ] As 3 variáveis estão preenchidas?
- [ ] Há espaços em branco extras nas variáveis?
- [ ] O `vercel.json` está na raiz do projeto?
- [ ] O `scripts/setup-env.js` existe?

**Veja os logs**: Na aba **"Deployments"**, clique no deploy que falhou e abra **"Build Logs"**

---

## Passo 6: Testar a Aplicação

Após deploy bem-sucedido, acesse:

### Loja (homepage)
```
https://seu-projeto.vercel.app/
```

### Painel Admin
```
https://seu-projeto.vercel.app/admin
```

**Credenciais admin:**
- Senha: `admin123`

---

## Redeploy (após mudanças)

Se mudar código no GitHub:

1. Push para main: `git push origin main`
2. Vercel detecta e faz deploy automaticamente

Se apenas mudar variáveis de ambiente:

1. Dashboard Vercel → Projeto
2. Settings → Environment Variables
3. Altere e salve
4. Vá para **"Deployments"** → últimor deploy
5. Clique "..." → **"Redeploy"**

---

## Referência Rápida de URLs

| Serviço | URL |
|---------|-----|
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **GitHub Repositório** | https://github.com/seu_user/cosmeticos-artesanais |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/lejhdnigpobmrmcpkkgb |
| **MP Developers** | https://www.mercadopago.com.br/developers |
| **Sua Loja** | https://seu-projeto.vercel.app |
| **Admin Painel** | https://seu-projeto.vercel.app/admin |

---

## ⚠️ Checklist Final

- [ ] Código enviado para GitHub
- [ ] Vercel conectado ao repositório
- [ ] SUPABASE_URL adicionada
- [ ] SUPABASE_ANON_KEY adicionada
- [ ] MP_PUBLIC_KEY adicionada
- [ ] Deploy realizado com sucesso
- [ ] Loja abre sem erros
- [ ] Admin login funciona

---

**Pronto?** Quer que eu te ajude com algum passo específico?
