import { useState, useCallback } from 'react';
import { ItemFormData, ValidationResult } from '../../screens/AddItemScreen';

export const useAddItemLogic = (initialItems: ItemFormData[]) => {
  const [items, setItems] = useState<ItemFormData[]>(initialItems);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  const generateId = useCallback((): string => {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const createNewItem = useCallback(
    (): ItemFormData => ({
      id: generateId(),
      name: '',
      quantity: 1,
      unit: '개',
      expirationDate: '',
      itemCategory: '채소 / 과일',
    }),
    [generateId],
  );

  const addNewItem = useCallback(() => {
    const newItem = createNewItem();
    setItems(prev => [newItem, ...prev]);
    setFocusedItemId(newItem.id);
    return newItem.id;
  }, [createNewItem]);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // updateItem 함수 개선 - selectedIngredient 필드 특별 처리
  const updateItem = useCallback(
    (itemId: string, field: keyof ItemFormData, value: string | any) => {
      setItems(prev =>
        prev.map(item => {
          if (item.id === itemId) {
            if (field === 'selectedIngredient') {
              // selectedIngredient는 객체 또는 null
              return { ...item, [field]: value };
            } else {
              // 나머지 필드들은 문자열
              return { ...item, [field]: value as string };
            }
          }
          return item;
        }),
      );
    },
    [],
  );

  const validateItem = useCallback((item: ItemFormData): ValidationResult => {
    if (!item.name.trim()) {
      return { isValid: false, message: '식재료 이름을 입력해주세요.' };
    }
    if (!item.quantity.trim()) {
      return { isValid: false, message: '수량을 입력해주세요.' };
    }
    const quantity = parseInt(item.quantity, 10);
    if (isNaN(quantity) || quantity < 1) {
      return { isValid: false, message: '올바른 수량을 입력해주세요.' };
    }
    if (quantity > 9999) {
      return { isValid: false, message: '수량은 9999개를 초과할 수 없습니다.' };
    }
    return { isValid: true };
  }, []);

  const validateAllItems = useCallback((): ValidationResult => {
    for (const item of items) {
      const result = validateItem(item);
      if (!result.isValid) return result;
    }
    return { isValid: true };
  }, [items, validateItem]);

  // 디버깅용 함수 추가
  const logItemsState = useCallback(() => {
    // console.log('=== 현재 items 상태 ===');
    items.forEach((item, index) => {
      /*
      console.log(`Item ${index + 1}:`, {
        id: item.id,
        name: item.name,
        hasSelectedIngredient: !!item.selectedIngredient,
        selectedIngredient: item.selectedIngredient,
      });
      */
    });
  }, [items]);

  return {
    items,
    setItems,
    isEditMode,
    setIsEditMode,
    isLoading,
    setIsLoading,
    focusedItemId,
    setFocusedItemId,
    addNewItem,
    removeItem,
    updateItem,
    validateAllItems,
    logItemsState, // 디버깅용
  };
};
