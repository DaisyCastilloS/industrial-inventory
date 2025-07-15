/**
 * @fileoverview Utilidades para formateo
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Formatea un número como moneda
 */
export function formatCurrency(
  amount: number,
  currency: string = 'PEN'
): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(number: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

/**
 * Formatea una fecha
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'full':
      return dateObj.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    default:
      return dateObj.toLocaleDateString('es-PE');
  }
}

/**
 * Formatea una hora
 */
export function formatTime(
  date: Date | string,
  format: '12h' | '24h' = '24h'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleTimeString('es-PE', {
    hour12: format === '12h',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea un timestamp
 */
export function formatTimestamp(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Formatea bytes a una unidad legible
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Formatea una duración en segundos
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0)
    parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formatea un número de teléfono
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
}

/**
 * Formatea un documento de identidad
 */
export function formatDocument(
  type: 'DNI' | 'RUC' | 'CE',
  number: string
): string {
  const cleaned = number.replace(/\D/g, '');
  switch (type) {
    case 'DNI':
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
    case 'RUC':
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3.$4');
    case 'CE':
      return cleaned.replace(/(\w{3})(\w{3})(\w{3})/, '$1-$2-$3');
    default:
      return number;
  }
}

/**
 * Formatea coordenadas geográficas
 */
export function formatCoordinates(
  lat: number,
  lng: number,
  decimals: number = 6
): string {
  const latitude = `${Math.abs(lat).toFixed(decimals)}° ${lat >= 0 ? 'N' : 'S'}`;
  const longitude = `${Math.abs(lng).toFixed(decimals)}° ${lng >= 0 ? 'E' : 'W'}`;
  return `${latitude}, ${longitude}`;
}
