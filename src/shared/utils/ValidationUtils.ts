/**
 * @fileoverview Utilidades para validación
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { SecurityConfig } from '../constants/TokenPurpose';

/**
 * Valida una contraseña según los requisitos de seguridad
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < SecurityConfig.MIN_PASSWORD_LENGTH) {
    errors.push(
      `La contraseña debe tener al menos ${SecurityConfig.MIN_PASSWORD_LENGTH} caracteres`
    );
  }

  if (password.length > SecurityConfig.MAX_PASSWORD_LENGTH) {
    errors.push(
      `La contraseña no puede tener más de ${SecurityConfig.MAX_PASSWORD_LENGTH} caracteres`
    );
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida un email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Valida un número de teléfono
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Valida un código postal
 */
export function validatePostalCode(postalCode: string): boolean {
  const postalCodeRegex = /^\d{5}(-\d{4})?$/;
  return postalCodeRegex.test(postalCode);
}

/**
 * Valida un SKU
 */
export function validateSKU(sku: string): boolean {
  const skuRegex = /^[A-Z0-9]{2,}-[A-Z0-9]{3,}$/;
  return skuRegex.test(sku);
}

/**
 * Valida una URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida un número de documento
 */
export function validateDocumentNumber(
  type: 'DNI' | 'RUC' | 'CE',
  number: string
): boolean {
  switch (type) {
    case 'DNI':
      return /^\d{8}$/.test(number);
    case 'RUC':
      return /^[12]\d{10}$/.test(number);
    case 'CE':
      return /^[A-Z0-9]{9,12}$/.test(number);
    default:
      return false;
  }
}

/**
 * Valida una fecha
 */
export function validateDate(date: string): boolean {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Valida un rango de fechas
 */
export function validateDateRange(
  startDate: string,
  endDate: string
): {
  isValid: boolean;
  error?: string;
} {
  if (!validateDate(startDate) || !validateDate(endDate)) {
    return {
      isValid: false,
      error: 'Fechas inválidas',
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    return {
      isValid: false,
      error: 'La fecha de fin debe ser posterior a la fecha de inicio',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Valida un monto monetario
 */
export function validateAmount(amount: number): {
  isValid: boolean;
  error?: string;
} {
  if (isNaN(amount)) {
    return {
      isValid: false,
      error: 'El monto debe ser un número',
    };
  }

  if (amount < 0) {
    return {
      isValid: false,
      error: 'El monto no puede ser negativo',
    };
  }

  if (amount > 999999999.99) {
    return {
      isValid: false,
      error: 'El monto es demasiado grande',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Valida coordenadas geográficas
 */
export function validateCoordinates(
  lat: number,
  lng: number
): {
  isValid: boolean;
  error?: string;
} {
  if (isNaN(lat) || isNaN(lng)) {
    return {
      isValid: false,
      error: 'Las coordenadas deben ser números',
    };
  }

  if (lat < -90 || lat > 90) {
    return {
      isValid: false,
      error: 'La latitud debe estar entre -90 y 90',
    };
  }

  if (lng < -180 || lng > 180) {
    return {
      isValid: false,
      error: 'La longitud debe estar entre -180 y 180',
    };
  }

  return {
    isValid: true,
  };
}
