-- Configurar senha padrão do admin
-- Senha padrão: admin123 (MUDE ISSO EM PRODUÇÃO!)

INSERT INTO configuracoes (chave, valor, descricao)
VALUES ('admin_senha', 'admin123', 'Senha do painel administrativo')
ON CONFLICT (chave) DO UPDATE SET valor = 'admin123';
