export interface ProductMovementResponseDTO {
  id: number;
  productId: number;
  movementType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string | null;
  userId: number;
  createdAt: Date;
}
