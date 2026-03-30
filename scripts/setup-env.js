#!/usr/bin/env node

/**
 * Script para substituir variáveis de ambiente na geração de produção
 * Executa automaticamente durante o build do Vercel
 *
 * Uso: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envTemplate = `// Variáveis de ambiente — Produção
// Configure os valores reais via variáveis de ambiente no Vercel:
//   SUPABASE_URL, SUPABASE_ANON_KEY, MP_PUBLIC_KEY
export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL || 'https://CONFIGURE_SUPABASE_URL.supabase.co'}',
  supabaseAnonKey: '${process.env.SUPABASE_ANON_KEY || 'CONFIGURE_SUPABASE_ANON_KEY'}',
  mercadoPagoPublicKey: '${process.env.MP_PUBLIC_KEY || 'CONFIGURE_MP_PUBLIC_KEY'}',
};
`;

const outputPath = path.join(__dirname, '../src/environments/environment.prod.ts');

try {
  fs.writeFileSync(outputPath, envTemplate, 'utf-8');
  console.log('✓ Environment variables substituídas em src/environments/environment.prod.ts');
  process.exit(0);
} catch (error) {
  console.error('✗ Erro ao gerar arquivo de ambiente:', error.message);
  process.exit(1);
}
