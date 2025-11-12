import { useState, useCallback, useEffect } from 'react';
import { GroceryListAPI, GroceryItem } from '../services/API/GroceryListAPI';

export const useGroceryList = (groceryListId: number | null) => {
  const [cartItems, setCartItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadItemsInternal = async () => {
    if (!groceryListId) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await GroceryListAPI.getGroceryList(groceryListId);
      setCartItems(response.items || []);
    } catch (error) {
      // console.error('[useGroceryList] 로드 실패', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItemsInternal();
  }, [groceryListId]);

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
        await loadItemsInternal();
      } catch (error) {
        // console.error('[useGroceryList] 추가 실패', error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    [groceryListId],
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
        await loadItemsInternal();
      } catch (error) {
        // console.error('[useGroceryList] 업데이트 실패 ', error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    [groceryListId, cartItems],
  );

  // 여러 아이템 일괄 업데이트
  const updateMultipleItems = useCallback(
    async (updates: Array<{ id: number; updates: Partial<GroceryItem> }>) => {
      if (!groceryListId) return;

      try {
        setIsSyncing(true);

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

        // console.log('[useGroceryList] 일괄 업데이트 완료');
        await loadItemsInternal();
      } catch (error) {
        // console.error('[useGroceryList] 일괄 업데이트 실패', error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    [groceryListId, cartItems],
  );

  // 아이템 삭제
  const deleteItem = useCallback(
    async (itemId: number) => {
      if (!groceryListId) return;

      try {
        setIsSyncing(true);
        await GroceryListAPI.deleteSingleItem(groceryListId, itemId);
        await loadItemsInternal();
      } catch (error) {
        // console.error('[useGroceryList] 삭제 실패', error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    [groceryListId],
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
        await loadItemsInternal();
      }
    } catch (error) {
      // console.error('[useGroceryList] 체크된 아이템 삭제 실패', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [groceryListId, cartItems]);

  const refresh = useCallback(async () => {
    await loadItemsInternal();
  }, [groceryListId]);

  return {
    cartItems,
    isLoading,
    isSyncing,
    addItem,
    updateSingleItem,
    updateMultipleItems,
    deleteItem,
    deleteCheckedItems,
    refresh,
  };
};
