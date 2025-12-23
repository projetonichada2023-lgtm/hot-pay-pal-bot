import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClient } from '@/hooks/useClient';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: client, isLoading: clientLoading } = useClient();
  const navigate = useNavigate();

  const {
    isActive: isOnboardingActive,
    currentStep,
    totalSteps,
    currentTourStep,
    nextStep,
    prevStep,
    skipTour,
  } = useOnboarding(client?.id, client?.onboarding_completed);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || clientLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar client={client} />
      <DashboardContent client={client} />
      <NotificationCenter clientId={client.id} onNavigate={navigate} />
      
      {isOnboardingActive && currentTourStep && (
        <OnboardingTour
          step={currentTourStep}
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
        />
      )}
    </div>
  );
};

export default Dashboard;
