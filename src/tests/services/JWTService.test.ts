/**
 * @fileoverview Pruebas del servicio JWT
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { JWTService } from '../../infrastructure/services/JWTService';
import { TokenPurpose } from '../../shared/constants/TokenPurpose';
import {
  ApplicationError,
  ErrorCode,
} from '../../core/application/error/ApplicationError';

describe('JWTService', () => {
  let jwtService: JWTService;

  beforeEach(() => {
    jwtService = new JWTService();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      const token = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', async () => {
      const payload1 = {
        userId: 1,
        email: 'test1@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      const payload2 = {
        userId: 2,
        email: 'test2@example.com',
        role: 'USER',
        purpose: TokenPurpose.ACCESS,
      };

      const token1 = await jwtService.generateToken(
        payload1,
        TokenPurpose.ACCESS
      );
      const token2 = await jwtService.generateToken(
        payload2,
        TokenPurpose.ACCESS
      );

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with different purposes', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      const accessToken = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );
      const refreshToken = await jwtService.generateToken(
        { ...payload, purpose: TokenPurpose.REFRESH },
        TokenPurpose.REFRESH
      );

      expect(accessToken).not.toBe(refreshToken);
    });

    it('should reject invalid payloads', async () => {
      const invalidPayload = {
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      await expect(
        jwtService.generateToken(invalidPayload as any, TokenPurpose.ACCESS)
      ).rejects.toThrow('Payload del token inválido');
    });

    it('should reject invalid purposes', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      await expect(
        jwtService.generateToken(payload, 'INVALID_PURPOSE' as any)
      ).rejects.toThrow('Propósito de token inválido');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid JWT token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      const token = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );
      const decoded = await jwtService.verifyToken(token, TokenPurpose.ACCESS);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.purpose).toBe(payload.purpose);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should reject an invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(
        jwtService.verifyToken(invalidToken, TokenPurpose.ACCESS)
      ).rejects.toThrow();
    });

    it('should reject a token with wrong purpose', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      const token = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );

      await expect(
        jwtService.verifyToken(token, TokenPurpose.REFRESH)
      ).rejects.toThrow('Propósito del token no coincide');
    });

    it('should reject an expired token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      // Mock Date.now() to simulate token generation in the past
      const realDateNow = Date.now;
      Date.now = jest.fn(() => realDateNow() - 7200000); // 2 hours ago

      const token = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );

      // Restore Date.now
      Date.now = realDateNow;

      await expect(
        jwtService.verifyToken(token, TokenPurpose.ACCESS)
      ).rejects.toThrow('Token expirado');
    });

    it('should reject a revoked token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      const token = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );
      await jwtService.revokeToken(token);

      await expect(
        jwtService.verifyToken(token, TokenPurpose.ACCESS)
      ).rejects.toThrow('Token revocado');
    });
  });

  describe('refreshToken', () => {
    it('should refresh a valid token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.REFRESH,
      };

      const refreshToken = await jwtService.generateToken(
        payload,
        TokenPurpose.REFRESH
      );
      const newAccessToken = await jwtService.refreshToken(refreshToken);

      expect(newAccessToken).toBeDefined();
      expect(typeof newAccessToken).toBe('string');
      expect(newAccessToken.split('.')).toHaveLength(3);

      // El refresh token usado debe ser revocado
      await expect(
        jwtService.verifyToken(refreshToken, TokenPurpose.REFRESH)
      ).rejects.toThrow('Token revocado');
    });

    it('should reject an invalid refresh token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(jwtService.refreshToken(invalidToken)).rejects.toThrow();
    });

    it('should reject a non-refresh token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      const accessToken = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );

      await expect(jwtService.refreshToken(accessToken)).rejects.toThrow(
        'Propósito del token no coincide'
      );
    });

    it('should reject an expired refresh token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.REFRESH,
      };

      // Mock Date.now() to simulate token generation in the past
      const realDateNow = Date.now;
      Date.now = jest.fn(() => realDateNow() - 8 * 24 * 60 * 60 * 1000); // 8 days ago

      const refreshToken = await jwtService.generateToken(
        payload,
        TokenPurpose.REFRESH
      );

      // Restore Date.now
      Date.now = realDateNow;

      await expect(jwtService.refreshToken(refreshToken)).rejects.toThrow('Token expirado');
    });
  });

  describe('revokeToken', () => {
    it('should revoke a valid token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      const token = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );
      await jwtService.revokeToken(token);

      await expect(
        jwtService.verifyToken(token, TokenPurpose.ACCESS)
      ).rejects.toThrow('Token revocado');
    });

    it('should reject an invalid token format', async () => {
      const invalidToken = 'invalid.token';

      await expect(jwtService.revokeToken(invalidToken)).rejects.toThrow(
        'Token inválido'
      );
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired tokens', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      // Mock Date.now() to simulate token generation in the past
      const realDateNow = Date.now;
      Date.now = jest.fn(() => realDateNow() - 7200000); // 2 hours ago

      const token = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );

      // Restore Date.now
      Date.now = realDateNow;

      const isExpired = await jwtService.isTokenExpired(token);
      expect(isExpired).toBe(true);
    });

    it('should return false for valid tokens', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      const token = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );
      const isExpired = await jwtService.isTokenExpired(token);

      expect(isExpired).toBe(false);
    });

    it('should return true for invalid tokens', async () => {
      const invalidToken = 'invalid.token';
      const isExpired = await jwtService.isTokenExpired(invalidToken);

      expect(isExpired).toBe(true);
    });
  });

  describe('getTokenTimeRemaining', () => {
    it('should return remaining time for valid tokens', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      const token = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );
      const timeRemaining = await jwtService.getTokenTimeRemaining(token);

      expect(timeRemaining).toBeGreaterThan(0);
    });

    it('should return 0 for expired tokens', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS,
      };

      // Mock Date.now() to simulate token generation in the past
      const realDateNow = Date.now;
      Date.now = jest.fn(() => realDateNow() - 7200000); // 2 hours ago

      const token = await jwtService.generateToken(
        payload,
        TokenPurpose.ACCESS
      );

      // Restore Date.now
      Date.now = realDateNow;

      const timeRemaining = await jwtService.getTokenTimeRemaining(token);
      expect(timeRemaining).toBe(0);
    });

    it('should return 0 for invalid tokens', async () => {
      const invalidToken = 'invalid.token';
      const timeRemaining =
        await jwtService.getTokenTimeRemaining(invalidToken);

      expect(timeRemaining).toBe(0);
    });
  });
});
