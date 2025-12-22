import { Client } from '@/hooks/useClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Users, DollarSign, Bot } from 'lucide-react';

interface OverviewPageProps {
  client: Client;
}

export const OverviewPage = ({ client }: OverviewPageProps) => {
  const stats = [
    { 
      label: 'Vendas Hoje', 
      value: 'R$ 0,00', 
      change: '+0%', 
      icon: DollarSign,
      color: 'text-success'
    },
    { 
      label: 'Pedidos', 
      value: '0', 
      change: '+0%', 
      icon: ShoppingCart,
      color: 'text-primary'
    },
    { 
      label: 'Clientes', 
      value: '0', 
      change: '+0%', 
      icon: Users,
      color: 'text-telegram'
    },
    { 
      label: 'Taxa de Conversão', 
      value: '0%', 
      change: '+0%', 
      icon: TrendingUp,
      color: 'text-warning'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo, {client.business_name}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${client.webhook_configured ? 'bg-success' : 'bg-warning'}`} />
          <span className="text-muted-foreground">
            Bot {client.webhook_configured ? 'Ativo' : 'Pendente'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass-card hover-scale">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-success">{stat.change} vs ontem</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      {!client.telegram_bot_token && (
        <Card className="glass-card border-warning/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Configure seu Bot</CardTitle>
                <CardDescription>
                  Para começar a vender, configure seu bot do Telegram
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Acesse <strong>Bot Config</strong> no menu lateral para adicionar seu token do Telegram e configurar o webhook.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
