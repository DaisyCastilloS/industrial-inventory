export interface CustomJWTPayload {
    userId: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
