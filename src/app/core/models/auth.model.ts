export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  role_id?: number;
}

export interface LoginRequestDto {
  email?: string;
  password?: string;
  username?: string;
}

export interface LoginResponseDto {
  access_token: string;
  token_type: string;
  user: CurrentUser;
}
