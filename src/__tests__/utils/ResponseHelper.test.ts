import { 
  buildSuccessResponse, 
  buildErrorResponse, 
  buildCreatedResponse, 
  buildUpdatedResponse, 
  buildDeletedResponse, 
  buildListResponse 
} from '../../04-presentation/utils/ResponseHelper';

describe('ResponseHelper Functions', () => {
  describe('buildSuccessResponse', () => {
    it('should build success response with data', () => {
      const data = { user: { id: 1, name: 'Test User' } };
      const message = 'Operation successful';

      const response = buildSuccessResponse(message, data);

      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
      expect(typeof response.timestamp).toBe('string');
    });

    it('should build success response without data', () => {
      const message = 'Operation successful';

      const response = buildSuccessResponse(message);

      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
      expect(response.data).toBeUndefined();
      expect(response.timestamp).toBeDefined();
    });

    it('should build success response with path', () => {
      const message = 'Operation successful';
      const path = '/api/users';

      const response = buildSuccessResponse(message, undefined, path);

      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
      expect(response.path).toBe(path);
      expect(response.timestamp).toBeDefined();
    });

    it('should generate valid ISO timestamp', () => {
      const response = buildSuccessResponse('Test message');
      const timestamp = response.timestamp;

      expect(timestamp).toBeDefined();
      expect(typeof timestamp).toBe('string');
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('buildErrorResponse', () => {
    it('should build error response with basic info', () => {
      const type = 'Validation Error';
      const message = 'Something went wrong';

      const response = buildErrorResponse(type, message);

      expect(response.success).toBe(false);
      expect(response.error.type).toBe(type);
      expect(response.error.message).toBe(message);
      expect(response.timestamp).toBeDefined();
    });

    it('should build error response with details', () => {
      const type = 'Validation Error';
      const message = 'Something went wrong';
      const details = { field: 'email', reason: 'invalid format' };

      const response = buildErrorResponse(type, message, details);

      expect(response.success).toBe(false);
      expect(response.error.type).toBe(type);
      expect(response.error.message).toBe(message);
      expect(response.error.details).toEqual(details);
      expect(response.timestamp).toBeDefined();
    });

    it('should build error response with path', () => {
      const type = 'Auth Error';
      const message = 'Unauthorized';
      const path = '/api/auth/login';

      const response = buildErrorResponse(type, message, undefined, path);

      expect(response.success).toBe(false);
      expect(response.error.type).toBe(type);
      expect(response.error.message).toBe(message);
      expect(response.path).toBe(path);
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('buildCreatedResponse', () => {
    it('should build created response with default message', () => {
      const data = { id: 1, name: 'Test User' };

      const response = buildCreatedResponse(data);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Resource created successfully');
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
    });

    it('should build created response with custom message', () => {
      const data = { id: 1, name: 'Test User' };
      const message = 'User created successfully';

      const response = buildCreatedResponse(data, message);

      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('buildUpdatedResponse', () => {
    it('should build updated response with default message', () => {
      const id = 1;

      const response = buildUpdatedResponse(id);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Resource updated successfully');
      expect(response.data).toEqual({ id });
      expect(response.timestamp).toBeDefined();
    });

    it('should build updated response with custom message', () => {
      const id = 'user-123';
      const message = 'User updated successfully';

      const response = buildUpdatedResponse(id, message);

      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
      expect(response.data).toEqual({ id });
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('buildDeletedResponse', () => {
    it('should build deleted response with default message', () => {
      const id = 1;

      const response = buildDeletedResponse(id);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Resource deleted successfully');
      expect(response.data).toEqual({ id });
      expect(response.timestamp).toBeDefined();
    });

    it('should build deleted response with custom message', () => {
      const id = 'user-123';
      const message = 'User deleted successfully';

      const response = buildDeletedResponse(id, message);

      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
      expect(response.data).toEqual({ id });
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('buildListResponse', () => {
    it('should build list response with default message', () => {
      const data = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }];

      const response = buildListResponse(data);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Resources retrieved successfully');
      expect(response.data).toEqual(data);
      expect(response.metadata.count).toBe(2);
      expect(response.metadata.total).toBe(2);
      expect(response.timestamp).toBeDefined();
    });

    it('should build list response with metadata', () => {
      const data = [{ id: 1, name: 'User 1' }];
      const metadata = { total: 100, page: 1, limit: 10 };

      const response = buildListResponse(data, 'Users retrieved', metadata);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Users retrieved');
      expect(response.data).toEqual(data);
      expect(response.metadata.count).toBe(1);
      expect(response.metadata.total).toBe(100);
      expect(response.metadata.page).toBe(1);
      expect(response.metadata.limit).toBe(10);
      expect(response.timestamp).toBeDefined();
    });
  });
}); 