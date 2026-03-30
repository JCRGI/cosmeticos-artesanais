-- Script para criar bucket de imagens (executar no SQL Editor do Supabase Dashboard)
-- ou via Edge Function/API

INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos-imagens', 'produtos-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de RLS para o bucket
CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'produtos-imagens');

CREATE POLICY "Admin upload to produtos-imagens"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'produtos-imagens' AND auth.role() = 'service_role');
