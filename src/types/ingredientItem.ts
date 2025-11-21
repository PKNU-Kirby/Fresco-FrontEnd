export type FridgeItem = {
  // 백엔드 응답
  id: number;
  ingredientId: number;
  categoryId: number;
  IngredientName: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  // 프론트
  fridgeId: number;
  itemCategory: string;
};
