export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface LoginResponseDto {
    access_token: string;
    user: {
        id: string;
        email: string;
        username: string;
        roles: string[];
    }
}
