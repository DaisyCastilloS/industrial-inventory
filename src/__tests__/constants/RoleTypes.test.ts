import { UserRole } from '../../00-constants/RoleTypes';

describe('RoleTypes Constants', () => {
  describe('UserRole', () => {
    it('should have correct ADMIN role value', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
    });

    it('should have correct USER role value', () => {
      expect(UserRole.USER).toBe('USER');
    });

    it('should have correct VIEWER role value', () => {
      expect(UserRole.VIEWER).toBe('VIEWER');
    });

    it('should have exactly 3 roles defined', () => {
      const roles = Object.values(UserRole);
      expect(roles).toHaveLength(3);
    });

    it('should contain all expected roles', () => {
      const roles = Object.values(UserRole);
      expect(roles).toContain('ADMIN');
      expect(roles).toContain('USER');
      expect(roles).toContain('VIEWER');
    });

    it('should be defined as constants', () => {
      // Verificar que los roles están definidos como constantes
      expect(UserRole.ADMIN).toBeDefined();
      expect(UserRole.USER).toBeDefined();
      expect(UserRole.VIEWER).toBeDefined();
      
      // Verificar que son strings
      expect(typeof UserRole.ADMIN).toBe('string');
      expect(typeof UserRole.USER).toBe('string');
      expect(typeof UserRole.VIEWER).toBe('string');
    });
  });
}); 