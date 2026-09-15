// ============================================================
// user.model.ts
// Modelos de Usuario — alineados con UserResource del backend
// ============================================================

import { DocumentType } from './document-type.model';
import { Genre } from './genre.model';
import { Role } from './role.model';

export interface User {
  id: number | string;
  document_type_id?: number | null;
  document_type_name?: string;
  document_number?: string;
  name?: string;
  first_name?: string;
  last_name_father?: string;
  last_name_mother?: string;
  gender_id?: number | null;
  gender_name?: string;
  email: string;
  email_verified_at?: string | null;
  rol_nombre?: string;
  is_active: boolean;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;

  // Relaciones cargadas via with() - opcionales
  documentType?: DocumentType;
  gender?: Genre;
  roles?: Role[];
}

export interface UserPagination {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface UserListResponse {
  usuarios: User[];
  pagination: UserPagination;
}