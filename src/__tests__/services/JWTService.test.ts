import { JWTService } from '../../03-infrastructure/services/JWTService';
import { TokenPurpose } from '../../00-constants/TokenPurpose';

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
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', async () => {
      const payload1 = {
        userId: 1,
        email: 'test1@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const payload2 = {
        userId: 2,
        email: 'test2@example.com',
        role: 'USER',
        purpose: TokenPurpose.ACCESS
      };

      const token1 = await jwtService.generateToken(payload1, TokenPurpose.ACCESS);
      const token2 = await jwtService.generateToken(payload2, TokenPurpose.ACCESS);

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with different purposes', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const accessToken = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      const refreshToken = await jwtService.generateToken({ ...payload, purpose: TokenPurpose.REFRESH }, TokenPurpose.REFRESH);

      expect(accessToken).not.toBe(refreshToken);
    });

    it('should generate tokens with different user IDs', async () => {
      const payload1 = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const payload2 = {
        userId: 999,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token1 = await jwtService.generateToken(payload1, TokenPurpose.ACCESS);
      const token2 = await jwtService.generateToken(payload2, TokenPurpose.ACCESS);

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with different roles', async () => {
      const payload1 = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const payload2 = {
        userId: 1,
        email: 'test@example.com',
        role: 'USER',
        purpose: TokenPurpose.ACCESS
      };

      const token1 = await jwtService.generateToken(payload1, TokenPurpose.ACCESS);
      const token2 = await jwtService.generateToken(payload2, TokenPurpose.ACCESS);

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with different emails', async () => {
      const payload1 = {
        userId: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const payload2 = {
        userId: 1,
        email: 'user@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token1 = await jwtService.generateToken(payload1, TokenPurpose.ACCESS);
      const token2 = await jwtService.generateToken(payload2, TokenPurpose.ACCESS);

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens for all valid purposes', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const purposes = [
        TokenPurpose.ACCESS,
        TokenPurpose.REFRESH,
        TokenPurpose.RESET_PASSWORD,
        TokenPurpose.VERIFY_EMAIL
      ];

      const tokens = await Promise.all(
        purposes.map(purpose => jwtService.generateToken(payload, purpose))
      );

      // All tokens should be different
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(purposes.length);

      // All tokens should be valid JWT format
      tokens.forEach(token => {
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);
      });
    });

    it('should handle special characters in email', async () => {
      const payload = {
        userId: 1,
        email: 'test+special.chars@example-domain.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should handle numeric user IDs correctly', async () => {
      const testUserIds = [0, 1, 999, 1000000, Number.MAX_SAFE_INTEGER];

      for (const userId of testUserIds) {
        const payload = {
          userId,
          email: 'test@example.com',
          role: 'ADMIN',
          purpose: TokenPurpose.ACCESS
        };

        const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);
      }
    });

    it('should handle all valid roles', async () => {
      const validRoles = ['ADMIN', 'USER', 'VIEWER'];

      for (const role of validRoles) {
        const payload = {
          userId: 1,
          email: 'test@example.com',
          role,
          purpose: TokenPurpose.ACCESS
        };

        const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);
      }
    });

    it('should generate tokens with consistent timestamp format', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token1 = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      
      // Wait a moment to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const token2 = await jwtService.generateToken(payload, TokenPurpose.ACCESS);

      expect(token1).not.toBe(token2); // Should be different due to timestamp
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid JWT token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      const decoded = await jwtService.verifyToken(token, TokenPurpose.ACCESS);

      expect(decoded.userId).toBe(1);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('ADMIN');
      expect(decoded.purpose).toBe(TokenPurpose.ACCESS);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(jwtService.verifyToken(invalidToken, TokenPurpose.ACCESS))
        .rejects.toThrow('Error al verificar token JWT');
    });

    it('should throw error for token with wrong purpose', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);

      await expect(jwtService.verifyToken(token, TokenPurpose.REFRESH))
        .rejects.toThrow('Error al verificar token JWT');
    });

    it('should throw error for malformed token', async () => {
      const malformedTokens = [
        'not.a.jwt',
        'only.two.parts',
        'too.many.parts.here.invalid',
        '',
        'invalid',
        'header.payload', // Missing signature
        '.payload.signature', // Missing header
        'header..signature', // Missing payload
      ];

      for (const malformedToken of malformedTokens) {
        await expect(jwtService.verifyToken(malformedToken, TokenPurpose.ACCESS))
          .rejects.toThrow('Error al verificar token JWT');
      }
    });

    it('should throw error for token with invalid signature', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      const parts = token.split('.');
      const tamperedToken = parts[0] + '.' + parts[1] + '.tampered_signature';

      await expect(jwtService.verifyToken(tamperedToken, TokenPurpose.ACCESS))
        .rejects.toThrow('Error al verificar token JWT');
    });

    it('should verify tokens for all valid purposes', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const purposes = [
        TokenPurpose.ACCESS,
        TokenPurpose.REFRESH,
        TokenPurpose.RESET_PASSWORD,
        TokenPurpose.VERIFY_EMAIL
      ];

      for (const purpose of purposes) {
        const token = await jwtService.generateToken(payload, purpose);
        const decoded = await jwtService.verifyToken(token, purpose);

        expect(decoded.userId).toBe(1);
        expect(decoded.email).toBe('test@example.com');
        expect(decoded.role).toBe('ADMIN');
        expect(decoded.purpose).toBe(purpose);
      }
    });

    it('should handle revoked tokens', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      
      // Verify token works initially
      const decoded = await jwtService.verifyToken(token, TokenPurpose.ACCESS);
      expect(decoded.userId).toBe(1);

      // Revoke the token
      await jwtService.revokeToken(token);

      // Should throw error for revoked token
      await expect(jwtService.verifyToken(token, TokenPurpose.ACCESS))
        .rejects.toThrow('Error al verificar token JWT');
    });

    it('should verify tokens with different user data correctly', async () => {
      const testCases = [
        { userId: 1, email: 'admin@example.com', role: 'ADMIN' },
        { userId: 2, email: 'user@example.com', role: 'USER' },
        { userId: 999, email: 'viewer@example.com', role: 'VIEWER' },
        { userId: 0, email: 'test+special@example-domain.com', role: 'ADMIN' }
      ];

      for (const testCase of testCases) {
        const payload = {
          ...testCase,
          purpose: TokenPurpose.ACCESS
        };

        const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
        const decoded = await jwtService.verifyToken(token, TokenPurpose.ACCESS);

        expect(decoded.userId).toBe(testCase.userId);
        expect(decoded.email).toBe(testCase.email);
        expect(decoded.role).toBe(testCase.role);
      }
    });
  });

  describe('refreshToken', () => {
    it('should generate new access token from refresh token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.REFRESH
      };

      const refreshToken = await jwtService.generateToken(payload, TokenPurpose.REFRESH);
      const newAccessToken = await jwtService.refreshToken(refreshToken);

      expect(newAccessToken).toBeDefined();
      expect(typeof newAccessToken).toBe('string');
      expect(newAccessToken.split('.')).toHaveLength(3);
      expect(newAccessToken).not.toBe(refreshToken);
    });

    it('should throw error for invalid refresh token', async () => {
      const invalidRefreshToken = 'invalid.refresh.token';

      await expect(jwtService.refreshToken(invalidRefreshToken))
        .rejects.toThrow('Error al refrescar token');
    });

    it('should throw error for access token used as refresh token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const accessToken = await jwtService.generateToken(payload, TokenPurpose.ACCESS);

      await expect(jwtService.refreshToken(accessToken))
        .rejects.toThrow('Error al refrescar token');
    });

    it('should preserve user data in refreshed token', async () => {
      const payload = {
        userId: 123,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.REFRESH
      };

      const refreshToken = await jwtService.generateToken(payload, TokenPurpose.REFRESH);
      const newAccessToken = await jwtService.refreshToken(refreshToken);
      const decoded = await jwtService.verifyToken(newAccessToken, TokenPurpose.ACCESS);

      expect(decoded.userId).toBe(123);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('ADMIN');
    });

    it('should handle revoked refresh tokens', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.REFRESH
      };

      const refreshToken = await jwtService.generateToken(payload, TokenPurpose.REFRESH);
      
      // Revoke the refresh token
      await jwtService.revokeToken(refreshToken);

      // Should throw error for revoked refresh token
      await expect(jwtService.refreshToken(refreshToken))
        .rejects.toThrow('Error al refrescar token');
    });
  });

  describe('revokeToken', () => {
    it('should revoke token successfully', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      
      // Should not throw
      await expect(jwtService.revokeToken(token)).resolves.not.toThrow();
    });

    it('should handle revoking the same token multiple times', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      
      // Revoke multiple times should not throw
      await jwtService.revokeToken(token);
      await jwtService.revokeToken(token);
      await jwtService.revokeToken(token);
    });

    it('should handle revoking invalid tokens', async () => {
      const invalidTokens = [
        'invalid.token.here',
        'not.a.jwt',
        '',
        'malformed'
      ];

      for (const invalidToken of invalidTokens) {
        await expect(jwtService.revokeToken(invalidToken)).resolves.not.toThrow();
      }
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      const isExpired = await jwtService.isTokenExpired(token);

      expect(isExpired).toBe(false);
    });

    it('should return true for invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      const isExpired = await jwtService.isTokenExpired(invalidToken);

      expect(isExpired).toBe(true);
    });

    it('should return true for malformed tokens', async () => {
      const malformedTokens = [
        'not.a.jwt',
        'only.two.parts',
        '',
        'invalid',
        'header.payload', // Missing signature
      ];

      for (const malformedToken of malformedTokens) {
        const isExpired = await jwtService.isTokenExpired(malformedToken);
        expect(isExpired).toBe(true);
      }
    });

    it('should handle tokens without exp claim', async () => {
      // This would be a manually crafted token without exp claim
      const tokenWithoutExp = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiJ9.invalid';
      const isExpired = await jwtService.isTokenExpired(tokenWithoutExp);

      expect(isExpired).toBe(true);
    });
  });

  describe('getTokenTimeRemaining', () => {
    it('should return positive time for valid token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      const timeRemaining = await jwtService.getTokenTimeRemaining(token);

      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThanOrEqual(3600); // Should be <= 1 hour for ACCESS token
    });

    it('should return 0 for invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      const timeRemaining = await jwtService.getTokenTimeRemaining(invalidToken);

      expect(timeRemaining).toBe(0);
    });

    it('should return 0 for malformed tokens', async () => {
      const malformedTokens = [
        'not.a.jwt',
        'only.two.parts',
        '',
        'invalid',
      ];

      for (const malformedToken of malformedTokens) {
        const timeRemaining = await jwtService.getTokenTimeRemaining(malformedToken);
        expect(timeRemaining).toBe(0);
      }
    });

    it('should return different time remaining for different token types', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const accessToken = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      const refreshToken = await jwtService.generateToken(payload, TokenPurpose.REFRESH);

      const accessTimeRemaining = await jwtService.getTokenTimeRemaining(accessToken);
      const refreshTimeRemaining = await jwtService.getTokenTimeRemaining(refreshToken);

      expect(accessTimeRemaining).toBeGreaterThan(0);
      expect(refreshTimeRemaining).toBeGreaterThan(0);
      expect(refreshTimeRemaining).toBeGreaterThan(accessTimeRemaining);
    });

    it('should handle tokens without exp claim', async () => {
      const tokenWithoutExp = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiJ9.invalid';
      const timeRemaining = await jwtService.getTokenTimeRemaining(tokenWithoutExp);

      expect(timeRemaining).toBe(0);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle concurrent token operations', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      // Generate multiple tokens concurrently
      const tokenPromises = Array(5).fill(null).map(() => 
        jwtService.generateToken(payload, TokenPurpose.ACCESS)
      );

      const tokens = await Promise.all(tokenPromises);

      // All tokens should be valid and different
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(5);

      // Verify all tokens concurrently
      const verificationPromises = tokens.map(token => 
        jwtService.verifyToken(token, TokenPurpose.ACCESS)
      );

      const decodedTokens = await Promise.all(verificationPromises);
      
      decodedTokens.forEach(decoded => {
        expect(decoded.userId).toBe(1);
        expect(decoded.email).toBe('test@example.com');
        expect(decoded.role).toBe('ADMIN');
      });
    });

    it('should handle empty and null inputs gracefully', async () => {
      const emptyInputs = [null, undefined, '', '   '];

      for (const emptyInput of emptyInputs) {
        await expect(jwtService.verifyToken(emptyInput as any, TokenPurpose.ACCESS))
          .rejects.toThrow('Error al verificar token JWT');
          
        const isExpired = await jwtService.isTokenExpired(emptyInput as any);
        expect(isExpired).toBe(true);
        
        const timeRemaining = await jwtService.getTokenTimeRemaining(emptyInput as any);
        expect(timeRemaining).toBe(0);
      }
    });

    it('should maintain token integrity across different operations', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        purpose: TokenPurpose.ACCESS
      };

      const token = await jwtService.generateToken(payload, TokenPurpose.ACCESS);
      
      // Perform various operations
      const isExpired1 = await jwtService.isTokenExpired(token);
      const timeRemaining1 = await jwtService.getTokenTimeRemaining(token);
      const decoded1 = await jwtService.verifyToken(token, TokenPurpose.ACCESS);
      
      // Token should still be valid after operations
      const isExpired2 = await jwtService.isTokenExpired(token);
      const timeRemaining2 = await jwtService.getTokenTimeRemaining(token);
      const decoded2 = await jwtService.verifyToken(token, TokenPurpose.ACCESS);
      
      expect(isExpired1).toBe(false);
      expect(isExpired2).toBe(false);
      expect(timeRemaining1).toBeGreaterThan(0);
      expect(timeRemaining2).toBeGreaterThan(0);
      expect(decoded1).toEqual(decoded2);
    });
  });
}); 