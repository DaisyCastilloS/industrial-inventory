/**
 * Custom error classes for Product domain
 */

export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductValidationError';
  }
}

export class ProductNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductAlreadyExistsError';
  }
}

export class ProductPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductPermissionError';
  }
}
