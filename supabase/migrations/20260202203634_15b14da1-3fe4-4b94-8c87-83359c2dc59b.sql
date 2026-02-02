-- ===========================================
-- Correção de Políticas RLS Permissivas
-- ===========================================

-- 1. Remover política permissiva da tabela client_bots
DROP POLICY IF EXISTS "Service role can manage bots" ON public.client_bots;

-- 2. Remover política permissiva da tabela affiliate_commissions
DROP POLICY IF EXISTS "Service role can insert commissions" ON public.affiliate_commissions;

-- 3. Remover política permissiva da tabela facebook_events
DROP POLICY IF EXISTS "Service role can insert Facebook events" ON public.facebook_events;

-- 4. Remover política permissiva da tabela tiktok_events
DROP POLICY IF EXISTS "Service role can insert TikTok events" ON public.tiktok_events;

-- 5. Remover políticas permissivas da tabela ttclid_mappings
DROP POLICY IF EXISTS "Service role can insert mappings" ON public.ttclid_mappings;
DROP POLICY IF EXISTS "Service role can select mappings" ON public.ttclid_mappings;
DROP POLICY IF EXISTS "Service role can update mappings" ON public.ttclid_mappings;

-- 6. Remover política permissiva da tabela notification_templates
DROP POLICY IF EXISTS "Service role can read notification templates" ON public.notification_templates;

-- 7. Criar nova política para notification_templates (apenas usuários autenticados)
CREATE POLICY "Authenticated users can read notification templates"
ON public.notification_templates
FOR SELECT
TO authenticated
USING (true);

-- 8. Criar view pública para client_bots (esconde tokens sensíveis)
CREATE OR REPLACE VIEW public.client_bots_public
WITH (security_invoker = on) AS
SELECT 
  id,
  client_id,
  name,
  telegram_bot_username,
  webhook_configured,
  is_active,
  is_primary,
  created_at,
  updated_at
FROM public.client_bots;