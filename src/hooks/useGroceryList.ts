import { useState, useCallback, useEffect } from 'react';
import { GroceryListAPI, GroceryItem } from '../services/API/GroceryListAPI';

export const useGroceryList = (groceryListId: number | null) => {
  const [cartItems, setCartItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 데이터 로드
  const loadItems = useCallback(async () => {
    if (!groceryListId) return;

    try {
      setIsLoading(true);
      const response = await GroceryListAPI.getGroceryList(groceryListId);
      setCartItems(response.items || []);
    } catch (error) {
      console.error('[useGroceryList] 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [groceryListId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // 아이템 추가
  const addItem = useCallback(
    async (name: string, quantity: number, unit: string) => {
      if (!groceryListId) return;

      try {
        setIsSyncing(true);
        await GroceryListAPI.createItem({
          name,
          quantity,
          unit,
          purchased: false,
          groceryListId,
        });
        await loadItems();
      } catch (error) {
        console.error('[useGroceryList] 추가 실패:', error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    [groceryListId, loadItems],
  );

  // 단일 아이템 업데이트
  const updateSingleItem = useCallback(
    async (itemId: number, updates: Partial<GroceryItem>) => {
      if (!groceryListId) return;

      try {
        setIsSyncing(true);
        const item = cartItems.find(i => i.id === itemId);
        if (!item) return;

        await GroceryListAPI.updateSingleItem(groceryListId, {
          id: item.id,
          name: updates.name ?? item.name,
          quantity: updates.quantity ?? item.quantity,
          unit: updates.unit ?? item.unit ?? '',
          purchased: updates.purchased ?? item.purchased,
        });
        await loadItems();
      } catch (error) {
        console.error('[useGroceryList] 업데이트 실패:', error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    [groceryListId, cartItems, loadItems],
  );

  // 🔥 여러 아이템 일괄 업데이트
  const updateMultipleItems = useCallback(
    async (updates: Array<{ id: number; updates: Partial<GroceryItem> }>) => {
      if (!groceryListId) return;

      try {
        setIsSyncing(true);
        console.log(
          '[useGroceryList] 일괄 업데이트 시작:',
          updates.length,
          '개',
        );

        // 각 아이템을 순차적으로 업데이트
        for (const { id, updates: itemUpdates } of updates) {
          const item = cartItems.find(i => i.id === id);
          if (!item) continue;

          await GroceryListAPI.updateSingleItem(groceryListId, {
            id: item.id,
            name: itemUpdates.name ?? item.name,
            quantity: itemUpdates.quantity ?? item.quantity,
            unit: itemUpdates.unit ?? item.unit ?? '',
            purchased: itemUpdates.purchased ?? item.purchased,
          });
        }

        console.log('[useGroceryList] ✅ 일괄 업데이트 완료');
        await loadItems();
      } catch (error) {
        console.error('[useGroceryList] ❌ 일괄 업데이트 실패:', error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    [groceryListId, cartItems, loadItems],
  );

  // 아이템 삭제
  const deleteItem = useCallback(
    async (itemId: number) => {
      if (!groceryListId) return;

      try {
        setIsSyncing(true);
        await GroceryListAPI.deleteSingleItem(groceryListId, itemId);
        await loadItems();
      } catch (error) {
        console.error('[useGroceryList] 삭제 실패:', error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    [groceryListId, loadItems],
  );

  // 체크된 아이템 삭제
  const deleteCheckedItems = useCallback(async () => {
    if (!groceryListId) return;

    try {
      setIsSyncing(true);
      const checkedIds = cartItems
        .filter(item => item.purchased)
        .map(item => item.id);

      if (checkedIds.length > 0) {
        await GroceryListAPI.deleteItems(groceryListId, checkedIds);
        await loadItems();
      }
    } catch (error) {
      console.error('[useGroceryList] 체크된 아이템 삭제 실패:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [groceryListId, cartItems, loadItems]);

  const refresh = useCallback(() => {
    loadItems();
  }, [loadItems]);

  return {
    cartItems,
    isLoading,
    isSyncing,
    addItem,
    updateSingleItem,
    updateMultipleItems, // 👈 추가
    deleteItem,
    deleteCheckedItems,
    refresh,
  };
};
