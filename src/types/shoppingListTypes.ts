export interface CartItem {
  id: number;
  groceryListId: number;
  name: string;
  quantity: number;
  purchased: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  unit: string;
  order: number;
}

export interface ShoppingListScreenProps {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
    };
  };
}

export interface PendingChanges {
  name?: string;
  quantity?: number;
  unit?: string;
}
