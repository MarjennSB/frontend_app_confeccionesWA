// ============================================================
// auth.model.ts
// Modelos de autenticación — alineados con el backend JWT
// ============================================================

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterRequestDto {
  document_type_id: number;
  document_number: string;
  name: string;
  first_name: string;
  last_name_father: string;
  last_name_mother?: string;
  gender_id: number;
  email: string;
  password: string;
}

export interface RegisterResponseDto {
  mensaje: string;
  usuario: import('./user.model').User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface MeResponseDto {
  estado: boolean;
  mensaje: string;
  usuario: import('./user.model').User;
}