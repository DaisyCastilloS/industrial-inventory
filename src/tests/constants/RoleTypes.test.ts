import { describe, it, expect } from '@jest/globals';
import { UserRole } from '../../shared/constants/RoleTypes';

describe('RoleTypes Constants', () => {
  describe('UserRole', () => {
    it('should have exactly 6 roles defined', () => {
      const roles = Object.values(UserRole);
      expect(roles).toHaveLength(6);
    });

    it('should contain all expected roles', () => {
      expect(UserRole).toEqual({
        ADMIN: 'ADMIN',
        USER: 'USER',
        VIEWER: 'VIEWER',
        MANAGER: 'MANAGER',
        SUPERVISOR: 'SUPERVISOR',
        AUDITOR: 'AUDITOR'
      });
    });

    it('should have all roles as strings', () => {
      const roles = Object.values(UserRole);
      const allStrings = roles.every(
        value => typeof value === 'string'
      );
      expect(allStrings).toBe(true);
    });

    it('should have ADMIN role', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
    });

    it('should have USER role', () => {
      expect(UserRole.USER).toBe('USER');
    });

    it('should have VIEWER role', () => {
      expect(UserRole.VIEWER).toBe('VIEWER');
    });

    it('should have MANAGER role', () => {
      expect(UserRole.MANAGER).toBe('MANAGER');
    });

    it('should have SUPERVISOR role', () => {
      expect(UserRole.SUPERVISOR).toBe('SUPERVISOR');
    });

    it('should have AUDITOR role', () => {
      expect(UserRole.AUDITOR).toBe('AUDITOR');
    });
  });
});
