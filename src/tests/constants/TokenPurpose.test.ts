import { describe, it, expect } from '@jest/globals';
import { TokenPurpose, TokenExpiration } from '../../shared/constants/TokenPurpose';

describe('TokenPurpose Constants', () => {
  describe('TokenPurpose', () => {
    it('should have exactly 7 token purposes defined', () => {
      const purposes = Object.values(TokenPurpose);
      expect(purposes).toHaveLength(7);
    });

    it('should contain all expected purposes', () => {
      expect(TokenPurpose).toEqual({
        ACCESS: 'ACCESS',
        REFRESH: 'REFRESH',
        RESET_PASSWORD: 'RESET_PASSWORD',
        VERIFY_EMAIL: 'VERIFY_EMAIL',
        API_KEY: 'API_KEY',
        TEMPORARY_ACCESS: 'TEMPORARY_ACCESS',
        IMPERSONATION: 'IMPERSONATION'
      });
    });

    it('should have all purposes as strings', () => {
      const purposes = Object.values(TokenPurpose);
      const allStrings = purposes.every(value => typeof value === 'string');
      expect(allStrings).toBe(true);
    });
  });

  describe('TokenExpiration', () => {
    it('should have exactly 7 expiration times defined', () => {
      const expirations = Object.values(TokenExpiration).filter(
        value => typeof value === 'number'
      );
      expect(expirations).toHaveLength(7);
    });

    it('should have all expiration times as positive numbers', () => {
      const expirations = Object.values(TokenExpiration).filter(
        value => typeof value === 'number'
      );
      const allPositive = expirations.every(value => value > 0);
      expect(allPositive).toBe(true);
    });

    it('should have correct expiration times', () => {
      expect(TokenExpiration.ACCESS_TOKEN).toBe(3600);
      expect(TokenExpiration.REFRESH_TOKEN).toBe(2592000);
      expect(TokenExpiration.RESET_PASSWORD).toBe(1800);
      expect(TokenExpiration.VERIFY_EMAIL).toBe(3600);
      expect(TokenExpiration.API_KEY).toBe(31536000);
      expect(TokenExpiration.TEMPORARY_ACCESS).toBe(1800);
      expect(TokenExpiration.IMPERSONATION).toBe(3600);
    });
  });
});
