// ============================================================
// guide.model.ts
// Modelos de Guía — alineados con ApiGuideController
// ============================================================

export interface Guide {
  id: number | string;
  guide_number: string;
  issue_date?: string | null;
  attached_file: string;        // obligatorio en BD (NOT NULL)
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GuidePagination {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface GuideListResponse {
  guides: { data: Guide[] };
  pagination: GuidePagination;
}

export interface CreateGuideDto {
  guide_number: string;
  issue_date?: string | null;
  attached_file: File;          // obligatorio al crear (required en backend)
  is_active: boolean;
}

export interface UpdateGuideDto {
  guide_number: string;
  issue_date?: string | null;
  attached_file?: File | null;  // opcional al editar
  is_active: boolean;
  _method?: 'PUT';              // method spoofing para multipart
}
