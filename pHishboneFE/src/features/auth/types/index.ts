// ─── Generic API Wrapper ────────────────────────────────────────────────────
export interface ApiResponse<T> {
    statusCode: number;
    errorCode: string | null;
    message: string;
    data: T | null;
}

// ─── Domain Models ───────────────────────────────────────────────────────────
export interface UserDto {
    id: string;
    username: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
}

export interface LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserDto;
}

// ─── Request DTOs ────────────────────────────────────────────────────────────
export interface LoginRequestDto {
    email?: string;
    password?: string;
}

export interface RegisterRequestDto {
    username?: string;
    email?: string;
    password?: string;
}
