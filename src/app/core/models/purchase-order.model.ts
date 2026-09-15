// ============================================================
// purchase-order.model.ts
// Modelos de Orden de Compra — alineados con ApiPurchaseOrderController
// ============================================================

export interface PurchaseOrder {
  id: number | string;
  order_number: string;
  unit_price: number;
  issue_date?: string | null;
  attached_file?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrderPagination {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface PurchaseOrderListResponse {
  purchase_orders: { data: PurchaseOrder[] };
  pagination: PurchaseOrderPagination;
}

export interface CreatePurchaseOrderDto {
  order_number: string;
  unit_price: number;
  issue_date?: string | null;
  attached_file?: File | null;  // multipart
  is_active: boolean;
}

export interface UpdatePurchaseOrderDto {
  order_number: string;
  unit_price: number;
  issue_date?: string | null;
  attached_file?: File | null;  // multipart opcional
  is_active: boolean;
  _method?: 'PUT';              // para method spoofing en multipart
}
