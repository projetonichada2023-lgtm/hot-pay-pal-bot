import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="sidebar-logo"]',
    title: 'Bem-vindo ao TeleGateway! 🚀',
    content: 'Esta é sua central de vendas no Telegram. Vamos fazer um tour rápido para você conhecer tudo!',
    position: 'right',
  },
  {
    id: 'stats',
    target: '[data-tour="stats-cards"]',
    title: 'Suas Métricas',
    content: 'Acompanhe vendas, pedidos, clientes e taxa de conversão em tempo real.',
    position: 'bottom',
  },
  {
    id: 'chart',
    target: '[data-tour="sales-chart"]',
    title: 'Análise de Vendas',
    content: 'Visualize a performance das suas vendas ao longo do tempo com gráficos detalhados.',
    position: 'top',
  },
  {
    id: 'products',
    target: '[data-tour="menu-products"]',
    title: 'Cadastre Produtos',
    content: 'Adicione seus produtos digitais para vender diretamente pelo Telegram.',
    position: 'right',
  },
  {
    id: 'bot-config',
    target: '[data-tour="menu-bot-config"]',
    title: 'Configure seu Bot',
    content: 'Conecte seu bot do Telegram para começar a receber pedidos automaticamente.',
    position: 'right',
  },
  {
    id: 'messages',
    target: '[data-tour="menu-messages"]',
    title: 'Personalize suas Mensagens ✉️',
    content: 'Customize todas as mensagens que seu bot envia: boas-vindas, confirmações de pedido, pagamentos e muito mais!',
    position: 'right',
  },
  {
    id: 'funnel',
    target: '[data-tour="menu-funnel"]',
    title: 'Monte seu Funil',
    content: 'Configure upsells e downsells para aumentar o ticket médio das suas vendas.',
    position: 'right',
  },
  {
    id: 'recovery',
    target: '[data-tour="menu-recovery"]',
    title: 'Recuperação de Carrinho 🛒',
    content: 'Recupere vendas perdidas com mensagens automáticas para clientes que abandonaram o pagamento.',
    position: 'right',
  },
  {
    id: 'notifications',
    target: '[data-tour="notifications"]',
    title: 'Fique Informado',
    content: 'Receba alertas de novos pedidos e pagamentos em tempo real! 🔔',
    position: 'left',
  },
];

export const useOnboarding = (clientId: string | undefined, onboardingCompleted: boolean | undefined) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const queryClient = useQueryClient();

  // Start tour if not completed
  useEffect(() => {
    if (clientId && onboardingCompleted === false) {
      // Small delay to ensure DOM elements are mounted
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [clientId, onboardingCompleted]);

  const completeOnboarding = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('clients')
        .update({ onboarding_completed: true })
        .eq('id', clientId!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
  });

  const resetOnboarding = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('clients')
        .update({ onboarding_completed: false })
        .eq('id', clientId!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client'] });
      setCurrentStep(0);
      setIsActive(true);
    },
  });

  const nextStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsActive(false);
      completeOnboarding.mutate();
    }
  }, [currentStep, completeOnboarding]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    completeOnboarding.mutate();
  }, [completeOnboarding]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  return {
    currentStep,
    isActive,
    totalSteps: tourSteps.length,
    currentTourStep: tourSteps[currentStep],
    nextStep,
    prevStep,
    skipTour,
    startTour,
    resetOnboarding: resetOnboarding.mutate,
    isResetting: resetOnboarding.isPending,
  };
};
