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

export type RefrigeratorInfo = {
  id: number;
  name: string;
  groceryListId: number;
};

export class GroceryListAPI {
  /**
   * 장바구니 조회
   */
  static async getGroceryList(
    groceryListId: number,
  ): Promise<GroceryListResponse> {
    // ✅ apiCall이 이미 result를 반환하므로 그대로 사용
    return await ApiService.apiCall<GroceryListResponse>(
      `/grocery/${groceryListId}`,
    );
  }

  /**
   * 장바구니 아이템 추가 - POST /grocery/item
   */
  static async createItem(itemData: CreateItemRequest): Promise<GroceryItem> {
    console.log('[GroceryListAPI] 아이템 추가 요청:', itemData);

    // ✅ apiCall이 이미 result를 반환
    const response = await ApiService.apiCall<GroceryItem>('/grocery/item', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });

    console.log('[GroceryListAPI] 아이템 추가 응답:', response);
    return response;
  }

  /**
   * 장바구니 아이템 수정 (일괄) - PATCH /grocery/{groceryListId}/update
   */
  static async updateItems(
    groceryListId: number,
    items: UpdateItemRequest[],
  ): Promise<any> {
    console.log('[GroceryListAPI] 아이템 일괄 수정:', items);

    return await ApiService.apiCall<any>(`/grocery/${groceryListId}/update`, {
      method: 'PATCH',
      body: JSON.stringify(items),
    });
  }

  /**
   * 장바구니 아이템 삭제 - DELETE /grocery/{groceryListId}/delete
   */
  static async deleteItems(
    groceryListId: number,
    itemIds: number[],
  ): Promise<void> {
    console.log('[GroceryListAPI] 아이템 삭제:', itemIds);

    // ✅ 문법 오류 수정
    await ApiService.apiCall<void>(`/grocery/${groceryListId}/delete`, {
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

  /**
   * 냉장고 목록 조회 (장바구니 ID 포함)
   */
  static async getRefrigerators(): Promise<RefrigeratorInfo[]> {
    return await ApiService.apiCall<RefrigeratorInfo[]>('/refrigerator');
  }

  /**
   * 사용자의 장바구니 ID 조회
   */
  static async getGroceryListIdByFridge(fridgeId: number): Promise<number> {
    try {
      console.log('[GroceryListAPI] 장바구니 ID 조회 - fridgeId:', fridgeId);

      const fridges = await this.getRefrigerators();
      const targetFridge = fridges.find(f => f.id === fridgeId);

      if (!targetFridge) {
        throw new Error(`냉장고 ID ${fridgeId}를 찾을 수 없습니다.`);
      }

      if (!targetFridge.groceryListId) {
        throw new Error(`냉장고에 장바구니가 연결되지 않았습니다.`);
      }

      console.log(
        '[GroceryListAPI] ✅ groceryListId:',
        targetFridge.groceryListId,
      );
      return targetFridge.groceryListId;
    } catch (error) {
      console.error('[GroceryListAPI] ❌ 조회 실패:', error);
      throw error;
    }
  }
}
