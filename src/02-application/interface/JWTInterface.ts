import { CustomJWTPayload } from './CustomJWTPayload';

export interface JWTInterface {
    generateToken(payload: CustomJWTPayload): Promise<string>;
    verifyToken(token: string): Promise<CustomJWTPayload>;
}
