import { useState } from 'react';
import { useClientSettings, useUpdateClientSettings } from '@/hooks/useClient';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface TrackingTestResult {
  success: boolean;
  error?: string;
  tiktok_response?: {
    message?: string;
    code?: number;
  };
  facebook_response?: Record<string, unknown>;
}

export interface TrackingSettings {
  // TikTok
  tiktok_pixel_code: string | null;
  tiktok_access_token: string | null;
  tiktok_tracking_enabled: boolean;
  tiktok_test_event_code: string | null;
  // Facebook
  facebook_pixel_id: string | null;
  facebook_access_token: string | null;
  facebook_tracking_enabled: boolean;
  facebook_test_event_code: string | null;
}

export const useTrackingSettings = (clientId: string) => {
  const { data: rawSettings, isLoading } = useClientSettings(clientId);
  const updateSettings = useUpdateClientSettings();
  const { toast } = useToast();

  // TikTok state
  const [tiktokPixelCode, setTiktokPixelCode] = useState('');
  const [tiktokAccessToken, setTiktokAccessToken] = useState('');
  const [tiktokTestEventCode, setTiktokTestEventCode] = useState('');
  const [showTiktokToken, setShowTiktokToken] = useState(false);
  const [isTiktokTesting, setIsTiktokTesting] = useState(false);
  const [tiktokTestResult, setTiktokTestResult] = useState<TrackingTestResult | null>(null);

  // Facebook state
  const [facebookPixelId, setFacebookPixelId] = useState('');
  const [facebookAccessToken, setFacebookAccessToken] = useState('');
  const [facebookTestEventCode, setFacebookTestEventCode] = useState('');
  const [showFacebookToken, setShowFacebookToken] = useState(false);
  const [isFacebookTesting, setIsFacebookTesting] = useState(false);
  const [facebookTestResult, setFacebookTestResult] = useState<TrackingTestResult | null>(null);

  // Type-safe settings accessor
  const settings = rawSettings as (typeof rawSettings & TrackingSettings) | undefined;

  // Computed values
  const hasTikTokConfig = !!(settings?.tiktok_pixel_code && settings?.tiktok_access_token);
  const tiktokEnabled = settings?.tiktok_tracking_enabled ?? false;
  const hasFacebookConfig = !!(settings?.facebook_pixel_id && settings?.facebook_access_token);
  const facebookEnabled = settings?.facebook_tracking_enabled ?? false;

  // TikTok handlers
  const handleSaveTikTokConfig = async () => {
    if (!settings || (!tiktokPixelCode.trim() && !tiktokAccessToken.trim())) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        tiktok_pixel_code: tiktokPixelCode.trim() || settings.tiktok_pixel_code,
        tiktok_access_token: tiktokAccessToken.trim() || settings.tiktok_access_token,
        tiktok_tracking_enabled: true,
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
      toast({ title: 'Configurações TikTok salvas!' });
      setTiktokPixelCode('');
      setTiktokAccessToken('');
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleToggleTikTokTracking = async (enabled: boolean) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        tiktok_tracking_enabled: enabled,
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
      toast({ title: enabled ? 'Tracking TikTok ativado!' : 'Tracking TikTok desativado!' });
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleDisconnectTikTok = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        tiktok_pixel_code: null,
        tiktok_access_token: null,
        tiktok_tracking_enabled: false,
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
      toast({ title: 'TikTok desconectado!' });
    } catch {
      toast({ title: 'Erro ao desconectar', variant: 'destructive' });
    }
  };

  const handleSaveTikTokTestCode = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        tiktok_test_event_code: tiktokTestEventCode.trim() || null,
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
      toast({
        title: tiktokTestEventCode.trim() ? 'Modo teste ativado!' : 'Modo produção ativado!',
      });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleRemoveTikTokTestCode = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        tiktok_test_event_code: null,
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
      setTiktokTestEventCode('');
      toast({ title: 'Modo produção ativado!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleTestTikTokEvent = async () => {
    setIsTiktokTesting(true);
    setTiktokTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('test-tiktok-event');
      if (error) {
        setTiktokTestResult({ success: false, error: error.message });
        toast({ title: 'Erro ao testar', description: error.message, variant: 'destructive' });
      } else {
        setTiktokTestResult(data);
        if (data.success) {
          toast({ title: 'Evento de teste enviado!', description: 'Verifique no TikTok Events Manager' });
        } else {
          toast({
            title: 'TikTok retornou erro',
            description: data.tiktok_response?.message || 'Verifique as credenciais',
            variant: 'destructive',
          });
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setTiktokTestResult({ success: false, error: message });
      toast({ title: 'Erro ao testar', variant: 'destructive' });
    } finally {
      setIsTiktokTesting(false);
    }
  };

  // Facebook handlers
  const handleSaveFacebookConfig = async () => {
    if (!settings || (!facebookPixelId.trim() && !facebookAccessToken.trim())) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        facebook_pixel_id: facebookPixelId.trim() || settings.facebook_pixel_id,
        facebook_access_token: facebookAccessToken.trim() || settings.facebook_access_token,
        facebook_tracking_enabled: true,
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
      toast({ title: 'Configurações Facebook salvas!' });
      setFacebookPixelId('');
      setFacebookAccessToken('');
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleToggleFacebookTracking = async (enabled: boolean) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        facebook_tracking_enabled: enabled,
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
      toast({ title: enabled ? 'Tracking Facebook ativado!' : 'Tracking Facebook desativado!' });
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleDisconnectFacebook = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        facebook_pixel_id: null,
        facebook_access_token: null,
        facebook_tracking_enabled: false,
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
      toast({ title: 'Facebook desconectado!' });
    } catch {
      toast({ title: 'Erro ao desconectar', variant: 'destructive' });
    }
  };

  const handleSaveFacebookTestCode = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        facebook_test_event_code: facebookTestEventCode.trim() || null,
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
      toast({
        title: facebookTestEventCode.trim() ? 'Modo teste ativado!' : 'Modo produção ativado!',
      });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleRemoveFacebookTestCode = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        facebook_test_event_code: null,
      } as Parameters<typeof updateSettings.mutateAsync>[0]);
      setFacebookTestEventCode('');
      toast({ title: 'Modo produção ativado!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleTestFacebookEvent = async () => {
    setIsFacebookTesting(true);
    setFacebookTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('test-facebook-event');
      if (error) {
        setFacebookTestResult({ success: false, error: error.message });
        toast({ title: 'Erro ao testar', description: error.message, variant: 'destructive' });
      } else {
        setFacebookTestResult(data);
        if (data.success) {
          toast({ title: 'Evento de teste enviado!', description: 'Verifique no Facebook Events Manager' });
        } else {
          toast({
            title: 'Facebook retornou erro',
            description: data.error || 'Verifique as credenciais',
            variant: 'destructive',
          });
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setFacebookTestResult({ success: false, error: message });
      toast({ title: 'Erro ao testar', variant: 'destructive' });
    } finally {
      setIsFacebookTesting(false);
    }
  };

  return {
    // State
    isLoading,
    settings,
    // TikTok
    hasTikTokConfig,
    tiktokEnabled,
    tiktokPixelCode,
    setTiktokPixelCode,
    tiktokAccessToken,
    setTiktokAccessToken,
    tiktokTestEventCode,
    setTiktokTestEventCode,
    showTiktokToken,
    setShowTiktokToken,
    isTiktokTesting,
    tiktokTestResult,
    handleSaveTikTokConfig,
    handleToggleTikTokTracking,
    handleDisconnectTikTok,
    handleSaveTikTokTestCode,
    handleRemoveTikTokTestCode,
    handleTestTikTokEvent,
    // Facebook
    hasFacebookConfig,
    facebookEnabled,
    facebookPixelId,
    setFacebookPixelId,
    facebookAccessToken,
    setFacebookAccessToken,
    facebookTestEventCode,
    setFacebookTestEventCode,
    showFacebookToken,
    setShowFacebookToken,
    isFacebookTesting,
    facebookTestResult,
    handleSaveFacebookConfig,
    handleToggleFacebookTracking,
    handleDisconnectFacebook,
    handleSaveFacebookTestCode,
    handleRemoveFacebookTestCode,
    handleTestFacebookEvent,
  };
};
