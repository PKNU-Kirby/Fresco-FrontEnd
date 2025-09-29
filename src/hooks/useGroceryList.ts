// hooks/useGroceryList.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GroceryListAPI,
  GroceryItem,
  UpdateItemRequest,
} from '../services/API/GroceryListAPI';
import { CartItem } from '../screens/ShoppingListScreen';

const STORAGE_KEY = '@shopping_cart_items';

export const useGroceryList = (groceryListId: number | null) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 서버에서 데이터 로드
  const loadFromServer = useCallback(async () => {
    if (!groceryListId) return;

    try {
      setIsLoading(true);
      console.log('[useGroceryList] 서버에서 데이터 로드:', groceryListId);

      const response = await GroceryListAPI.getGroceryList(groceryListId);

      // API 응답을 CartItem 형식으로 변환
      const items: CartItem[] = (
        response.result?.items ||
        response.items ||
        []
      ).map((item, index) => ({
        id: item.id.toString(),
        groceryListId: item.groceryListId.toString(),
        name: item.name,
        quantity: item.quantity,
        purchased: item.purchased,
        unit: 'g', // 기본 단위 (FE에서만 관리)
        order: index,
      }));

      // 정렬: 구매하지 않은 항목이 먼저
      const sortedItems = items.sort((a, b) => {
        if (a.purchased !== b.purchased) {
          return a.purchased ? 1 : -1;
        }
        return a.order - b.order;
      });

      setCartItems(sortedItems);

      // 로컬 스토리지에도 저장
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sortedItems));

      console.log('[useGroceryList] 데이터 로드 완료:', sortedItems.length);
    } catch (error) {
      console.error('[useGroceryList] 서버 데이터 로드 실패:', error);
      // 실패 시 로컬 스토리지에서 로드
      await loadFromLocal();
      Alert.alert('알림', '서버와 연결할 수 없어 로컬 데이터를 불러왔습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [groceryListId]);

  // 로컬 스토리지에서 데이터 로드
  const loadFromLocal = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        setCartItems(items);
      }
    } catch (error) {
      console.error('[useGroceryList] 로컬 데이터 로드 실패:', error);
    }
  }, []);

  // 로컬 스토리지에 저장
  const saveToLocal = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('[useGroceryList] 로컬 저장 실패:', error);
    }
  };

  // 초기 로드
  useEffect(() => {
    if (groceryListId) {
      loadFromServer();
    } else {
      loadFromLocal();
    }
  }, [groceryListId, loadFromServer, loadFromLocal]);

  // 아이템 추가 (즉시 서버 동기화)
  const addItem = async (name: string, quantity: number, unit: string) => {
    if (!groceryListId) {
      Alert.alert('오류', '장바구니 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setIsSyncing(true);

      // 서버에 추가 요청
      const newItem = await GroceryListAPI.createItem({
        name: name.trim(),
        quantity,
        purchased: false,
        groceryListId,
      });

      // 로컬 상태 업데이트
      const cartItem: CartItem = {
        id: newItem.id.toString(),
        groceryListId: newItem.groceryListId.toString(),
        name: newItem.name,
        quantity: newItem.quantity,
        purchased: newItem.purchased,
        unit,
        order: cartItems.filter(item => !item.purchased).length,
      };

      const updatedItems = [...cartItems, cartItem].sort((a, b) => {
        if (a.purchased !== b.purchased) {
          return a.purchased ? 1 : -1;
        }
        return a.order - b.order;
      });

      setCartItems(updatedItems);
      await saveToLocal(updatedItems);

      console.log('[useGroceryList] 아이템 추가 완료:', newItem);
    } catch (error) {
      console.error('[useGroceryList] 아이템 추가 실패:', error);
      Alert.alert('오류', '아이템 추가에 실패했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 단일 아이템 업데이트 (즉시 서버 동기화)
  const updateSingleItem = async (
    itemId: string,
    updates: Partial<CartItem>,
  ) => {
    if (!groceryListId) return;

    try {
      setIsSyncing(true);

      const item = cartItems.find(i => i.id === itemId);
      if (!item) return;

      const updatedItem: UpdateItemRequest = {
        id: Number(itemId),
        name: updates.name ?? item.name,
        quantity: updates.quantity ?? item.quantity,
        purchased: updates.purchased ?? item.purchased,
      };

      await GroceryListAPI.updateSingleItem(groceryListId, updatedItem);

      // 로컬 상태 업데이트
      const updatedItems = cartItems.map(i =>
        i.id === itemId ? { ...i, ...updates } : i,
      );

      const sortedItems = updatedItems.sort((a, b) => {
        if (a.purchased !== b.purchased) {
          return a.purchased ? 1 : -1;
        }
        return a.order - b.order;
      });

      setCartItems(sortedItems);
      await saveToLocal(sortedItems);

      console.log('[useGroceryList] 아이템 업데이트 완료:', itemId);
    } catch (error) {
      console.error('[useGroceryList] 아이템 업데이트 실패:', error);
      Alert.alert('오류', '아이템 수정에 실패했습니다.');
      // 실패 시 서버에서 다시 로드
      await loadFromServer();
    } finally {
      setIsSyncing(false);
    }
  };

  // 여러 아이템 일괄 업데이트 (편집 모드 완료 시)
  const updateMultipleItems = async (
    updates: Array<{ id: string; updates: Partial<CartItem> }>,
  ) => {
    if (!groceryListId) return;

    try {
      setIsSyncing(true);

      const updateRequests: UpdateItemRequest[] = updates.map(
        ({ id, updates }) => {
          const item = cartItems.find(i => i.id === id)!;
          return {
            id: Number(id),
            name: updates.name ?? item.name,
            quantity: updates.quantity ?? item.quantity,
            purchased: updates.purchased ?? item.purchased,
          };
        },
      );

      await GroceryListAPI.updateItems(groceryListId, updateRequests);

      // 로컬 상태 업데이트
      const updatedItems = cartItems.map(item => {
        const update = updates.find(u => u.id === item.id);
        return update ? { ...item, ...update.updates } : item;
      });

      setCartItems(updatedItems);
      await saveToLocal(updatedItems);

      console.log('[useGroceryList] 일괄 업데이트 완료:', updates.length);
    } catch (error) {
      console.error('[useGroceryList] 일괄 업데이트 실패:', error);
      Alert.alert('오류', '아이템 수정에 실패했습니다.');
      await loadFromServer();
    } finally {
      setIsSyncing(false);
    }
  };

  // 아이템 삭제 (즉시 서버 동기화)
  const deleteItem = async (itemId: string) => {
    if (!groceryListId) return;

    try {
      setIsSyncing(true);

      await GroceryListAPI.deleteSingleItem(groceryListId, Number(itemId));

      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      await saveToLocal(updatedItems);

      console.log('[useGroceryList] 아이템 삭제 완료:', itemId);
    } catch (error) {
      console.error('[useGroceryList] 아이템 삭제 실패:', error);
      Alert.alert('오류', '아이템 삭제에 실패했습니다.');
      await loadFromServer();
    } finally {
      setIsSyncing(false);
    }
  };

  // 체크된 아이템 일괄 삭제
  const deleteCheckedItems = async () => {
    if (!groceryListId) return;

    const checkedItems = cartItems.filter(item => item.purchased);
    if (checkedItems.length === 0) return;

    try {
      setIsSyncing(true);

      const itemIds = checkedItems.map(item => Number(item.id));
      await GroceryListAPI.deleteItems(groceryListId, itemIds);

      const updatedItems = cartItems.filter(item => !item.purchased);
      setCartItems(updatedItems);
      await saveToLocal(updatedItems);

      console.log('[useGroceryList] 체크된 아이템 삭제 완료:', itemIds.length);
    } catch (error) {
      console.error('[useGroceryList] 체크된 아이템 삭제 실패:', error);
      Alert.alert('오류', '아이템 삭제에 실패했습니다.');
      await loadFromServer();
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    cartItems,
    isLoading,
    isSyncing,
    addItem,
    updateSingleItem,
    updateMultipleItems,
    deleteItem,
    deleteCheckedItems,
    refresh: loadFromServer,
  };
};
