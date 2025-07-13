import jwt from 'jsonwebtoken';
import { JWTInterface } from '../../02-application/interface/JWTInterface';
import { CustomJWTPayload } from '../../02-application/interface/CustomJWTPayload';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class JWTService implements JWTInterface {
    async generateToken(payload: CustomJWTPayload): Promise<string> {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
    }

    async verifyToken(token: string): Promise<CustomJWTPayload> {
        return jwt.verify(token, JWT_SECRET) as CustomJWTPayload;
    }
}
