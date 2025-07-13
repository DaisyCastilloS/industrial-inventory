import { JWTService } from '../../03-infrastructure/services/JWTService';
import { CustomJWTPayload } from '../../02-application/interface/CustomJWTPayload';

describe('JWTService', () => {
  let jwtService: JWTService;

  beforeEach(() => {
    jwtService = new JWTService();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const payload: CustomJWTPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'USER'
      };

      const token = await jwtService.generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', async () => {
      const payload1: CustomJWTPayload = {
        userId: 1,
        email: 'test1@example.com',
        role: 'USER'
      };

      const payload2: CustomJWTPayload = {
        userId: 2,
        email: 'test2@example.com',
        role: 'ADMIN'
      };

      const token1 = await jwtService.generateToken(payload1);
      const token2 = await jwtService.generateToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', async () => {
      const payload: CustomJWTPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'USER'
      };

      const token = await jwtService.generateToken(payload);
      const verifiedPayload = await jwtService.verifyToken(token);

      expect(verifiedPayload.userId).toBe(payload.userId);
      expect(verifiedPayload.email).toBe(payload.email);
      expect(verifiedPayload.role).toBe(payload.role);
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(jwtService.verifyToken(invalidToken)).rejects.toThrow();
    });
  });
}); 