
export abstract class BaseUpdateUseCase<Entity, UpdateDTO, ResponseDTO> {
  protected abstract getEntityName(): string;
  protected abstract mapToEntity(dto: UpdateDTO): Partial<Entity>;
  protected abstract mapToResponseDTO(entity: Entity): ResponseDTO;

  async execute(id: string, dto: UpdateDTO): Promise<ResponseDTO> {
    throw new Error('Not implemented');
  }
}
