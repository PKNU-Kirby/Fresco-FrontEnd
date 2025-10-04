import { ApiService } from '../apiServices';

export type GroceryItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string | null;
  purchased: boolean;
  groceryListId?: number;
};

export interface GroceryListResponse {
  groceryListId: number;
  items: GroceryItem[];
}

export type CreateItemRequest = {
  name: string;
  quantity: number;
  unit: string;
  purchased: boolean;
  groceryListId: number;
};

export type UpdateItemRequest = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  purchased: boolean;
};

export interface DeleteItemsRequest {
  itemIds: number[];
}

export class GroceryListAPI {
  /**
   * 장바구니 조회 (토큰 갱신 자동 처리)
   */
  static async getGroceryList(
    groceryListId: number,
  ): Promise<GroceryListResponse> {
    const response = await ApiService.apiCall<any>(`/grocery/${groceryListId}`);
    return response.result || response;
  }

  /**
   * 장바구니 아이템 추가 - POST /grocery/item
   */
  static async createItem(itemData: CreateItemRequest): Promise<GroceryItem> {
    const response: any = await ApiService.apiCall<any>('/grocery/item', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    return response.result || response;
  }

  /**
   * 장바구니 아이템 수정 (일괄) - PATCH /grocery/{groceryListId}/update
   */
  static async updateItems(
    groceryListId: number,
    items: UpdateItemRequest[],
  ): Promise<any> {
    const response: any = await ApiService.apiCall<any>(
      `/grocery/${groceryListId}/update`,
      {
        method: 'PATCH',
        body: JSON.stringify(items),
      },
    );
    return response.result || response;
  }

  /**
   * 장바구니 아이템 삭제 - DELETE /grocery/{groceryListId}/delete
   */
  static async deleteItems(
    groceryListId: number,
    itemIds: number[],
  ): Promise<void> {
    (await ApiService.apiCall)<void>(`/grocery/${groceryListId}/delete`, {
      method: 'DELETE',
      body: JSON.stringify({ itemIds }),
    });
  }

  /**
   * 단일 아이템 수정 (즉시 반영용)
   */
  static async updateSingleItem(
    groceryListId: number,
    item: UpdateItemRequest,
  ): Promise<any> {
    return await this.updateItems(groceryListId, [item]);
  }

  /**
   * 단일 아이템 삭제
   */
  static async deleteSingleItem(
    groceryListId: number,
    itemId: number,
  ): Promise<void> {
    return await this.deleteItems(groceryListId, [itemId]);
  }

  /**
   * 체크된 아이템들만 일괄 업데이트 (편집 모드 완료 시)
   */
  static async updateCheckedItems(
    groceryListId: number,
    items: UpdateItemRequest[],
  ): Promise<any> {
    console.log('[GroceryListAPI] 체크된 아이템 일괄 업데이트:', items.length);
    return await this.updateItems(groceryListId, items);
  }
}
