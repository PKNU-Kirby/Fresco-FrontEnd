import { useState, useEffect } from 'react';
import {
  AsyncStorageService,
  FridgeItem,
} from '../services/AsyncStorageService';

// Units
export const ALLOWED_UNITS = ['개', 'kg', 'g', 'L', 'ml'] as const;
export type UnitType = (typeof ALLOWED_UNITS)[number];
export type { FridgeItem };

export const useFridgeData = (fridgeId: number) => {
  // 식재료 카테고리 목록
  const [itemCategories, setItemCategories] = useState<string[]>([]);

  // 실제 냉장고 아이템들을 상태로 관리
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AsyncStorage에서 데이터 로드
  const loadFridgeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 냉장고 아이템과 카테고리 로드
      const [items, categories] = await Promise.all([
        AsyncStorageService.getFridgeItemsByFridgeId(fridgeId),
        AsyncStorageService.getItemCategories(),
      ]);

      setFridgeItems(items);
      setItemCategories(categories);

      console.log(
        `냉장고 ${fridgeId} 데이터 로드 완료: ${items.length}개 아이템`,
      );
    } catch (err) {
      console.error('냉장고 데이터 로드 실패:', err);
      setError('냉장고 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // fridgeId가 변경될 때 실제 데이터 로드
  useEffect(() => {
    if (fridgeId) {
      loadFridgeData();
    }
  }, [fridgeId]);

  // 아이템 삭제 함수 (AsyncStorage와 동기화)
  const deleteItem = async (itemId: number) => {
    try {
      await AsyncStorageService.deleteFridgeItem(itemId);
      setFridgeItems(prev => prev.filter(item => item.id !== itemId));
      console.log(`아이템 삭제 완료: ${itemId}`);
    } catch (err) {
      console.error('아이템 삭제 실패:', err);
      throw err;
    }
  };

  // 아이템 개수 변경 함수 (AsyncStorage와 동기화)
  const updateItemQuantity = async (itemId: number, newQuantity: string) => {
    try {
      // 로컬 상태 즉시 업데이트 (UX 개선)
      setFridgeItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );

      // AsyncStorage 업데이트
      const targetItem = fridgeItems.find(item => item.id === itemId);
      if (targetItem) {
        await AsyncStorageService.updateFridgeItem({
          ...targetItem,
          quantity: newQuantity,
        });
      }

      console.log(`수량 업데이트 완료: ${itemId} -> ${newQuantity}`);
    } catch (err) {
      console.error('수량 업데이트 실패:', err);
      // 실패시 원래 상태로 복구
      await loadFridgeData();
      throw err;
    }
  };

  // 아이템 단위 변경 함수 (허용된 단위만, AsyncStorage와 동기화)
  const updateItemUnit = async (itemId: number, newUnit: UnitType) => {
    if (!ALLOWED_UNITS.includes(newUnit)) {
      console.warn(`허용되지 않은 단위입니다: ${newUnit}`);
      throw new Error(`허용되지 않은 단위: ${newUnit}`);
    }

    try {
      // 로컬 상태 즉시 업데이트
      setFridgeItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, unit: newUnit } : item,
        ),
      );

      // AsyncStorage 업데이트
      const targetItem = fridgeItems.find(item => item.id === itemId);
      if (targetItem) {
        await AsyncStorageService.updateFridgeItem({
          ...targetItem,
          unit: newUnit,
        });
      }

      console.log(`단위 업데이트 완료: ${itemId} -> ${newUnit}`);
    } catch (err) {
      console.error('단위 업데이트 실패:', err);
      // 실패시 원래 상태로 복구
      await loadFridgeData();
      throw err;
    }
  };

  // 아이템 소비기한 변경 함수 (AsyncStorage와 동기화)
  const updateItemExpiryDate = async (itemId: number, newDate: string) => {
    try {
      // 로컬 상태 즉시 업데이트
      setFridgeItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, expiryDate: newDate } : item,
        ),
      );

      // AsyncStorage 업데이트
      const targetItem = fridgeItems.find(item => item.id === itemId);
      if (targetItem) {
        await AsyncStorageService.updateFridgeItem({
          ...targetItem,
          expiryDate: newDate,
        });
      }

      console.log(`소비기한 업데이트 완료: ${itemId} -> ${newDate}`);
    } catch (err) {
      console.error('소비기한 업데이트 실패:', err);
      // 실패시 원래 상태로 복구
      await loadFridgeData();
      throw err;
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
      const addedItem = await AsyncStorageService.addFridgeItem({
        ...newItem,
        fridgeId, // 현재 냉장고 ID 보장
      });

      setFridgeItems(prev => [...prev, addedItem]);
      console.log(`아이템 추가 완료: ${addedItem.name} (ID: ${addedItem.id})`);

      return addedItem;
    } catch (err) {
      console.error('아이템 추가 실패:', err);
      throw err;
    }
  };

  // 아이템 전체 업데이트 함수
  const updateItem = async (updatedItem: FridgeItem) => {
    try {
      await AsyncStorageService.updateFridgeItem(updatedItem);
      setFridgeItems(prev =>
        prev.map(item => (item.id === updatedItem.id ? updatedItem : item)),
      );
      console.log(
        `아이템 업데이트 완료: ${updatedItem.name} (ID: ${updatedItem.id})`,
      );
    } catch (err) {
      console.error('아이템 업데이트 실패:', err);
      throw err;
    }
  };

  // 카테고리 업데이트 함수 (현재 사용하지 않지만 호환성 유지)
  const updateItemCategories = async (newCategories: string[]) => {
    try {
      // TODO: 카테고리 저장 로직이 AsyncStorageService에 없음 - 추후 구현 필요
      setItemCategories(newCategories);
      console.log('카테고리 업데이트 완료');
    } catch (err) {
      console.error('카테고리 업데이트 실패:', err);
      throw err;
    }
  };

  // 통계 정보 계산
  const getItemStats = () => {
    const now = new Date();
    const expiredItems = fridgeItems.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate < now;
    });

    const expiringSoonItems = fridgeItems.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      const daysDiff = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysDiff <= 3 && daysDiff >= 0;
    });

    return {
      totalItems: fridgeItems.length,
      expiredItems: expiredItems.length,
      expiringSoonItems: expiringSoonItems.length,
      categories: [...new Set(fridgeItems.map(item => item.itemCategory))]
        .length,
    };
  };

  // 카테고리별 아이템 그룹핑
  const getItemsByCategory = () => {
    return fridgeItems.reduce((acc, item) => {
      const category = item.itemCategory || '기타';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, FridgeItem[]>);
  };

  return {
    // 데이터
    fridgeItems,
    itemCategories,
    loading,
    error,

    // 통계
    itemStats: getItemStats(),
    itemsByCategory: getItemsByCategory(),

    // 액션 함수들
    deleteItem,
    updateItemQuantity,
    updateItemUnit,
    updateItemExpiryDate,
    addItem,
    updateItem,

    // 유틸리티
    allowedUnits: ALLOWED_UNITS,
    refreshData: loadFridgeData,
    setItemCategories: updateItemCategories,
  };
};
