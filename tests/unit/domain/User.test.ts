import { User } from '@core/domain/entity/User';
import { UserRole } from '@shared/constants/RoleTypes';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a valid user with all required fields', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = new User(userData);

      expect(user.id).toBe(1);
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedPassword123');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe(UserRole.USER);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create user without optional id field', () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = new User(userData);

      expect(user.id).toBeUndefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should create user without optional dates', () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
      };

      const user = new User(userData);

      expect(user.createdAt).toBeUndefined();
      expect(user.updatedAt).toBeUndefined();
    });

    it('should throw error for invalid email', () => {
      const userData = {
        id: 1,
        email: 'invalid-email',
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'El email es obligatorio y debe ser válido'
      );
    });

    it('should throw error for empty email', () => {
      const userData = {
        id: 1,
        email: '',
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'El email es obligatorio y debe ser válido'
      );
    });

    it('should throw error for null email', () => {
      const userData = {
        id: 1,
        email: null as any,
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'El email es obligatorio y debe ser válido'
      );
    });

    it('should throw error for undefined email', () => {
      const userData = {
        id: 1,
        email: undefined as any,
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'El email es obligatorio y debe ser válido'
      );
    });

    it('should throw error for email exceeding 255 characters', () => {
      const longEmail = `${'a'.repeat(250)}@example.com`; // 263 characters
      const userData = {
        id: 1,
        email: longEmail,
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'El email no puede exceder 255 caracteres'
      );
    });

    it('should throw error for empty password', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: '',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'La contraseña debe tener al menos 6 caracteres'
      );
    });

    it('should throw error for short password', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'La contraseña debe tener al menos 6 caracteres'
      );
    });

    it('should throw error for null password', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: null as any,
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'La contraseña debe tener al menos 6 caracteres'
      );
    });

    it('should throw error for password exceeding 255 characters', () => {
      const longPassword = 'a'.repeat(256);
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: longPassword,
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'La contraseña no puede exceder 255 caracteres'
      );
    });

    it('should accept password with exactly 6 characters', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: '123456',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).not.toThrow();
    });

    it('should accept password with exactly 255 characters', () => {
      const maxPassword = 'a'.repeat(255);
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: maxPassword,
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).not.toThrow();
    });

    it('should throw error for empty name', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: '',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'El nombre debe tener al menos 2 caracteres'
      );
    });

    it('should throw error for short name', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'A',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'El nombre debe tener al menos 2 caracteres'
      );
    });

    it('should throw error for name with only spaces', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: '   ',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'El nombre debe tener al menos 2 caracteres'
      );
    });

    it('should throw error for null name', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: null as any,
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'El nombre debe tener al menos 2 caracteres'
      );
    });

    it('should throw error for name exceeding 255 characters', () => {
      const longName = 'a'.repeat(256);
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: longName,
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow(
        'El nombre no puede exceder 255 caracteres'
      );
    });

    it('should accept name with exactly 2 characters', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'AB',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).not.toThrow();
    });

    it('should accept name with exactly 255 characters', () => {
      const maxName = 'a'.repeat(255);
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: maxName,
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).not.toThrow();
    });

    it('should throw error for invalid role', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: 'INVALID_ROLE' as UserRole,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow('Rol de usuario inválido');
    });

    it('should throw error for null role', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: null as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow('Rol de usuario inválido');
    });

    it('should throw error for undefined role', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: undefined as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new User(userData)).toThrow('Rol de usuario inválido');
    });

    it('should handle boolean isActive correctly', () => {
      const activeUser = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
      });

      const inactiveUser = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: false,
      });

      expect(activeUser.isActive).toBe(true);
      expect(inactiveUser.isActive).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'a@b.c',
        'very.long.email.address@very.long.domain.name.com',
      ];

      validEmails.forEach(email => {
        const userData = {
          id: 1,
          email,
          password: 'hashedPassword123',
          name: 'Test User',
          role: UserRole.USER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => new User(userData)).not.toThrow();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email', // No @ symbol
        '', // Empty string
        '   ', // Only spaces
      ];

      invalidEmails.forEach(email => {
        const userData = {
          id: 1,
          email,
          password: 'hashedPassword123',
          name: 'Test User',
          role: UserRole.USER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => new User(userData)).toThrow(
          'El email es obligatorio y debe ser válido'
        );
      });
    });

    it('should accept emails with @ symbol', () => {
      const validEmails = [
        'user@example.com',
        'test@test',
        'a@b',
        'user@example',
      ];

      validEmails.forEach(email => {
        const userData = {
          id: 1,
          email,
          password: 'hashedPassword123',
          name: 'Test User',
          role: UserRole.USER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => new User(userData)).not.toThrow();
      });
    });
  });

  describe('validateRole', () => {
    it('should accept valid roles', () => {
      const validRoles = [UserRole.ADMIN, UserRole.USER, UserRole.VIEWER];

      validRoles.forEach(role => {
        const userData = {
          id: 1,
          email: 'test@example.com',
          password: 'hashedPassword123',
          name: 'Test User',
          role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => new User(userData)).not.toThrow();
      });
    });

    it('should reject case-sensitive invalid roles', () => {
      const invalidRoles = [
        'admin',
        'user',
        'viewer',
        'Admin',
        'User',
        'Viewer',
      ];

      invalidRoles.forEach(role => {
        const userData = {
          id: 1,
          email: 'test@example.com',
          password: 'hashedPassword123',
          name: 'Test User',
          role: role as UserRole,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => new User(userData)).toThrow('Rol de usuario inválido');
      });
    });
  });

  describe('User methods', () => {
    let user: User;

    beforeEach(() => {
      user = new User({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    describe('isAdmin', () => {
      it('should return true for ADMIN role', () => {
        const adminUser = new User({
          id: 1,
          email: 'admin@example.com',
          password: 'hashedPassword123',
          name: 'Admin User',
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        expect(adminUser.isAdmin()).toBe(true);
      });

      it('should return false for USER role', () => {
        expect(user.isAdmin()).toBe(false);
      });

      it('should return false for VIEWER role', () => {
        const viewerUser = new User({
          id: 1,
          email: 'viewer@example.com',
          password: 'hashedPassword123',
          name: 'Viewer User',
          role: UserRole.VIEWER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        expect(viewerUser.isAdmin()).toBe(false);
      });

      it('should return true for ADMIN role regardless of isActive status', () => {
        const inactiveAdmin = new User({
          id: 1,
          email: 'admin@example.com',
          password: 'hashedPassword123',
          name: 'Admin User',
          role: UserRole.ADMIN,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        expect(inactiveAdmin.isAdmin()).toBe(true);
      });
    });

    describe('isActiveUser', () => {
      it('should return true for active user', () => {
        expect(user.isActiveUser()).toBe(true);
      });

      it('should return false for inactive user', () => {
        const inactiveUser = new User({
          id: 1,
          email: 'inactive@example.com',
          password: 'hashedPassword123',
          name: 'Inactive User',
          role: UserRole.USER,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        expect(inactiveUser.isActiveUser()).toBe(false);
      });

      it('should return true for active admin', () => {
        const activeAdmin = new User({
          id: 1,
          email: 'admin@example.com',
          password: 'hashedPassword123',
          name: 'Admin User',
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        expect(activeAdmin.isActiveUser()).toBe(true);
      });

      it('should return false for inactive admin', () => {
        const inactiveAdmin = new User({
          id: 1,
          email: 'admin@example.com',
          password: 'hashedPassword123',
          name: 'Admin User',
          role: UserRole.ADMIN,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        expect(inactiveAdmin.isActiveUser()).toBe(false);
      });
    });

    describe('changePassword', () => {
      it('should update password successfully', () => {
        const newPassword = 'newPassword123';
        const originalPassword = user.password;

        user.changePassword(newPassword);

        expect(user.password).toBe(newPassword);
        expect(user.password).not.toBe(originalPassword);
      });

      it('should throw error for invalid password', () => {
        const originalPassword = user.password;

        expect(() => user.changePassword('123')).toThrow(
          'La contraseña debe tener al menos 6 caracteres'
        );
        expect(user.password).toBe(originalPassword); // Password should remain unchanged
      });

      it('should throw error for empty password', () => {
        const originalPassword = user.password;

        expect(() => user.changePassword('')).toThrow(
          'La contraseña debe tener al menos 6 caracteres'
        );
        expect(user.password).toBe(originalPassword);
      });

      it('should throw error for null password', () => {
        const originalPassword = user.password;

        expect(() => user.changePassword(null as any)).toThrow(
          'La contraseña debe tener al menos 6 caracteres'
        );
        expect(user.password).toBe(originalPassword);
      });

      it('should throw error for password exceeding 255 characters', () => {
        const longPassword = 'a'.repeat(256);
        const originalPassword = user.password;

        expect(() => user.changePassword(longPassword)).toThrow(
          'La contraseña no puede exceder 255 caracteres'
        );
        expect(user.password).toBe(originalPassword);
      });

      it('should accept password with exactly 6 characters', () => {
        const newPassword = '123456';

        expect(() => user.changePassword(newPassword)).not.toThrow();
        expect(user.password).toBe(newPassword);
      });

      it('should accept password with exactly 255 characters', () => {
        const maxPassword = 'a'.repeat(255);

        expect(() => user.changePassword(maxPassword)).not.toThrow();
        expect(user.password).toBe(maxPassword);
      });
    });

    describe('changeRole', () => {
      it('should update role successfully', () => {
        const originalRole = user.role;

        user.changeRole(UserRole.ADMIN);

        expect(user.role).toBe(UserRole.ADMIN);
        expect(user.role).not.toBe(originalRole);
      });

      it('should throw error for invalid role', () => {
        const originalRole = user.role;

        expect(() => user.changeRole('INVALID' as UserRole)).toThrow(
          'Rol de usuario inválido'
        );
        expect(user.role).toBe(originalRole);
      });

      it('should throw error for null role', () => {
        const originalRole = user.role;

        expect(() => user.changeRole(null as any)).toThrow(
          'Rol de usuario inválido'
        );
        expect(user.role).toBe(originalRole);
      });

      it('should throw error for undefined role', () => {
        const originalRole = user.role;

        expect(() => user.changeRole(undefined as any)).toThrow(
          'Rol de usuario inválido'
        );
        expect(user.role).toBe(originalRole);
      });

      it('should allow changing from USER to ADMIN', () => {
        user.changeRole(UserRole.ADMIN);
        expect(user.role).toBe(UserRole.ADMIN);
      });

      it('should allow changing from ADMIN to USER', () => {
        user.changeRole(UserRole.ADMIN);
        user.changeRole(UserRole.USER);
        expect(user.role).toBe(UserRole.USER);
      });

      it('should allow changing from USER to VIEWER', () => {
        user.changeRole(UserRole.VIEWER);
        expect(user.role).toBe(UserRole.VIEWER);
      });
    });

    describe('updateName', () => {
      it('should update name successfully', () => {
        const newName = 'Updated Name';
        const originalName = user.name;

        user.updateName(newName);

        expect(user.name).toBe(newName);
        expect(user.name).not.toBe(originalName);
      });

      it('should throw error for invalid name', () => {
        const originalName = user.name;

        expect(() => user.updateName('A')).toThrow(
          'El nombre debe tener al menos 2 caracteres'
        );
        expect(user.name).toBe(originalName);
      });

      it('should throw error for empty name', () => {
        const originalName = user.name;

        expect(() => user.updateName('')).toThrow(
          'El nombre debe tener al menos 2 caracteres'
        );
        expect(user.name).toBe(originalName);
      });

      it('should throw error for name with only spaces', () => {
        const originalName = user.name;

        expect(() => user.updateName('   ')).toThrow(
          'El nombre debe tener al menos 2 caracteres'
        );
        expect(user.name).toBe(originalName);
      });

      it('should throw error for null name', () => {
        const originalName = user.name;

        expect(() => user.updateName(null as any)).toThrow(
          'El nombre debe tener al menos 2 caracteres'
        );
        expect(user.name).toBe(originalName);
      });

      it('should throw error for name exceeding 255 characters', () => {
        const longName = 'a'.repeat(256);
        const originalName = user.name;

        expect(() => user.updateName(longName)).toThrow(
          'El nombre no puede exceder 255 caracteres'
        );
        expect(user.name).toBe(originalName);
      });

      it('should accept name with exactly 2 characters', () => {
        const newName = 'AB';

        expect(() => user.updateName(newName)).not.toThrow();
        expect(user.name).toBe(newName);
      });

      it('should accept name with exactly 255 characters', () => {
        const maxName = 'a'.repeat(255);

        expect(() => user.updateName(maxName)).not.toThrow();
        expect(user.name).toBe(maxName);
      });

      it('should trim whitespace from name', () => {
        const nameWithSpaces = '  Valid Name  ';
        const expectedName = 'Valid Name';

        user.updateName(nameWithSpaces);
        expect(user.name).toBe(nameWithSpaces); // Should preserve original input
      });
    });

    describe('activate and deactivate', () => {
      it('should activate user', () => {
        const inactiveUser = new User({
          id: 1,
          email: 'test@example.com',
          password: 'hashedPassword123',
          name: 'Test User',
          role: UserRole.USER,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        expect(inactiveUser.isActive).toBe(false);
        inactiveUser.activate();
        expect(inactiveUser.isActive).toBe(true);
      });

      it('should deactivate user', () => {
        expect(user.isActive).toBe(true);
        user.deactivate();
        expect(user.isActive).toBe(false);
      });

      it('should handle multiple activate calls', () => {
        user.activate();
        user.activate();
        expect(user.isActive).toBe(true);
      });

      it('should handle multiple deactivate calls', () => {
        user.deactivate();
        user.deactivate();
        expect(user.isActive).toBe(false);
      });

      it('should allow reactivation after deactivation', () => {
        user.deactivate();
        expect(user.isActive).toBe(false);
        user.activate();
        expect(user.isActive).toBe(true);
      });
    });

    describe('toJSON', () => {
      it('should return user data without password by default', () => {
        const json = user.toJSON();

        expect(json.id).toBe(1);
        expect(json.email).toBe('test@example.com');
        expect(json.name).toBe('Test User');
        expect(json.role).toBe(UserRole.USER);
        expect(json.isActive).toBe(true);
        expect(json.createdAt).toBeInstanceOf(Date);
        expect(json.updatedAt).toBeInstanceOf(Date);
        expect(json.password).toBeUndefined();
      });

      it('should include password when requested', () => {
        const json = user.toJSON(true);

        expect(json.password).toBe('hashedPassword123');
        expect(json.id).toBe(1);
        expect(json.email).toBe('test@example.com');
        expect(json.name).toBe('Test User');
        expect(json.role).toBe(UserRole.USER);
        expect(json.isActive).toBe(true);
      });

      it('should handle user without optional fields', () => {
        const minimalUser = new User({
          email: 'minimal@example.com',
          password: 'password123',
          name: 'Minimal User',
          role: UserRole.USER,
          isActive: true,
        });

        const json = minimalUser.toJSON();

        expect(json.id).toBeUndefined();
        expect(json.createdAt).toBeUndefined();
        expect(json.updatedAt).toBeUndefined();
        expect(json.email).toBe('minimal@example.com');
        expect(json.name).toBe('Minimal User');
        expect(json.role).toBe(UserRole.USER);
        expect(json.isActive).toBe(true);
      });

      it('should return different object instances on multiple calls', () => {
        const json1 = user.toJSON();
        const json2 = user.toJSON();

        expect(json1).not.toBe(json2); // Different object instances
        expect(json1).toEqual(json2); // Same content
      });

      it('should not affect original user when modifying returned JSON', () => {
        const json = user.toJSON();
        const originalName = user.name;

        json.name = 'Modified Name';

        expect(user.name).toBe(originalName);
      });
    });

    describe('Edge cases and error handling', () => {
      it('should handle user with all minimum valid values', () => {
        const minimalUser = new User({
          email: 'a@b',
          password: '123456',
          name: 'AB',
          role: UserRole.USER,
          isActive: false,
        });

        expect(minimalUser.email).toBe('a@b');
        expect(minimalUser.password).toBe('123456');
        expect(minimalUser.name).toBe('AB');
        expect(minimalUser.role).toBe(UserRole.USER);
        expect(minimalUser.isActive).toBe(false);
      });

      it('should handle user with all maximum valid values', () => {
        const maxEmail = `${'a'.repeat(250)}@b.c`; // 254 characters
        const maxPassword = 'a'.repeat(255);
        const maxName = 'a'.repeat(255);

        const maximalUser = new User({
          id: Number.MAX_SAFE_INTEGER,
          email: maxEmail,
          password: maxPassword,
          name: maxName,
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        expect(maximalUser.email).toBe(maxEmail);
        expect(maximalUser.password).toBe(maxPassword);
        expect(maximalUser.name).toBe(maxName);
        expect(maximalUser.role).toBe(UserRole.ADMIN);
        expect(maximalUser.isActive).toBe(true);
      });

      it('should handle concurrent method calls correctly', () => {
        user.changePassword('newPassword123');
        user.changeRole(UserRole.ADMIN);
        user.updateName('New Name');
        user.deactivate();

        expect(user.password).toBe('newPassword123');
        expect(user.role).toBe(UserRole.ADMIN);
        expect(user.name).toBe('New Name');
        expect(user.isActive).toBe(false);
      });
    });
  });
});
