import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ClientBot, useClientBots } from '@/hooks/useClientBots';

interface BotContextType {
  selectedBot: ClientBot | null;
  setSelectedBot: (bot: ClientBot | null) => void;
  bots: ClientBot[];
  isLoading: boolean;
  refetch: () => void;
}

const BotContext = createContext<BotContextType | undefined>(undefined);

interface BotProviderProps {
  children: React.ReactNode;
  clientId: string | undefined;
}

export const BotProvider: React.FC<BotProviderProps> = ({ children, clientId }) => {
  const { data: bots = [], isLoading, refetch } = useClientBots(clientId);
  const [selectedBot, setSelectedBotState] = useState<ClientBot | null>(null);

  // Load selected bot from localStorage or use primary bot
  useEffect(() => {
    if (bots.length > 0 && !selectedBot) {
      const storedBotId = localStorage.getItem(`selected_bot_${clientId}`);
      const storedBot = storedBotId ? bots.find(b => b.id === storedBotId) : null;
      
      if (storedBot) {
        setSelectedBotState(storedBot);
      } else {
        // Default to primary bot or first bot
        const primaryBot = bots.find(b => b.is_primary) || bots[0];
        setSelectedBotState(primaryBot);
      }
    }
  }, [bots, clientId, selectedBot]);

  // Update selected bot when bots list changes (e.g., after update)
  useEffect(() => {
    if (selectedBot && bots.length > 0) {
      const updatedBot = bots.find(b => b.id === selectedBot.id);
      if (updatedBot && JSON.stringify(updatedBot) !== JSON.stringify(selectedBot)) {
        setSelectedBotState(updatedBot);
      }
    }
  }, [bots, selectedBot]);

  const setSelectedBot = useCallback((bot: ClientBot | null) => {
    setSelectedBotState(bot);
    if (bot && clientId) {
      localStorage.setItem(`selected_bot_${clientId}`, bot.id);
    }
  }, [clientId]);

  return (
    <BotContext.Provider value={{ 
      selectedBot, 
      setSelectedBot, 
      bots, 
      isLoading,
      refetch
    }}>
      {children}
    </BotContext.Provider>
  );
};

export const useBotContext = () => {
  const context = useContext(BotContext);
  if (context === undefined) {
    throw new Error('useBotContext must be used within a BotProvider');
  }
  return context;
};
