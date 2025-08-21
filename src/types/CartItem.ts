export interface CartItem {
  id: string;
  groceryListId: string;
  name: string;
  quantity: number;
  purchased: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  unit: string;
  order: number;
}
