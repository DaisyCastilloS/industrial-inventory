/**
 * @fileoverview Tests para AuditLogRepositoryImpl
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { AuditLogRepositoryImpl } from '../../infrastructure/services/AuditLogRepositoryImpl';
import { AuditLog } from '../../core/domain/entity/AuditLog';
import { pool } from '../../infrastructure/db/database';
import { QueryResult } from 'pg';

// Mock de la base de datos
jest.mock('../../infrastructure/db/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('AuditLogRepositoryImpl', () => {
  let repository: AuditLogRepositoryImpl;
  let mockPool: { query: jest.Mock<Promise<QueryResult<any>>, any[]> };

  beforeEach(() => {
    repository = new AuditLogRepositoryImpl();
    mockPool = pool as unknown as { query: jest.Mock<Promise<QueryResult<any>>, any[]> };
    jest.clearAllMocks();
  });

  describe('Búsquedas básicas', () => {
    it('should find logs by table', async () => {
      const mockRows = [
        {
          id: 1,
          table_name: 'users',
          record_id: 1,
          action: 'CREATE',
          created_at: new Date(),
        },
        {
          id: 2,
          table_name: 'users',
          record_id: 2,
          action: 'UPDATE',
          created_at: new Date(),
        },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const result = await repository.findByTable('users');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT * FROM audit_logs WHERE table_name = $1'
        ),
        ['users']
      );
      expect(result.data).toHaveLength(2);
    });

    it('should find logs by record', async () => {
      const mockRows = [
        { id: 1, table_name: 'users', record_id: 123, action: 'CREATE' },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const result = await repository.findByRecord('users', 123);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT * FROM audit_logs WHERE table_name = $1 AND record_id = $2'
        ),
        ['users', 123]
      );
      expect(result.data).toHaveLength(1);
    });

    it('should find logs by user', async () => {
      const mockRows = [
        { id: 1, table_name: 'users', record_id: 1, user_id: 456, action: 'CREATE' },
        { id: 2, table_name: 'users', record_id: 2, user_id: 456, action: 'UPDATE' },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const result = await repository.findByUser(456);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM audit_logs WHERE user_id = $1'),
        [456]
      );
      expect(result.data).toHaveLength(2);
    });
  });

  describe('Búsquedas avanzadas', () => {
    it('should search by multiple criteria', async () => {
      const mockRows = [
        { id: 1, table_name: 'users', record_id: 1, user_id: 123, action: 'UPDATE' },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const criteria = {
        tableName: 'users',
        userId: 123,
        action: 'UPDATE',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      const result = await repository.searchByMultipleCriteria(criteria);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM audit_logs'),
        ['users', 123, 'UPDATE', new Date('2024-01-01'), new Date('2024-12-31')]
      );
      expect(result.data).toHaveLength(1);
    });

    it('should search by text in values', async () => {
      const mockRows = [
        {
          id: 1,
          table_name: 'users',
          record_id: 1,
          old_values: '{"name": "John"}',
          new_values: '{"name": "Jane"}',
        },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const result = await repository.searchByTextInValues('John');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          'WHERE (old_values::text ILIKE $1 OR new_values::text ILIKE $1)'
        ),
        ['%John%']
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('Estadísticas', () => {
    it('should get stats by table', async () => {
      const mockRows = [
        { table_name: 'users', count: '10' },
        { table_name: 'products', count: '5' },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const result = await repository.getStatsByTable();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT table_name, COUNT(*) as count FROM audit_logs GROUP BY table_name ORDER BY count DESC')
      );
      expect(result.data).toEqual([
        { tableName: 'users', count: 10 },
        { tableName: 'products', count: 5 },
      ]);
    });

    it('should get stats by action', async () => {
      const mockRows = [
        { action: 'CREATE', count: '15' },
        { action: 'UPDATE', count: '8' },
        { action: 'DELETE', count: '3' },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const result = await repository.getStatsByAction();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action ORDER BY count DESC')
      );
      expect(result.data).toEqual([
        { action: 'CREATE', count: 15 },
        { action: 'UPDATE', count: 8 },
        { action: 'DELETE', count: 3 },
      ]);
    });

    it('should get security stats', async () => {
      const mockRows = [
        {
          unique_ips: '5',
          unique_users: '3',
          total_actions: '25',
          first_action: '2024-01-01T00:00:00Z',
          last_action: '2024-12-31T23:59:59Z',
        },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await repository.getSecurityStats(startDate, endDate);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(DISTINCT ip_address) as unique_ips'),
        [startDate, endDate]
      );
      expect(result.data).toEqual({
        uniqueIps: 5,
        uniqueUsers: 3,
        totalActions: 25,
        firstAction: new Date('2024-01-01T00:00:00Z'),
        lastAction: new Date('2024-12-31T23:59:59Z'),
      });
    });
  });

  describe('Auditoría específica', () => {
    it('should get record history', async () => {
      const mockRows = [
        {
          id: 1,
          table_name: 'users',
          record_id: 123,
          action: 'CREATE',
          created_at: new Date(),
        },
        {
          id: 2,
          table_name: 'users',
          record_id: 123,
          action: 'UPDATE',
          created_at: new Date(),
        },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const result = await repository.getRecordHistory('users', 123);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT * FROM audit_logs WHERE table_name = $1 AND record_id = $2'
        ),
        ['users', 123]
      );
      expect(result.data).toHaveLength(2);
    });

    it('should get user recent activity', async () => {
      const mockRows = [
        {
          id: 1,
          table_name: 'users',
          record_id: 1,
          user_id: 456,
          action: 'CREATE',
          created_at: new Date(),
        },
        {
          id: 2,
          table_name: 'products',
          record_id: 2,
          user_id: 456,
          action: 'UPDATE',
          created_at: new Date(),
        },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const result = await repository.getUserRecentActivity(456);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM audit_logs WHERE user_id = $1'),
        [456]
      );
      expect(result.data).toHaveLength(2);
    });

    it('should get activity by IP', async () => {
      const mockRows = [
        {
          id: 1,
          table_name: 'users',
          record_id: 1,
          ip_address: '192.168.1.1',
          action: 'CREATE',
          created_at: new Date(),
        },
        {
          id: 2,
          table_name: 'products',
          record_id: 2,
          ip_address: '192.168.1.1',
          action: 'UPDATE',
          created_at: new Date(),
        },
      ];
      mockPool.query.mockResolvedValue({ rows: mockRows } as QueryResult);

      const result = await repository.getActivityByIp('192.168.1.1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM audit_logs WHERE ip_address = $1'),
        ['192.168.1.1']
      );
      expect(result.data).toHaveLength(2);
    });

    it('should clean old logs', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 50 } as QueryResult);

      const result = await repository.cleanOldLogs(30);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM audit_logs WHERE created_at < $1'),
        [expect.any(Date)]
      );
      expect(result.data).toBe(50);
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(repository.findAll()).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle empty results', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      } as QueryResult);

      const result = await repository.findAll();

      expect(result.data).toHaveLength(0);
    });
  });
});
