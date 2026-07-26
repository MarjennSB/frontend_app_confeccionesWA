export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role_ids: number[];
  is_active?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role_ids?: number[];
  is_active?: boolean;
}
