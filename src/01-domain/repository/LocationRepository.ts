/**
 * @fileoverview Interfaz del repositorio de ubicaciones
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { Location, ILocation } from '../entity/Location';

/**
 * Interfaz del repositorio de ubicaciones
 */
export interface ILocationRepository {
  /**
   * Crea una nueva ubicación
   * @param location - Datos de la ubicación
   * @returns Ubicación creada
   */
  create(location: ILocation): Promise<Location>;

  /**
   * Busca una ubicación por ID
   * @param id - ID de la ubicación
   * @returns Ubicación encontrada o null
   */
  findById(id: number): Promise<Location | null>;

  /**
   * Busca una ubicación por nombre
   * @param name - Nombre de la ubicación
   * @returns Ubicación encontrada o null
   */
  findByName(name: string): Promise<Location | null>;

  /**
   * Obtiene todas las ubicaciones
   * @returns Lista de ubicaciones
   */
  findAll(): Promise<Location[]>;

  /**
   * Obtiene ubicaciones activas
   * @returns Lista de ubicaciones activas
   */
  findActive(): Promise<Location[]>;

  /**
   * Busca ubicaciones por descripción
   * @param description - Descripción a buscar
   * @returns Lista de ubicaciones que coinciden
   */
  findByDescription(description: string): Promise<Location[]>;

  /**
   * Actualiza una ubicación
   * @param id - ID de la ubicación
   * @param locationData - Datos a actualizar
   * @returns Ubicación actualizada
   */
  update(id: number, locationData: Partial<ILocation>): Promise<Location>;

  /**
   * Elimina una ubicación (soft delete)
   * @param id - ID de la ubicación
   */
  delete(id: number): Promise<void>;

  /**
   * Activa una ubicación
   * @param id - ID de la ubicación
   * @returns Ubicación activada
   */
  activate(id: number): Promise<Location>;

  /**
   * Desactiva una ubicación
   * @param id - ID de la ubicación
   * @returns Ubicación desactivada
   */
  deactivate(id: number): Promise<Location>;

  /**
   * Verifica si existe una ubicación con el nombre dado
   * @param name - Nombre a verificar
   * @returns true si existe
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Obtiene el historial de auditoría de una ubicación
   * @param locationId - ID de la ubicación
   * @returns Lista de logs de auditoría
   */
  getAuditTrail(locationId: number): Promise<any[]>;
} 