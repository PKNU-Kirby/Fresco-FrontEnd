// services/GroceryService.ts
import {
  GroceryListAPI,
  CreateItemRequest,
  GroceryItem,
} from './API/GroceryListAPI';
import { AsyncStorageService } from './AsyncStorageService';

export class GroceryService {
  /**
   * 장바구니에 아이템 추가 (AsyncStorage + 서버 동기화)
   */
  static async addItemToGrocery(
    groceryListId: number,
    item: {
      name: string;
      quantity: number;
      unit: string;
    },
  ): Promise<GroceryItem> {
    try {
      console.log('🛒 장바구니 추가 시작:', item);

      // 1. 서버에 먼저 추가
      const requestData: CreateItemRequest = {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        purchased: false,
        groceryListId: groceryListId,
      };

      const serverItem = await GroceryListAPI.createItem(requestData);
      console.log('✅ 서버 추가 성공:', serverItem);

      // 2. AsyncStorage에도 저장 (오프라인 대비)
      try {
        await AsyncStorageService.addToGroceryList(serverItem);
        console.log('✅ 로컬 저장 성공');
      } catch (localError) {
        // console.warn('⚠️ 로컬 저장 실패 (무시):', localError);
        // 서버 저장은 성공했으니 계속 진행
      }

      return serverItem;
    } catch (error) {
      // console.error('❌ 장바구니 추가 실패:', error);

      // 서버 실패 시 AsyncStorage에만 저장 (오프라인 모드)
      console.log('📱 오프라인 모드: 로컬에만 저장');
      const localItem: GroceryItem = {
        id: Date.now(), // 임시 ID
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        purchased: false,
        groceryListId: groceryListId,
      };

      await AsyncStorageService.addToGroceryList(localItem);
      return localItem;
    }
  }

  /**
   * 장바구니 목록 조회 (서버 우선, 실패 시 AsyncStorage)
   */
  static async getGroceryList(groceryListId: number): Promise<GroceryItem[]> {
    try {
      const response = await GroceryListAPI.getGroceryList(groceryListId);

      // AsyncStorage에도 동기화
      await AsyncStorageService.saveGroceryList(response.items);

      return response.items;
    } catch (error) {
      // console.warn('⚠️ 서버 조회 실패, 로컬 데이터 사용:', error);
      return await AsyncStorageService.getGroceryList();
    }
  }

  /**
   * 아이템 삭제 (서버 + AsyncStorage)
   */
  static async deleteItem(
    groceryListId: number,
    itemId: number,
  ): Promise<void> {
    try {
      await GroceryListAPI.deleteSingleItem(groceryListId, itemId);
      await AsyncStorageService.removeFromGroceryList(itemId);
    } catch (error) {
      // console.error('❌ 삭제 실패:', error);
      // 오프라인이면 로컬만 삭제
      await AsyncStorageService.removeFromGroceryList(itemId);
    }
  }

  /**
   * 아이템 구매 상태 변경 (서버 + AsyncStorage)
   */
  static async togglePurchased(
    groceryListId: number,
    item: GroceryItem,
  ): Promise<void> {
    try {
      const updatedItem = {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || '',
        purchased: !item.purchased,
      };

      await GroceryListAPI.updateSingleItem(groceryListId, updatedItem);
      await AsyncStorageService.updateGroceryItem(item.id, {
        purchased: !item.purchased,
      });
    } catch (error) {
      // console.error('❌ 상태 변경 실패:', error);
      // 오프라인이면 로컬만 업데이트
      await AsyncStorageService.updateGroceryItem(item.id, {
        purchased: !item.purchased,
      });
    }
  }
}
