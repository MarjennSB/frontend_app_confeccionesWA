// ============================================================
// invoice.model.ts
// Modelos de Factura — alineados con ApiInvoiceController
// ============================================================

export type PaymentStatus = 'PENDIENTE' | 'PAGADA' | 'ANULADA';
export type Currency = 'USD' | 'PEN';

export interface Invoice {
  id: number | string;
  production_id?: number | string | null;
  invoice_number: string;
  total_amount: number;
  currency: Currency;
  issue_date: string;
  due_date?: string | null;
  payment_status: PaymentStatus;
  attached_file?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InvoicePagination {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface InvoiceListResponse {
  invoices: { data: Invoice[] };
  pagination: InvoicePagination;
}

export interface CreateInvoiceDto {
  production_id?: number | null;
  invoice_number: string;
  total_amount: number;
  currency?: Currency;
  issue_date: string;
  due_date?: string | null;
  payment_status?: PaymentStatus;
  attached_file?: File | null;  // multipart
  is_active: boolean;
}

export interface UpdateInvoiceDto {
  production_id?: number | null;
  invoice_number: string;
  total_amount: number;
  currency?: Currency;
  issue_date: string;
  due_date?: string | null;
  payment_status?: PaymentStatus;
  attached_file?: File | null;  // multipart opcional
  is_active: boolean;
  _method?: 'PUT';              // method spoofing para multipart
}
