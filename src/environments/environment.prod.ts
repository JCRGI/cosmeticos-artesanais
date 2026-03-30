// Variáveis de ambiente — Produção
// Configure os valores reais via variáveis de ambiente no Vercel:
//   SUPABASE_URL, SUPABASE_ANON_KEY, MP_PUBLIC_KEY
export const environment = {
  production: true,
  supabaseUrl: '%%SUPABASE_URL%%',
  supabaseAnonKey: '%%SUPABASE_ANON_KEY%%',
  mercadoPagoPublicKey: '%%MP_PUBLIC_KEY%%',
};
