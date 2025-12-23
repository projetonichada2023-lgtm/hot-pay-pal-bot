import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'new_order' | 'payment_received' | 'order_delivered';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationCounts {
  orders: number;
  chats: number;
}

export const useRealtimeNotifications = (clientId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({ orders: 0, chats: 0 });
  const { toast } = useToast();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    
    // Update counts based on type
    if (notification.type === 'new_order' || notification.type === 'payment_received') {
      setCounts(prev => ({ ...prev, orders: prev.orders + 1 }));
    }
    
    // Show toast
    toast({
      title: notification.title,
      description: notification.message,
    });
  }, [toast]);

  const clearOrdersCount = useCallback(() => {
    setCounts(prev => ({ ...prev, orders: 0 }));
  }, []);

  const clearChatsCount = useCallback(() => {
    setCounts(prev => ({ ...prev, chats: 0 }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setCounts({ orders: 0, chats: 0 });
  }, []);

  useEffect(() => {
    if (!clientId) return;

    // Subscribe to new orders
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const order = payload.new as { id: string; amount: number; status: string };
          addNotification({
            type: 'new_order',
            title: '🛒 Novo Pedido!',
            message: `Novo pedido de ${formatPrice(order.amount)} criado`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const oldOrder = payload.old as { status: string };
          const newOrder = payload.new as { id: string; amount: number; status: string };
          
          // Payment received
          if (oldOrder.status === 'pending' && newOrder.status === 'paid') {
            addNotification({
              type: 'payment_received',
              title: '💰 Pagamento Confirmado!',
              message: `Pagamento de ${formatPrice(newOrder.amount)} recebido`,
            });
          }
          
          // Order delivered
          if (newOrder.status === 'delivered' && oldOrder.status !== 'delivered') {
            addNotification({
              type: 'order_delivered',
              title: '📦 Pedido Entregue!',
              message: `Pedido de ${formatPrice(newOrder.amount)} foi entregue`,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telegram_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const message = payload.new as { direction: string };
          if (message.direction === 'incoming') {
            setCounts(prev => ({ ...prev, chats: prev.chats + 1 }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [clientId, addNotification]);

  return {
    notifications,
    counts,
    clearOrdersCount,
    clearChatsCount,
    markAllAsRead,
  };
};
