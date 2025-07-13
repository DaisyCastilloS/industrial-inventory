import { EncryptionService } from '../../03-infrastructure/services/EncryptionService';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService();
  });

  describe('hash', () => {
    it('should hash a password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await encryptionService.hash(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(10);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await encryptionService.hash(password);
      const hash2 = await encryptionService.hash(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await encryptionService.hash(password);
      
      const result = await encryptionService.compare(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await encryptionService.hash(password);
      const wrongPassword = 'wrongPassword123';
      
      const result = await encryptionService.compare(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });
}); 