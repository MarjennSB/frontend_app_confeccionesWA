// ============================================================
// color.model.ts
// Modelos de Color — alineados con ApiColorController
// ============================================================

export interface Color {
  id: number | string;
  name: string;
  abbreviation: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ColorPagination {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface ColorListResponse {
  colores: { data: Color[] };
  pagination: ColorPagination;
}

export interface CreateColorDto {
  name: string;
  abbreviation: string;
  is_active: boolean;
}

export interface UpdateColorDto {
  name: string;
  abbreviation: string;
  is_active: boolean;
}
