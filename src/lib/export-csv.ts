import { format } from 'date-fns';

interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | null | undefined);
}

export const exportToCSV = <T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
) => {
  if (data.length === 0) return;

  // Build headers
  const headers = columns.map((col) => col.header).join(',');

  // Build rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value =
          typeof col.accessor === 'function'
            ? col.accessor(item)
            : item[col.accessor];

        // Handle null/undefined
        if (value === null || value === undefined) return '';

        // Handle strings with commas or quotes
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      })
      .join(',')
  );

  // Combine and download
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Pre-configured export functions
export const exportOrders = (orders: Array<{
  id: string;
  status: string;
  amount: number;
  created_at: string | null;
  products?: { name: string } | null;
  telegram_customers?: {
    first_name: string | null;
    last_name: string | null;
    telegram_username: string | null;
  } | null;
}>) => {
  exportToCSV(
    orders,
    [
      { header: 'ID', accessor: (o) => o.id.slice(0, 8) },
      { header: 'Status', accessor: 'status' },
      {
        header: 'Cliente',
        accessor: (o) =>
          [o.telegram_customers?.first_name, o.telegram_customers?.last_name]
            .filter(Boolean)
            .join(' ') || 'Desconhecido',
      },
      { header: 'Telegram', accessor: (o) => o.telegram_customers?.telegram_username || '' },
      { header: 'Produto', accessor: (o) => o.products?.name || 'Removido' },
      { header: 'Valor', accessor: (o) => Number(o.amount).toFixed(2) },
      {
        header: 'Data',
        accessor: (o) => (o.created_at ? format(new Date(o.created_at), 'dd/MM/yyyy HH:mm') : ''),
      },
    ],
    'pedidos'
  );
};

export const exportCustomers = (customers: Array<{
  id: string;
  first_name: string | null;
  last_name: string | null;
  telegram_username: string | null;
  telegram_id: string | number;
  email: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string | null;
  last_order_date: string | null;
}>) => {
  exportToCSV(
    customers,
    [
      {
        header: 'Nome',
        accessor: (c) => [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Sem nome',
      },
      { header: 'Telegram', accessor: (c) => c.telegram_username || c.telegram_id },
      { header: 'Email', accessor: (c) => c.email || '' },
      { header: 'Total Pedidos', accessor: 'total_orders' },
      { header: 'Total Gasto', accessor: (c) => c.total_spent.toFixed(2) },
      {
        header: 'Último Pedido',
        accessor: (c) => (c.last_order_date ? format(new Date(c.last_order_date), 'dd/MM/yyyy') : ''),
      },
      {
        header: 'Cadastro',
        accessor: (c) => (c.created_at ? format(new Date(c.created_at), 'dd/MM/yyyy') : ''),
      },
    ],
    'clientes'
  );
};

export const exportProducts = (products: Array<{
  id: string;
  name: string;
  price: number;
  is_active: boolean;
  sales_count: number | null;
  views_count: number | null;
  created_at: string | null;
}>) => {
  exportToCSV(
    products,
    [
      { header: 'Nome', accessor: 'name' },
      { header: 'Preço', accessor: (p) => Number(p.price).toFixed(2) },
      { header: 'Status', accessor: (p) => (p.is_active ? 'Ativo' : 'Inativo') },
      { header: 'Vendas', accessor: (p) => p.sales_count || 0 },
      { header: 'Views', accessor: (p) => p.views_count || 0 },
      {
        header: 'Criado em',
        accessor: (p) => (p.created_at ? format(new Date(p.created_at), 'dd/MM/yyyy') : ''),
      },
    ],
    'produtos'
  );
};

export const exportTrackingEvents = (events: Array<{
  id: string;
  event_type: string;
  event_id: string;
  value: number | null;
  utm_campaign: string | null;
  api_status: string | null;
  created_at: string;
}>, platform: 'tiktok' | 'facebook') => {
  exportToCSV(
    events,
    [
      { header: 'Tipo', accessor: 'event_type' },
      { header: 'ID Evento', accessor: (e) => e.event_id.slice(0, 12) },
      { header: 'Valor', accessor: (e) => (e.value ? e.value.toFixed(2) : '') },
      { header: 'Campanha', accessor: (e) => e.utm_campaign || '' },
      {
        header: 'Status',
        accessor: (e) =>
          e.api_status === 'success' ? 'Sucesso' : e.api_status === 'error' ? 'Erro' : 'Pendente',
      },
      { header: 'Data', accessor: (e) => format(new Date(e.created_at), 'dd/MM/yyyy HH:mm:ss') },
    ],
    `eventos_${platform}`
  );
};
