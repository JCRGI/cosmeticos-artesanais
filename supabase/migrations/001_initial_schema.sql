-- ============================================================
-- Schema inicial — E-commerce de Cosméticos Artesanais
-- Migração 001 — Criação de todas as tabelas
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM: tipo de produto
-- ============================================================
CREATE TYPE tipo_produto AS ENUM ('estoque', 'personalizado');

-- ============================================================
-- ENUM: status do pedido
-- ============================================================
CREATE TYPE status_pedido AS ENUM (
  'aguardando_pagamento',
  'pago',
  'em_preparo',
  'enviado',
  'entregue',
  'cancelado'
);

-- ============================================================
-- TABELA: produtos
-- ============================================================
CREATE TABLE produtos (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome                TEXT          NOT NULL,
  descricao           TEXT,
  tipo                tipo_produto  NOT NULL,
  preco               NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  imagens             TEXT[]        DEFAULT '{}',
  ativo               BOOLEAN       NOT NULL DEFAULT true,
  estoque_quantidade  INT           CHECK (estoque_quantidade >= 0),  -- apenas para tipo 'estoque'
  sla_preparo_dias    INT           NOT NULL DEFAULT 1,                -- dias úteis para preparar
  peso_gramas         INT           NOT NULL CHECK (peso_gramas > 0),
  altura_cm           INT           NOT NULL CHECK (altura_cm > 0),
  largura_cm          INT           NOT NULL CHECK (largura_cm > 0),
  comprimento_cm      INT           NOT NULL CHECK (comprimento_cm > 0),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELA: clientes
-- Identificados por CPF ou e-mail (sem cadastro obrigatório)
-- ============================================================
CREATE TABLE clientes (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpf         TEXT        UNIQUE,       -- pode ser nulo se identificado só por e-mail
  email       TEXT        UNIQUE,       -- pode ser nulo se identificado só por CPF
  nome        TEXT        NOT NULL,
  telefone    TEXT,
  tem_senha   BOOLEAN     NOT NULL DEFAULT false,
  senha_hash  TEXT,                     -- preenchido apenas se o cliente optar por senha
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cpf_ou_email CHECK (cpf IS NOT NULL OR email IS NOT NULL)
);

-- ============================================================
-- TABELA: enderecos
-- ============================================================
CREATE TABLE enderecos (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id   UUID        NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  cep          TEXT        NOT NULL,
  logradouro   TEXT        NOT NULL,
  numero       TEXT        NOT NULL,
  complemento  TEXT,
  bairro       TEXT        NOT NULL,
  cidade       TEXT        NOT NULL,
  estado       CHAR(2)     NOT NULL,
  principal    BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para busca por cliente
CREATE INDEX idx_enderecos_cliente_id ON enderecos(cliente_id);

-- ============================================================
-- TABELA: pedidos
-- ============================================================
CREATE TABLE pedidos (
  id                 UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id         UUID          NOT NULL REFERENCES clientes(id),
  status             status_pedido NOT NULL DEFAULT 'aguardando_pagamento',
  valor_produtos     NUMERIC(10,2) NOT NULL CHECK (valor_produtos >= 0),
  valor_frete        NUMERIC(10,2) NOT NULL CHECK (valor_frete >= 0),
  valor_total        NUMERIC(10,2) NOT NULL CHECK (valor_total >= 0),
  endereco_entrega   JSONB         NOT NULL,  -- snapshot do endereço no momento do pedido
  metodo_frete       TEXT          NOT NULL,  -- ex: "PAC", "SEDEX", "Jadlog"
  prazo_frete_dias   INT           NOT NULL,
  sla_preparo_dias   INT           NOT NULL,  -- calculado no momento do pedido
  previsao_entrega   DATE          NOT NULL,  -- data estimada total (preparo + frete)
  mp_payment_id      TEXT,                    -- ID de pagamento do Mercado Pago
  mp_status          TEXT,                    -- status retornado pelo Mercado Pago
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_status     ON pedidos(status);
CREATE INDEX idx_pedidos_mp_id      ON pedidos(mp_payment_id);

CREATE TRIGGER trg_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELA: itens_pedido
-- ============================================================
CREATE TABLE itens_pedido (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id       UUID          NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id      UUID          NOT NULL REFERENCES produtos(id),
  quantidade      INT           NOT NULL CHECK (quantidade > 0),
  preco_unitario  NUMERIC(10,2) NOT NULL CHECK (preco_unitario >= 0),
  personalizacao  JSONB                   -- dados do formulário de personalização (nullable)
);

CREATE INDEX idx_itens_pedido_pedido_id ON itens_pedido(pedido_id);

-- ============================================================
-- TABELA: configuracoes
-- Chave-valor para configurações do sistema (admin)
-- ============================================================
CREATE TABLE configuracoes (
  chave      TEXT PRIMARY KEY,
  valor      TEXT NOT NULL,
  descricao  TEXT
);

-- Valores padrão
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('cep_origem',             '',    'CEP de origem para cálculo de frete'),
  ('mp_access_token',        '',    'Access token do Mercado Pago (backend only)'),
  ('melhorenvio_token',      '',    'Token do Melhor Envio (backend only)'),
  ('sla_padrao_estoque',     '1',   'SLA padrão em dias úteis para produtos de estoque'),
  ('sla_padrao_personalizado','5',  'SLA padrão em dias úteis para produtos personalizados'),
  ('loja_nome',              'Cosméticos Artesanais', 'Nome da loja exibido no site'),
  ('loja_email',             '',    'E-mail de contato da loja');

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE produtos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE enderecos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido  ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Produtos: leitura pública apenas para ativos
CREATE POLICY "produtos_leitura_publica"
  ON produtos FOR SELECT
  USING (ativo = true);

-- Produtos: escrita apenas via service_role (backend/admin)
CREATE POLICY "produtos_escrita_admin"
  ON produtos FOR ALL
  USING (auth.role() = 'service_role');

-- Clientes: acesso apenas via service_role
CREATE POLICY "clientes_service_role"
  ON clientes FOR ALL
  USING (auth.role() = 'service_role');

-- Endereços: acesso apenas via service_role
CREATE POLICY "enderecos_service_role"
  ON enderecos FOR ALL
  USING (auth.role() = 'service_role');

-- Pedidos: acesso apenas via service_role
CREATE POLICY "pedidos_service_role"
  ON pedidos FOR ALL
  USING (auth.role() = 'service_role');

-- Itens de pedido: acesso apenas via service_role
CREATE POLICY "itens_pedido_service_role"
  ON itens_pedido FOR ALL
  USING (auth.role() = 'service_role');

-- Configurações: leitura pública (exceto tokens), escrita apenas service_role
CREATE POLICY "configuracoes_leitura_publica"
  ON configuracoes FOR SELECT
  USING (chave NOT IN ('mp_access_token', 'melhorenvio_token'));

CREATE POLICY "configuracoes_escrita_admin"
  ON configuracoes FOR ALL
  USING (auth.role() = 'service_role');
