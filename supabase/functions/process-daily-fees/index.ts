import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ClientWithDebt {
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
    default_payment_method: string;
  };
}

// Calculate days between two dates
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs((date2.getTime() - date1.getTime()) / oneDay));
}

// Check and block delinquent clients
async function checkAndBlockDelinquents(): Promise<{ blocked: number; warned: number }> {
  console.log('Checking for delinquent clients...');
  
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
        max_debt_days,
        default_payment_method
      )
    `)
    .gt('debt_amount', 0)
    .eq('is_blocked', false) as { data: ClientWithDebt[] | null; error: any };

  if (error) {
    console.error('Error fetching delinquents:', error);
    return { blocked: 0, warned: 0 };
  }

  let blockedCount = 0;
  let warnedCount = 0;
  const now = new Date();

  for (const d of delinquents || []) {
    if (!d.debt_started_at) continue;

    const debtStartDate = new Date(d.debt_started_at);
    const daysSinceDebt = daysBetween(debtStartDate, now);
    const maxDays = d.clients.max_debt_days || 3;

    console.log(`Client ${d.clients.business_name}: debt R$ ${d.debt_amount}, ${daysSinceDebt} days, max ${maxDays}`);

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
        console.log(`Blocked client: ${d.clients.business_name}`);
        
        // TODO: Send notification to client about being blocked
      }
    } else if (daysSinceDebt === maxDays - 1) {
      // Warn client they'll be blocked tomorrow
      warnedCount++;
      console.log(`Warning client: ${d.clients.business_name} (will be blocked tomorrow)`);
      
      // TODO: Send warning notification
    }
  }

  return { blocked: blockedCount, warned: warnedCount };
}

// Create daily invoice for a client
async function createDailyInvoice(
  clientId: string, 
  fees: any[], 
  invoiceDate: Date
): Promise<any> {
  const totalFees = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 1); // Due next day

  const { data: invoice, error } = await supabase
    .from('daily_fee_invoices')
    .insert({
      client_id: clientId,
      invoice_date: invoiceDate.toISOString().split('T')[0],
      total_fees: totalFees,
      fees_count: fees.length,
      status: 'pending',
      due_date: dueDate.toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    // Check if invoice already exists for this date
    if (error.code === '23505') {
      console.log(`Invoice already exists for client ${clientId} on ${invoiceDate.toISOString().split('T')[0]}`);
      return null;
    }
    console.error('Error creating invoice:', error);
    return null;
  }

  return invoice;
}

// Process fees for clients with debt
async function processClientFees(): Promise<{ processed: number; invoices: number }> {
  console.log('Processing client fees...');

  // Get yesterday's date for consolidation
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all pending fees from yesterday
  const { data: pendingFees, error } = await supabase
    .from('platform_fees')
    .select('*, clients(business_name, default_payment_method)')
    .eq('status', 'pending')
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString());

  if (error) {
    console.error('Error fetching pending fees:', error);
    return { processed: 0, invoices: 0 };
  }

  // Group fees by client
  const feesByClient = (pendingFees || []).reduce((acc: Record<string, any[]>, fee) => {
    if (!acc[fee.client_id]) {
      acc[fee.client_id] = [];
    }
    acc[fee.client_id].push(fee);
    return acc;
  }, {});

  let processedCount = 0;
  let invoicesCreated = 0;

  for (const [clientId, fees] of Object.entries(feesByClient)) {
    console.log(`Processing ${fees.length} fees for client ${clientId}`);
    
    // Create daily invoice
    const invoice = await createDailyInvoice(clientId, fees, yesterday);
    if (invoice) {
      invoicesCreated++;
      
      // TODO: Generate PIX or charge Stripe based on client preference
      // For now, just log that an invoice was created
      console.log(`Created invoice for client ${clientId}: R$ ${invoice.total_fees}`);
    }

    processedCount += fees.length;
  }

  return { processed: processedCount, invoices: invoicesCreated };
}

// Main handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily fee processing...');
    const startTime = Date.now();

    // Process fees and create invoices
    const { processed, invoices } = await processClientFees();

    // Check and block delinquent clients
    const { blocked, warned } = await checkAndBlockDelinquents();

    const duration = Date.now() - startTime;

    const result = {
      success: true,
      processed_at: new Date().toISOString(),
      duration_ms: duration,
      fees_processed: processed,
      invoices_created: invoices,
      clients_blocked: blocked,
      clients_warned: warned,
    };

    console.log('Daily fee processing complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-daily-fees:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
