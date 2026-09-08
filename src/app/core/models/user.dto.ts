export interface CreateUserDto {
  first_name?: string;
  last_name?: string;
  username: string;
  email: string;
  password?: string;
  document_number?: string;
  document_type_id?: number | string;
  genre_id?: number | string;
  role_id?: string | number;
  is_active?: boolean;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  password?: string;
  document_number?: string;
  document_type_id?: number | string;
  genre_id?: number | string;
  role_id?: string | number;
  is_active?: boolean;
}