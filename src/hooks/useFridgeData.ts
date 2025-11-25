import { useState, useEffect, useCallback } from 'react';
import { ItemCategoryStorage } from '../utils/AsyncStorageUtils';
import {
  getFridgeItemsByFridgeId,
  deleteItemFromFridge,
  updateFridgeItem,
  type FridgeItem,
} from '../utils/fridgeStorage';
import { UsageTrackingService } from '../services/UsageTrackingService';
import { IngredientControllerAPI } from '../services/API/ingredientControllerAPI';

// 허용되는 단위 목록
export const ALLOWED_UNITS = ['kg', 'g', 'L', 'ml', '개'] as const;
export type UnitType = (typeof ALLOWED_UNITS)[number];

export const useFridgeData = (fridgeId: number) => {
  // 식재료 카테고리 목록
  const [itemCategories, setItemCategories] = useState<string[]>([]);
  // API에서 가져온 냉장고 아이템들
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 카테고리별 필터링을 위한 카테고리 ID 매핑
  const getCategoryIds = useCallback((categoryName: string): number[] => {
    if (categoryName === '전체') {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }

    const categoryMap: { [key: string]: number } = {
      베이커리: 1,
      '채소 / 과일': 2,
      '정육 / 계란': 3,
      가공식품: 4,
      '수산 / 건어물': 5,
      '쌀 / 잡곡': 6,
      '주류 / 음료': 7,
      '우유 / 유제품': 8,
      건강식품: 9,
      '장 / 양념 / 소스': 10,
    };

    const categoryId = categoryMap[categoryName];
    return categoryId ? [categoryId] : [];
  }, []);

  // API에서 데이터 로드
  const loadFridgeData = useCallback(
    async (categoryFilter: string = '전체') => {
      try {
        setLoading(true);
        setError(null);

        // 카테고리와 아이템을 병렬로 로드
        const [categories] = await Promise.all([
          ItemCategoryStorage.getItemCategories(),
        ]);

        // 카테고리 설정
        const categoriesWithAll = categories.includes('전체')
          ? categories
          : ['전체', ...categories];
        setItemCategories(categoriesWithAll);

        // API에서 아이템 로드 (카테고리 필터링 포함)
        const categoryIds = getCategoryIds(categoryFilter);
        const items = await getFridgeItemsByFridgeId(fridgeId, categoryIds);
        setFridgeItems(items);

        // console.log(`냉장고 ${fridgeId}의 아이템 로드 완료:`, items);
      } catch (error) {
        // console.error('냉장고 데이터 로드 실패:', error);
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fridgeId, getCategoryIds],
  );

  // fridgeId가 변경될 때 데이터 로드
  useEffect(() => {
    if (fridgeId) {
      loadFridgeData();
    }
  }, [fridgeId, loadFridgeData]);

  // 단일 아이템 삭제 함수 (API 사용)
  const deleteItem = useCallback(
    async (itemId: number) => {
      try {
        const currentItem = fridgeItems.find(item => item.id === itemId);

        if (!currentItem) {
          throw new Error('삭제할 아이템을 찾을 수 없습니다.');
        }

        // 🔥 1. 수량이 0보다 크면 먼저 PUT으로 0으로 만들기 (사용 기록 생성)
        if (currentItem.quantity > 0) {
          await IngredientControllerAPI.updateRefrigeratorIngredient(itemId, {
            quantity: 0,
            unit: currentItem.unit || '개',
            expirationDate: currentItem.expiryDate,
          });
        }

        // 🔥 2. DELETE로 실제 삭제
        await deleteItemFromFridge(itemId);

        // 삭제 즉시 사용 기록 추가 (로컬)
        await UsageTrackingService.trackItemDeletion(
          itemId,
          currentItem.name,
          currentItem.quantity,
          currentItem.unit || '개',
          fridgeId,
          '완전 소진',
        );

        // 로컬 상태에서 제거
        setFridgeItems(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        // console.error('아이템 삭제 실패:', error);
        throw error;
      }
    },
    [fridgeItems, fridgeId],
  );

  // ✅ 새로 추가: 편집 모드용 로컬 상태 업데이트 함수들
  const updateItemQuantityLocal = useCallback(
    (itemId: number, newQuantity: number) => {
      setFridgeItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    },
    [],
  );

  const updateItemUnitLocal = useCallback(
    (itemId: number, newUnit: UnitType) => {
      if (!ALLOWED_UNITS.includes(newUnit)) {
        // console.warn(`허용되지 않은 단위입니다: ${newUnit}`);
        return;
      }

      setFridgeItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, unit: newUnit } : item,
        ),
      );
    },
    [],
  );

  const updateItemExpiryDateLocal = useCallback(
    (itemId: number, newDate: string) => {
      setFridgeItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, expiryDate: newDate } : item,
        ),
      );
    },
    [],
  );

  // 아이템 수량 변경 함수 (API 사용)
  const updateItemQuantity = useCallback(
    async (itemId: number, newQuantity: number) => {
      try {
        await updateFridgeItem(itemId, { quantity: newQuantity });

        // 로컬 상태 업데이트
        setFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item,
          ),
        );
      } catch (error) {
        // console.error('수량 업데이트 실패:', error);
        throw error;
      }
    },
    [],
  );

  // 아이템 단위 변경 함수 (API 사용)
  const updateItemUnit = useCallback(
    async (itemId: number, newUnit: UnitType) => {
      if (!ALLOWED_UNITS.includes(newUnit)) {
        // console.warn(`허용되지 않은 단위입니다: ${newUnit}`);
        return;
      }

      try {
        await updateFridgeItem(itemId, { unit: newUnit });

        // 로컬 상태 업데이트
        setFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, unit: newUnit } : item,
          ),
        );
      } catch (error) {
        // console.error('단위 업데이트 실패:', error);
        throw error;
      }
    },
    [],
  );

  // 아이템 소비기한 변경 함수 (API 사용)
  const updateItemExpiryDate = useCallback(
    async (itemId: number, newDate: string) => {
      try {
        await updateFridgeItem(itemId, { expiryDate: newDate });

        // 로컬 상태 업데이트
        setFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, expiryDate: newDate } : item,
          ),
        );
      } catch (error) {
        // console.error('소비기한 업데이트 실패:', error);
        throw error;
      }
    },
    [],
  );

  // ✅ 새로 추가: 편집 모드 종료 시 변경사항을 API에 일괄 적용
  const applyEditChanges = useCallback(
    async (editModeStartState: FridgeItem[]) => {
      try {
        // 변경된 아이템들 찾기
        const changedItems = fridgeItems.filter(currentItem => {
          const originalItem = editModeStartState.find(
            item => item.id === currentItem.id,
          );
          if (!originalItem) return false;

          return (
            originalItem.quantity !== currentItem.quantity ||
            (originalItem.unit || '개') !== (currentItem.unit || '개') ||
            originalItem.expiryDate !== currentItem.expiryDate
          );
        });

        // console.log('변경된 아이템들:', changedItems);

        // 변경사항 일괄 적용
        for (const changedItem of changedItems) {
          const originalItem = editModeStartState.find(
            item => item.id === changedItem.id,
          );
          if (!originalItem) continue;

          // API 업데이트
          await updateFridgeItem(changedItem.id, {
            quantity: changedItem.quantity,
            unit: changedItem.unit,
            expiryDate: changedItem.expiryDate,
          });

          // 변경사항 추적
          const changes = [];
          if (originalItem.quantity !== changedItem.quantity) {
            changes.push(
              `수량: ${originalItem.quantity} → ${changedItem.quantity}`,
            );
          }
          if ((originalItem.unit || '개') !== (changedItem.unit || '개')) {
            changes.push(
              `단위: ${originalItem.unit || '개'} → ${
                changedItem.unit || '개'
              }`,
            );
          }
          if (originalItem.expiryDate !== changedItem.expiryDate) {
            changes.push(
              `만료일: ${originalItem.expiryDate} → ${changedItem.expiryDate}`,
            );
          }

          if (changes.length > 0) {
            await UsageTrackingService.trackItemModification(
              changedItem.id,
              changedItem.name,
              changedItem.quantity,
              changedItem.unit || '개',
              fridgeId,
              changes.join(', '),
            );
          }
        }

        return changedItems.length;
      } catch (error) {
        // console.error('편집 변경사항 적용 실패:', error);
        throw error;
      }
    },
    [fridgeItems, fridgeId],
  );

  // 카테고리 업데이트 함수
  const updateItemCategories = useCallback(async (newCategories: string[]) => {
    try {
      await ItemCategoryStorage.saveItemCategories(newCategories);
      setItemCategories(newCategories);
    } catch (error) {
      // console.error('카테고리 업데이트 실패:', error);
      throw error;
    }
  }, []);

  // 카테고리 필터링으로 데이터 새로고침
  const refreshWithCategory = useCallback(
    (categoryName: string) => {
      loadFridgeData(categoryName);
    },
    [loadFridgeData],
  );

  return {
    fridgeItems,
    itemCategories,
    loading,
    error,
    setItemCategories: updateItemCategories,
    deleteItem,
    updateItemQuantity,
    updateItemUnit,
    updateItemExpiryDate,
    updateItemQuantityLocal,
    updateItemUnitLocal,
    updateItemExpiryDateLocal,
    applyEditChanges,
    allowedUnits: ALLOWED_UNITS,
    refreshData: loadFridgeData,
    refreshWithCategory,
  };
};
