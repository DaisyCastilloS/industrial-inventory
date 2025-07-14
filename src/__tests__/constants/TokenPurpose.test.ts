import { TokenPurpose, TokenExpiration } from '../../00-constants/TokenPurpose';

describe('TokenPurpose Constants', () => {
  describe('TokenPurpose', () => {
    it('should have correct ACCESS token purpose', () => {
      expect(TokenPurpose.ACCESS).toBe('ACCESS');
    });

    it('should have correct REFRESH token purpose', () => {
      expect(TokenPurpose.REFRESH).toBe('REFRESH');
    });

    it('should have correct RESET_PASSWORD token purpose', () => {
      expect(TokenPurpose.RESET_PASSWORD).toBe('RESET_PASSWORD');
    });

    it('should have correct VERIFY_EMAIL token purpose', () => {
      expect(TokenPurpose.VERIFY_EMAIL).toBe('VERIFY_EMAIL');
    });

    it('should have exactly 4 token purposes defined', () => {
      const purposes = Object.values(TokenPurpose);
      expect(purposes).toHaveLength(4);
    });

    it('should contain all expected purposes', () => {
      const purposes = Object.values(TokenPurpose);
      expect(purposes).toContain('ACCESS');
      expect(purposes).toContain('REFRESH');
      expect(purposes).toContain('RESET_PASSWORD');
      expect(purposes).toContain('VERIFY_EMAIL');
    });
  });

  describe('TokenExpiration', () => {
    it('should have correct ACCESS_TOKEN expiration (1 hour)', () => {
      expect(TokenExpiration.ACCESS_TOKEN).toBe(3600); // 1 hour in seconds
    });

    it('should have correct REFRESH_TOKEN expiration (30 days)', () => {
      expect(TokenExpiration.REFRESH_TOKEN).toBe(2592000); // 30 days in seconds
    });

    it('should have correct RESET_PASSWORD expiration (30 minutes)', () => {
      expect(TokenExpiration.RESET_PASSWORD).toBe(1800); // 30 minutes in seconds
    });

    it('should have correct VERIFY_EMAIL expiration (1 hour)', () => {
      expect(TokenExpiration.VERIFY_EMAIL).toBe(3600); // 1 hour in seconds
    });

    it('should have exactly 4 expiration times defined', () => {
      const expirations = Object.values(TokenExpiration).filter(value => typeof value === 'number');
      expect(expirations).toHaveLength(4);
    });

    it('should have all expiration times as positive numbers', () => {
      const expirations = Object.values(TokenExpiration).filter(value => typeof value === 'number');
      expirations.forEach(expiration => {
        expect(typeof expiration).toBe('number');
        expect(expiration).toBeGreaterThan(0);
      });
    });

    it('should have refresh token expiration longer than access token', () => {
      expect(TokenExpiration.REFRESH_TOKEN).toBeGreaterThan(TokenExpiration.ACCESS_TOKEN);
    });

    it('should have access token expiration longer than reset password', () => {
      expect(TokenExpiration.ACCESS_TOKEN).toBeGreaterThan(TokenExpiration.RESET_PASSWORD);
    });

    it('should have verify email expiration equal to access token', () => {
      expect(TokenExpiration.VERIFY_EMAIL).toBe(TokenExpiration.ACCESS_TOKEN);
    });
  });
}); 