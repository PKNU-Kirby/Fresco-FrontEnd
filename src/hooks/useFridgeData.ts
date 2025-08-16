import { useState, useEffect, useCallback } from 'react';
import {
  getFridgeItemsByFridgeId,
  deleteItemFromFridge,
  updateFridgeItem,
  type FridgeItem,
} from '../utils/fridgeStorage';

export { type FridgeItem };

export const useFridgeData = (fridgeId: number) => {
  // 보관 분류 목록
  const [storageTypes, setStorageTypes] = useState<string[]>([
    '전체',
    '냉장',
    '냉동',
    '실온',
  ]);

  // 식재료 카테고리 목록
  const [itemCategories, setItemCategories] = useState([
    '전체',
    '베이커리',
    '채소 / 과일',
    '정육 / 계란',
    '가공식품',
    '수산 / 건어물',
    '쌀 / 잡곡',
    '우유 / 유제품',
    '건강식품',
    '장 / 양념 / 소스',
    '기타',
  ]);

  // 실제 냉장고 아이템들을 상태로 관리
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  // 실제 데이터 로드 함수
  const loadFridgeItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await getFridgeItemsByFridgeId(fridgeId);
      setFridgeItems(items);
      console.log(
        `useFridgeData: 냉장고 ${fridgeId}에서 ${items.length}개 아이템 로드`,
      );
    } catch (error) {
      console.error('useFridgeData: 아이템 로드 실패:', error);
      // 에러 발생시 빈 배열로 설정
      setFridgeItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [fridgeId]);

  // fridgeId가 변경될 때 실제 데이터 로드
  useEffect(() => {
    loadFridgeItems();
  }, [loadFridgeItems]);

  // 아이템 삭제 함수 (실제 저장소에서 삭제)
  const deleteItem = useCallback(async (itemId: number) => {
    try {
      await deleteItemFromFridge(itemId);
      // 로컬 상태에서도 제거
      setFridgeItems(prev => prev.filter(item => item.id !== itemId));
      console.log(`useFridgeData: 아이템 ${itemId} 삭제 완료`);
    } catch (error) {
      console.error('useFridgeData: 아이템 삭제 실패:', error);
      throw error;
    }
  }, []);

  // 아이템 수량 변경 함수 (실제 저장소 업데이트)
  const updateItemQuantity = useCallback(
    async (itemId: number, newQuantity: string) => {
      try {
        await updateFridgeItem(itemId, { quantity: newQuantity });
        // 로컬 상태도 업데이트
        setFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item,
          ),
        );
        console.log(
          `useFridgeData: 아이템 ${itemId} 수량 변경: ${newQuantity}`,
        );
      } catch (error) {
        console.error('useFridgeData: 수량 업데이트 실패:', error);
        throw error;
      }
    },
    [],
  );

  // 아이템 단위 변경 함수 (실제 저장소 업데이트)
  const updateItemUnit = useCallback(
    async (itemId: number, newUnit: string) => {
      try {
        await updateFridgeItem(itemId, { unit: newUnit });
        // 로컬 상태도 업데이트
        setFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, unit: newUnit } : item,
          ),
        );
        console.log(`useFridgeData: 아이템 ${itemId} 단위 변경: ${newUnit}`);
      } catch (error) {
        console.error('useFridgeData: 단위 업데이트 실패:', error);
        throw error;
      }
    },
    [],
  );

  // 아이템 소비기한 변경 함수 (실제 저장소 업데이트)
  const updateItemExpiryDate = useCallback(
    async (itemId: number, newDate: string) => {
      try {
        await updateFridgeItem(itemId, { expiryDate: newDate });
        // 로컬 상태도 업데이트
        setFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, expiryDate: newDate } : item,
          ),
        );
        console.log(`useFridgeData: 아이템 ${itemId} 만료일 변경: ${newDate}`);
      } catch (error) {
        console.error('useFridgeData: 만료일 업데이트 실패:', error);
        throw error;
      }
    },
    [],
  );

  // 데이터 새로고침 함수 (외부에서 호출 가능)
  const refreshData = useCallback(() => {
    loadFridgeItems();
  }, [loadFridgeItems]);

  return {
    fridgeItems,
    storageTypes,
    setStorageTypes,
    itemCategories,
    setItemCategories,
    deleteItem,
    updateItemQuantity,
    updateItemUnit,
    updateItemExpiryDate,
    refreshData,
  };
};
