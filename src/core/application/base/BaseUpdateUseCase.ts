/**
 * Base class for update use cases
 */
export abstract class BaseUpdateUseCase<Entity, UpdateDTO, ResponseDTO> {
  protected abstract getEntityName(): string;
  protected abstract mapToEntity(dto: UpdateDTO): Partial<Entity>;
  protected abstract mapToResponseDTO(entity: Entity): ResponseDTO;

  async execute(id: string, dto: UpdateDTO): Promise<ResponseDTO> {
    // Base implementation - extend as needed
    throw new Error('Not implemented');
  }
}
