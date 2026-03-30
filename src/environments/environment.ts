// Variáveis de ambiente — Desenvolvimento
// ATENÇÃO: nunca comitar tokens reais. Use .env ou CI/CD secrets em produção.
export const environment = {
  production: false,
  supabaseUrl: 'https://SEU_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'SUA_SUPABASE_ANON_KEY',
  mercadoPagoPublicKey: 'SUA_MP_PUBLIC_KEY',
  // melhorEnvioToken fica apenas no backend (Edge Function)
};
