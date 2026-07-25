export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface CurrentUser {
    id: string;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    roles: string[];
}

export interface LoginResponseDto {
    access_token: string;
    user: CurrentUser;
}
