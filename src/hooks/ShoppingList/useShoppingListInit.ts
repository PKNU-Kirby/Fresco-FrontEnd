import { useState, useEffect } from 'react';
import { FridgeControllerAPI } from '../../services/API/fridgeControllerAPI';

interface UseShoppingListInitResult {
  groceryListId: number | null;
  isInitializing: boolean;
  showError: (title: string, message: string) => void;
}

export const useShoppingListInit = (
  fridgeId: number,
  onError: (title: string, message: string) => void,
): UseShoppingListInitResult => {
  const [groceryListId, setGroceryListId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const fetchGroceryListId = async () => {
      try {
        setIsInitializing(true);
        const response = await FridgeControllerAPI.getList();

        const fridges = Array.isArray(response)
          ? response
          : response?.result || response?.data || [];

        if (!Array.isArray(fridges)) {
          onError('오류', '냉장고 목록 형식이 올바르지 않습니다.');
          return;
        }

        const currentFridge =
          fridges.find((f: any) => f.id === fridgeId) ||
          fridges.find((f: any) => Number(f.id) === Number(fridgeId));

        if (currentFridge?.groceryListId) {
          setGroceryListId(currentFridge.groceryListId);
        } else {
          onError('오류', '장바구니 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        onError('오류', '장바구니 정보를 불러올 수 없습니다.');
      } finally {
        setIsInitializing(false);
      }
    };

    fetchGroceryListId();
  }, [fridgeId, onError]);

  return {
    groceryListId,
    isInitializing,
    showError: onError,
  };
};
