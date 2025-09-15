import { useState, useEffect } from 'react';
import { FridgeStorage, ItemCategoryStorage } from '../utils/AsyncStorageUtils';

export type FridgeItem = {
  id: string;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  itemCategory: string;
  fridgeId: string;
  unit?: string;
};

// 허용되는 단위 목록
export const ALLOWED_UNITS = ['kg', 'g', 'L', 'ml', '개'] as const;
export type UnitType = (typeof ALLOWED_UNITS)[number];
export const batchDeleteItems = async (itemIds: string[]): Promise<void> => {
  if (isApiAvailable()) {
    try {
      await IngredientControllerAPI.batchDeleteIngredients(itemIds);
      console.log(`API를 통해 ${itemIds.length}개 아이템 배치 삭제 완료`);
    } catch (error) {
      console.error('API 배치 삭제 실패:', error);
      throw error;
    }
  } else {
    // AsyncStorage fallback
    try {
      const existingItems = await getFridgeItemsFromStorage();
      const updatedItems = existingItems.filter(
        item => !itemIds.includes(item.id),
      );
      await AsyncStorage.setItem(
        FRIDGE_ITEMS_KEY,
        JSON.stringify(updatedItems),
      );
      console.log(
        `AsyncStorage를 통해 ${itemIds.length}개 아이템 배치 삭제 완료`,
      );
    } catch (error) {
      console.error('AsyncStorage 배치 삭제 실패:', error);
      throw error;
    }
  }
};

export const useFridgeData = (fridgeId: string) => {
  // 식재료 카테고리 목록 (보관분류 제거)
  const [itemCategories, setItemCategories] = useState<string[]>([]);

  // 실제 냉장고 아이템들을 상태로 관리
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // AsyncStorage에서 데이터 로드
  const loadFridgeData = async () => {
    try {
      setLoading(true);

      // 냉장고 아이템과 카테고리를 병렬로 로드
      const [items, categories] = await Promise.all([
        FridgeStorage.getFridgeItemsByFridgeId(fridgeId),
        ItemCategoryStorage.getItemCategories(),
      ]);

      setFridgeItems(items);
      setItemCategories(categories);
    } catch (error) {
      console.error('냉장고 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // fridgeId가 변경될 때 실제 데이터 로드
  useEffect(() => {
    loadFridgeData();
  }, [fridgeId]);

  // 아이템 삭제 함수 (AsyncStorage와 동기화)
  const deleteItem = async (itemId: number) => {
    try {
      await FridgeStorage.deleteFridgeItem(itemId);
      setFridgeItems(prev =>
        prev.filter(item => parseInt(item.id, 10) !== itemId),
      );
    } catch (error) {
      console.error('아이템 삭제 실패:', error);
      throw error;
    }
  };

  // 아이템 개수 변경 함수 (AsyncStorage와 동기화)
  const updateItemQuantity = async (itemId: number, newQuantity: string) => {
    try {
      await FridgeStorage.updateItemQuantity(itemId, newQuantity);
      setFridgeItems(prev =>
        prev.map(item =>
          parseInt(item.id, 10) === itemId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
    } catch (error) {
      console.error('수량 업데이트 실패:', error);
      throw error;
    }
  };

  // 아이템 단위 변경 함수 (허용된 단위만, AsyncStorage와 동기화)
  const updateItemUnit = async (itemId: number, newUnit: UnitType) => {
    if (!ALLOWED_UNITS.includes(newUnit)) {
      console.warn(`허용되지 않은 단위입니다: ${newUnit}`);
      return;
    }

    try {
      await FridgeStorage.updateItemUnit(itemId, newUnit);
      setFridgeItems(prev =>
        prev.map(item =>
          parseInt(item.id, 10) === itemId ? { ...item, unit: newUnit } : item,
        ),
      );
    } catch (error) {
      console.error('단위 업데이트 실패:', error);
      throw error;
    }
  };

  // 아이템 소비기한 변경 함수 (AsyncStorage와 동기화)
  const updateItemExpiryDate = async (itemId: number, newDate: string) => {
    try {
      await FridgeStorage.updateItemExpiryDate(itemId, newDate);
      setFridgeItems(prev =>
        prev.map(item =>
          parseInt(item.id, 10) === itemId
            ? { ...item, expiryDate: newDate }
            : item,
        ),
      );
    } catch (error) {
      console.error('소비기한 업데이트 실패:', error);
      throw error;
    }
  };

  // 새 아이템 추가 함수 (AsyncStorage와 동기화)
  const addItem = async (newItem: Omit<FridgeItem, 'id'>) => {
    // 단위 검증
    if (newItem.unit && !ALLOWED_UNITS.includes(newItem.unit as UnitType)) {
      throw new Error(
        `허용되지 않은 단위입니다: ${
          newItem.unit
        }. 사용 가능한 단위: ${ALLOWED_UNITS.join(', ')}`,
      );
    }

    try {
      const addedItem = await FridgeStorage.addFridgeItem(newItem);
      setFridgeItems(prev => [...prev, addedItem]);
      return addedItem;
    } catch (error) {
      console.error('아이템 추가 실패:', error);
      throw error;
    }
  };

  // 카테고리 업데이트 함수 (AsyncStorage와 동기화)
  const updateItemCategories = async (newCategories: string[]) => {
    try {
      await ItemCategoryStorage.saveItemCategories(newCategories);
      setItemCategories(newCategories);
    } catch (error) {
      console.error('카테고리 업데이트 실패:', error);
      throw error;
    }
  };

  return {
    fridgeItems,
    itemCategories,
    loading,
    setItemCategories: updateItemCategories,
    deleteItem,
    updateItemQuantity,
    updateItemUnit,
    updateItemExpiryDate,
    addItem,
    allowedUnits: ALLOWED_UNITS,
    refreshData: loadFridgeData,
    batchDeleteItems,
  };
};
