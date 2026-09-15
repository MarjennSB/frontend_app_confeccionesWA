// ============================================================
// user.dto.ts
// DTOs para crear y editar usuarios — alineados con ApiUserController
// ============================================================

export interface CreateUserDto {
  document_type_id: number;
  document_number: string;
  name?: string;
  first_name?: string;
  last_name_father?: string;
  last_name_mother?: string;
  gender_id: number;
  email?: string;
  password: string;
  rol_id?: number | null;
  is_active: boolean;
  image_url?: File | null;  // archivo multipart
}

export interface UpdateUserDto {
  document_type_id: number;
  document_number: string;
  name?: string;
  first_name?: string;
  last_name_father?: string;
  last_name_mother?: string;
  gender_id: number;
  email?: string;
  password?: string;           // opcional en update
  rol_id?: number | null;
  is_active: boolean;
  image_url?: File | null;     // archivo multipart (opcional)
}