// ============================================================
// production.model.ts
// Modelos de Producción — alineados con ApiProductionController
// ============================================================

import { Color } from './color.model';
import { Guide } from './guide.model';

export interface Production {
  id: number | string;
  user_id: number | string;
  user_name?: string;
  quantity: number;
  unit_price: number;
  purchase_order_number: string;
  production_order_number: string;
  purchase_order_id: number | string;
  production_date: string;
  is_active: boolean;
  colors?: Color[];
  guides?: Guide[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductionPagination {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface ProductionListResponse {
  productions: { data: Production[] };
  pagination: ProductionPagination;
}

export interface CreateProductionDto {
  user_id: number;
  quantity: number;
  unit_price: number;
  purchase_order_number: string;
  production_order_number: string;
  purchase_order_id: number;
  colors: number[];
  guides?: number[];
  is_active: boolean;
}

export interface UpdateProductionDto {
  user_id: number;
  quantity: number;
  unit_price: number;
  purchase_order_number: string;
  production_order_number: string;
  purchase_order_id: number;
  colors: number[];
  guides?: number[];
  is_active: boolean;
}
