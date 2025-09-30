import Config from 'react-native-config';
import { getValidAccessToken } from '../../utils/authUtils';

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
   * 공통 API 호출 헬퍼
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const token = await getValidAccessToken();
      console.log('[GroceryListAPI] 사용 토큰:', token?.substring(0, 50));

      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const url = `${Config.API_BASE_URL}${endpoint}`;
      console.log(`[GroceryListAPI] 요청: ${options.method || 'GET'} ${url}`);

      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[GroceryListAPI] 응답: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GroceryListAPI] 에러 응답:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();
        console.log(
          `[GroceryListAPI] JSON 응답:`,
          JSON.stringify(jsonResponse, null, 2),
        );
        return jsonResponse;
      } else {
        const text = await response.text();
        return text as unknown as T;
      }
    } catch (error) {
      console.error(`[GroceryListAPI] 요청 실패 ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * 장바구니 조회 - GET /grocery/{groceryListId}
   */
  static async getGroceryList(groceryListId: number): Promise<any> {
    console.log('[GroceryListAPI] 장바구니 조회:', groceryListId);
    const response: any = await this.makeRequest(`/grocery/${groceryListId}`, {
      method: 'GET',
    });

    // 응답 구조가 { result: { groceryListId, items } } 형태일 경우 처리
    return response.result || response;
  }

  /**
   * 장바구니 아이템 추가 - POST /grocery/item
   */
  static async createItem(itemData: CreateItemRequest): Promise<GroceryItem> {
    console.log('[GroceryListAPI] 아이템 추가:', itemData);
    const response: any = await this.makeRequest('/grocery/item', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });

    // 응답 구조가 { result: { id, name, ... } } 형태일 경우 처리
    return response.result || response;
  }

  /**
   * 장바구니 아이템 수정 (일괄) - PATCH /grocery/{groceryListId}/update
   */
  static async updateItems(
    groceryListId: number,
    items: UpdateItemRequest[],
  ): Promise<any> {
    console.log('[GroceryListAPI] 아이템 일괄 수정:', { groceryListId, items });
    const response: any = await this.makeRequest(
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
    console.log('[GroceryListAPI] 아이템 삭제:', { groceryListId, itemIds });
    await this.makeRequest<void>(`/grocery/${groceryListId}/delete`, {
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
