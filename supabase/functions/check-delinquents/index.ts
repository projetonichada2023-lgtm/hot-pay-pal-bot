import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface DelinquentClient {
  id: string;
  client_id: string;
  debt_amount: number;
  debt_started_at: string | null;
  is_blocked: boolean;
  clients: {
    id: string;
    business_name: string;
    business_email: string | null;
    max_debt_days: number;
  };
}

// Calculate days between two dates
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs((date2.getTime() - date1.getTime()) / oneDay));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting delinquent check...');
    const startTime = Date.now();

    // Get all clients with debt that are not yet blocked
    const { data: delinquents, error } = await supabase
      .from('client_balances')
      .select(`
        id,
        client_id,
        debt_amount,
        debt_started_at,
        is_blocked,
        clients!inner(
          id,
          business_name,
          business_email,
          max_debt_days
        )
      `)
      .gt('debt_amount', 0)
      .eq('is_blocked', false) as { data: DelinquentClient[] | null; error: any };

    if (error) {
      console.error('Error fetching delinquents:', error);
      throw error;
    }

    const now = new Date();
    let blockedCount = 0;
    let warnedCount = 0;
    const blockedClients: string[] = [];
    const warnedClients: string[] = [];

    for (const d of delinquents || []) {
      if (!d.debt_started_at) {
        // If no debt start date, set it now
        await supabase
          .from('client_balances')
          .update({ debt_started_at: now.toISOString() })
          .eq('id', d.id);
        continue;
      }

      const debtStartDate = new Date(d.debt_started_at);
      const daysSinceDebt = daysBetween(debtStartDate, now);
      const maxDays = d.clients.max_debt_days || 3;

      console.log(`Client "${d.clients.business_name}": R$ ${d.debt_amount} debt, ${daysSinceDebt}/${maxDays} days`);

      if (daysSinceDebt >= maxDays) {
        // Block the client
        const { error: blockError } = await supabase
          .from('client_balances')
          .update({
            is_blocked: true,
            blocked_at: now.toISOString(),
          })
          .eq('id', d.id);

        if (!blockError) {
          blockedCount++;
          blockedClients.push(d.clients.business_name);
          console.log(`✗ BLOCKED: ${d.clients.business_name}`);

          // Send push notification to client about being blocked
          try {
            await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                clientId: d.client_id,
                title: '⚠️ Bot Suspenso',
                body: `Seu bot foi suspenso por inadimplência. Dívida: R$ ${Number(d.debt_amount).toFixed(2)}. Regularize para reativar.`,
                url: '/dashboard/balance',
              }),
            });
          } catch (pushError) {
            console.error('Error sending block notification:', pushError);
          }
        } else {
          console.error('Error blocking client:', blockError);
        }
      } else if (daysSinceDebt === maxDays - 1) {
        // Warn client - they'll be blocked tomorrow
        warnedCount++;
        warnedClients.push(d.clients.business_name);
        console.log(`⚠ WARNING: ${d.clients.business_name} (will be blocked tomorrow)`);

        // Send warning push notification
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              clientId: d.client_id,
              title: '⚠️ Último Aviso - Suspensão Amanhã',
              body: `Seu bot será suspenso amanhã se a dívida de R$ ${Number(d.debt_amount).toFixed(2)} não for paga.`,
              url: '/dashboard/balance',
            }),
          });
        } catch (pushError) {
          console.error('Error sending warning notification:', pushError);
        }
      }
    }

    const duration = Date.now() - startTime;

    const result = {
      success: true,
      checked_at: now.toISOString(),
      duration_ms: duration,
      total_checked: delinquents?.length || 0,
      clients_blocked: blockedCount,
      clients_warned: warnedCount,
      blocked: blockedClients,
      warned: warnedClients,
    };

    console.log('Delinquent check complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in check-delinquents:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
