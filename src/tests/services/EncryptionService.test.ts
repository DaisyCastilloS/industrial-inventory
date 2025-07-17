/**
 * @fileoverview Pruebas del servicio de encriptación
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { EncryptionService } from '../../infrastructure/services/EncryptionService';
import { SecurityConfig } from '../../shared/constants/TokenPurpose';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService();
  });

  describe('hashPassword', () => {
    it('should hash a password correctly', async () => {
      const password = 'testPassword123!';
      const hashedPassword = await encryptionService.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBe(60); // bcrypt hash length
      expect(hashedPassword).toMatch(/^\$2[ayb]\$[0-9]{2}\$/); // bcrypt format
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123!';
      const hash1 = await encryptionService.hashPassword(password);
      const hash2 = await encryptionService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(hash1).toMatch(/^\$2[ayb]\$[0-9]{2}\$/);
      expect(hash2).toMatch(/^\$2[ayb]\$[0-9]{2}\$/);
    });

    it('should reject passwords that are too short', async () => {
      const shortPassword = 'short';
      await expect(
        encryptionService.hashPassword(shortPassword)
      ).rejects.toThrow(
        `La contraseña debe tener al menos ${SecurityConfig.MIN_PASSWORD_LENGTH} caracteres`
      );
    });

    it('should reject passwords that are too long', async () => {
      const longPassword = 'a'.repeat(SecurityConfig.MAX_PASSWORD_LENGTH + 1);
      await expect(
        encryptionService.hashPassword(longPassword)
      ).rejects.toThrow(
        `La contraseña no puede tener más de ${SecurityConfig.MAX_PASSWORD_LENGTH} caracteres`
      );
    });

    it('should reject passwords without special characters', async () => {
      const password = 'testPassword123';
      await expect(encryptionService.hashPassword(password)).rejects.toThrow(
        'La contraseña debe contener al menos un carácter especial'
      );
    });

    it('should reject passwords without numbers', async () => {
      const password = 'testPassword!';
      await expect(encryptionService.hashPassword(password)).rejects.toThrow(
        'La contraseña debe contener al menos un número'
      );
    });

    it('should reject passwords without uppercase letters', async () => {
      const password = 'testpassword123!';
      await expect(encryptionService.hashPassword(password)).rejects.toThrow(
        'La contraseña debe contener al menos una letra mayúscula'
      );
    });

    it('should reject passwords without lowercase letters', async () => {
      const password = 'TESTPASSWORD123!';
      await expect(encryptionService.hashPassword(password)).rejects.toThrow(
        'La contraseña debe contener al menos una letra minúscula'
      );
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'testPassword123!';
      const hashedPassword = await encryptionService.hashPassword(password);

      const result = await encryptionService.verifyPassword(
        password,
        hashedPassword
      );
      expect(result).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'testPassword123!';
      const wrongPassword = 'wrongPassword123!';
      const hashedPassword = await encryptionService.hashPassword(password);

      const result = await encryptionService.verifyPassword(
        wrongPassword,
        hashedPassword
      );
      expect(result).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'testPassword123!';
      const wrongCase = 'TestPassword123!';
      const hashedPassword = await encryptionService.hashPassword(password);

      const result = await encryptionService.verifyPassword(
        wrongCase,
        hashedPassword
      );
      expect(result).toBe(false);
    });

    it('should reject invalid hash formats', async () => {
      const password = 'testPassword123!';
      const invalidHash = 'invalid.hash.format';

      await expect(
        encryptionService.verifyPassword(password, invalidHash)
      ).rejects.toThrow();
    });
  });

  describe('encrypt', () => {
    it('should encrypt data correctly', async () => {
      const data = 'sensitive data';
      const encrypted = await encryptionService.encrypt(data);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(data);
      expect(encrypted.split(':')).toHaveLength(3); // iv:tag:encrypted format
    });

    it('should encrypt the same data differently each time', async () => {
      const data = 'sensitive data';
      const encrypted1 = await encryptionService.encrypt(data);
      const encrypted2 = await encryptionService.encrypt(data);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty strings', async () => {
      const data = '';
      const encrypted = await encryptionService.encrypt(data);

      expect(encrypted).toBeDefined();
      expect(encrypted).toBe('EMPTY_STRING');
    });

    it('should handle special characters', async () => {
      const data = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = await encryptionService.encrypt(data);

      expect(encrypted).toBeDefined();
      expect(encrypted.split(':')).toHaveLength(3);
    });
  });

  describe('decrypt', () => {
    it('should decrypt data correctly', async () => {
      const data = 'sensitive data';
      const encrypted = await encryptionService.encrypt(data);
      const decrypted = await encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(data);
    });

    it('should reject invalid encrypted data format', async () => {
      const invalidData = 'invalid:data:format';

      await expect(encryptionService.decrypt(invalidData)).rejects.toThrow(
        'Datos encriptados manipulados'
      );
    });

    it('should reject tampered data', async () => {
      const data = 'sensitive data';
      const encrypted = await encryptionService.encrypt(data);
      const [iv, tag, encryptedData] = encrypted.split(':');
      const tamperedData = `${iv}:${tag}:${encryptedData}tampered`;

      await expect(encryptionService.decrypt(tamperedData)).rejects.toThrow(
        'Datos encriptados manipulados'
      );
    });

    it('should handle empty strings', async () => {
      const data = '';
      const encrypted = await encryptionService.encrypt(data);
      const decrypted = await encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(data);
    });

    it('should handle special characters', async () => {
      const data = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = await encryptionService.encrypt(data);
      const decrypted = await encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(data);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate tokens of the specified length', async () => {
      const length = 32;
      const token = await encryptionService.generateSecureToken(length);

      expect(token).toBeDefined();
      expect(token.length).toBe(length * 2); // hex encoding doubles length
    });

    it('should generate different tokens each time', async () => {
      const length = 32;
      const token1 = await encryptionService.generateSecureToken(length);
      const token2 = await encryptionService.generateSecureToken(length);

      expect(token1).not.toBe(token2);
    });

    it('should reject invalid lengths', async () => {
      const invalidLength = 8; // too short

      await expect(
        encryptionService.generateSecureToken(invalidLength)
      ).rejects.toThrow();
    });
  });

  describe('generateSalt', () => {
    it('should generate salt with default rounds', async () => {
      const salt = await encryptionService.generateSalt();

      expect(salt).toBeDefined();
      expect(salt).toMatch(/^\$2[ayb]\$[0-9]{2}\$/);
    });

    it('should generate different salts each time', async () => {
      const salt1 = await encryptionService.generateSalt();
      const salt2 = await encryptionService.generateSalt();

      expect(salt1).not.toBe(salt2);
    });

    it('should reject invalid rounds', async () => {
      const invalidRounds = 5; // too few

      await expect(
        encryptionService.generateSalt(invalidRounds)
      ).rejects.toThrow();
    });
  });
});
