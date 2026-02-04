import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface AdminBalanceRequest {
  action: 'credit' | 'debit' | 'unblock' | 'adjust_fee_rate';
  clientId: string;
  amount?: number;
  feeRate?: number;
  description?: string;
  adminUserId: string;
}

// Verify admin role
async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();

  return !!data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as AdminBalanceRequest;
    const { action, clientId, amount, feeRate, description, adminUserId } = body;

    console.log('Admin balance action:', { action, clientId, amount, feeRate, adminUserId });

    // Verify admin
    if (!adminUserId || !(await isAdmin(adminUserId))) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current balance
    const { data: balance, error: balanceError } = await supabase
      .from('client_balances')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (balanceError) {
      return new Response(JSON.stringify({ error: 'Client balance not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result: any = { success: true };

    switch (action) {
      case 'credit': {
        if (!amount || amount <= 0) {
          return new Response(JSON.stringify({ error: 'Invalid amount' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const currentBalance = Number(balance.balance) || 0;
        const currentDebt = Number(balance.debt_amount) || 0;
        
        let newBalance = currentBalance;
        let newDebt = currentDebt;

        // If there's debt, pay it off first
        if (currentDebt > 0 && amount >= currentDebt) {
          newDebt = 0;
          newBalance = currentBalance + (amount - currentDebt);
        } else if (currentDebt > 0) {
          newDebt = currentDebt - amount;
        } else {
          newBalance = currentBalance + amount;
        }

        await supabase
          .from('client_balances')
          .update({
            balance: newBalance,
            debt_amount: newDebt,
            debt_started_at: newDebt === 0 ? null : balance.debt_started_at,
            is_blocked: newDebt === 0 ? false : balance.is_blocked,
            blocked_at: newDebt === 0 ? null : balance.blocked_at,
          })
          .eq('client_id', clientId);

        await supabase.from('balance_transactions').insert({
          client_id: clientId,
          type: 'credit',
          amount: amount,
          description: description || 'Crédito adicionado pelo admin',
          payment_method: 'admin_adjustment',
        });

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: adminUserId,
          action: 'admin_credit_balance',
          entity_type: 'client_balance',
          entity_id: balance.id,
          old_data: { balance: currentBalance, debt_amount: currentDebt },
          new_data: { balance: newBalance, debt_amount: newDebt, credited: amount },
        });

        result = { success: true, newBalance, newDebt };
        break;
      }

      case 'debit': {
        if (!amount || amount <= 0) {
          return new Response(JSON.stringify({ error: 'Invalid amount' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const currentBalance = Number(balance.balance) || 0;
        const newBalance = Math.max(0, currentBalance - amount);

        await supabase
          .from('client_balances')
          .update({ balance: newBalance })
          .eq('client_id', clientId);

        await supabase.from('balance_transactions').insert({
          client_id: clientId,
          type: 'debit',
          amount: -amount,
          description: description || 'Débito realizado pelo admin',
          payment_method: 'admin_adjustment',
        });

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: adminUserId,
          action: 'admin_debit_balance',
          entity_type: 'client_balance',
          entity_id: balance.id,
          old_data: { balance: currentBalance },
          new_data: { balance: newBalance, debited: amount },
        });

        result = { success: true, newBalance };
        break;
      }

      case 'unblock': {
        if (!balance.is_blocked) {
          return new Response(JSON.stringify({ error: 'Client is not blocked' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await supabase
          .from('client_balances')
          .update({
            is_blocked: false,
            blocked_at: null,
            // Keep debt but reset the start date to give more time
            debt_started_at: new Date().toISOString(),
          })
          .eq('client_id', clientId);

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: adminUserId,
          action: 'admin_unblock_client',
          entity_type: 'client_balance',
          entity_id: balance.id,
          old_data: { is_blocked: true, blocked_at: balance.blocked_at },
          new_data: { is_blocked: false, unblocked_by: adminUserId },
        });

        result = { success: true, message: 'Client unblocked' };
        break;
      }

      case 'adjust_fee_rate': {
        if (feeRate === undefined || feeRate < 0) {
          return new Response(JSON.stringify({ error: 'Invalid fee rate' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get current fee rate
        const { data: client } = await supabase
          .from('clients')
          .select('fee_rate')
          .eq('id', clientId)
          .single();

        const oldFeeRate = client?.fee_rate || 0.70;

        await supabase
          .from('clients')
          .update({ fee_rate: feeRate })
          .eq('id', clientId);

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: adminUserId,
          action: 'admin_adjust_fee_rate',
          entity_type: 'client',
          entity_id: clientId,
          old_data: { fee_rate: oldFeeRate },
          new_data: { fee_rate: feeRate },
        });

        result = { success: true, oldFeeRate, newFeeRate: feeRate };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-balance:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
