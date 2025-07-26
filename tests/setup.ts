// This is a Jest setup file
// It will run before all tests

// Import Jest types
import '@jest/globals';
import { config } from 'dotenv';
import { randomBytes } from 'crypto';

// Load environment variables from .env file
config();

// Set up environment variables for testing
process.env.NODE_ENV = 'test';

// Generate valid hexadecimal keys for testing
const generateHexKey = (length: number) => randomBytes(length).toString('hex');

// Use environment variables from .env if available, otherwise use test defaults
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || generateHexKey(32);
process.env.JWT_REFRESH_SECRET_KEY =
  process.env.JWT_REFRESH_SECRET_KEY || generateHexKey(32);
process.env.ENCRYPTION_SECRET_KEY =
  process.env.ENCRYPTION_SECRET_KEY || generateHexKey(32);
process.env.ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || generateHexKey(16);
process.env.JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '1h';
process.env.JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '12';
