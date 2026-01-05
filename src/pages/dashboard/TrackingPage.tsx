import { Client } from '@/hooks/useClient';
import { TikTokEventsHistory } from '@/components/settings/TikTokEventsHistory';
import { FacebookEventsHistory } from '@/components/settings/FacebookEventsHistory';
import { TikTokTrackingCard } from '@/components/tracking/TikTokTrackingCard';
import { FacebookTrackingCard } from '@/components/tracking/FacebookTrackingCard';
import { useTrackingSettings } from '@/hooks/useTrackingSettings';
import { Loader2, BarChart3 } from 'lucide-react';

interface TrackingPageProps {
  client: Client;
}

export const TrackingPage = ({ client }: TrackingPageProps) => {
  const tracking = useTrackingSettings(client.id);

  if (tracking.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tracking.settings) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Tracking & Conversões
        </h1>
        <p className="text-muted-foreground">
          Configure o rastreamento de conversões do TikTok e Facebook Ads
        </p>
      </div>

      {/* TikTok Ads Card */}
      <TikTokTrackingCard
        botUsername={client.telegram_bot_username}
        hasTikTokConfig={tracking.hasTikTokConfig}
        tiktokEnabled={tracking.tiktokEnabled}
        settings={tracking.settings}
        tiktokPixelCode={tracking.tiktokPixelCode}
        setTiktokPixelCode={tracking.setTiktokPixelCode}
        tiktokAccessToken={tracking.tiktokAccessToken}
        setTiktokAccessToken={tracking.setTiktokAccessToken}
        tiktokTestEventCode={tracking.tiktokTestEventCode}
        setTiktokTestEventCode={tracking.setTiktokTestEventCode}
        showTiktokToken={tracking.showTiktokToken}
        setShowTiktokToken={tracking.setShowTiktokToken}
        isTiktokTesting={tracking.isTiktokTesting}
        tiktokTestResult={tracking.tiktokTestResult}
        handleSaveTikTokConfig={tracking.handleSaveTikTokConfig}
        handleToggleTikTokTracking={tracking.handleToggleTikTokTracking}
        handleDisconnectTikTok={tracking.handleDisconnectTikTok}
        handleSaveTikTokTestCode={tracking.handleSaveTikTokTestCode}
        handleRemoveTikTokTestCode={tracking.handleRemoveTikTokTestCode}
        handleTestTikTokEvent={tracking.handleTestTikTokEvent}
      />

      {/* TikTok Events History */}
      {tracking.hasTikTokConfig && <TikTokEventsHistory clientId={client.id} />}

      {/* Facebook Ads Card */}
      <FacebookTrackingCard
        botUsername={client.telegram_bot_username}
        hasFacebookConfig={tracking.hasFacebookConfig}
        facebookEnabled={tracking.facebookEnabled}
        settings={tracking.settings}
        facebookPixelId={tracking.facebookPixelId}
        setFacebookPixelId={tracking.setFacebookPixelId}
        facebookAccessToken={tracking.facebookAccessToken}
        setFacebookAccessToken={tracking.setFacebookAccessToken}
        facebookTestEventCode={tracking.facebookTestEventCode}
        setFacebookTestEventCode={tracking.setFacebookTestEventCode}
        showFacebookToken={tracking.showFacebookToken}
        setShowFacebookToken={tracking.setShowFacebookToken}
        isFacebookTesting={tracking.isFacebookTesting}
        facebookTestResult={tracking.facebookTestResult}
        handleSaveFacebookConfig={tracking.handleSaveFacebookConfig}
        handleToggleFacebookTracking={tracking.handleToggleFacebookTracking}
        handleDisconnectFacebook={tracking.handleDisconnectFacebook}
        handleSaveFacebookTestCode={tracking.handleSaveFacebookTestCode}
        handleRemoveFacebookTestCode={tracking.handleRemoveFacebookTestCode}
        handleTestFacebookEvent={tracking.handleTestFacebookEvent}
      />

      {/* Facebook Events History */}
      {tracking.hasFacebookConfig && <FacebookEventsHistory clientId={client.id} />}
    </div>
  );
};
