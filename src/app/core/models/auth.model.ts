export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles: string[] | any[];
  role_id?: string | number;
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
  expires_in?: number;
}