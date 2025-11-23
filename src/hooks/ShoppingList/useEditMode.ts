import { useState, useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import { CartItem } from '../../types/shoppingListTypes';

interface UseEditModeResult {
  isEditMode: boolean;
  pendingChanges: Map<number, Partial<CartItem>>;
  itemRefs: React.MutableRefObject<Map<number, any>>;
  handleEditToggle: (
    updateMultipleItems: (
      updates: { id: number; updates: Partial<CartItem> }[],
    ) => Promise<void>,
    onError: () => void,
  ) => Promise<void>;
  handleNameChange: (itemId: number, newName: string) => void;
  handleQuantityChange: (itemId: number, newQuantity: number) => void;
  handleUnitChange: (itemId: number, newUnit: string) => void;
  clearPendingChange: (itemId: number) => void;
  resetPendingChanges: () => void;
}

export const useEditMode = (): UseEditModeResult => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<
    Map<number, Partial<CartItem>>
  >(new Map());
  const itemRefs = useRef<Map<number, any>>(new Map());

  const handleEditToggle = useCallback(
    async (
      updateMultipleItems: (
        updates: { id: number; updates: Partial<CartItem> }[],
      ) => Promise<void>,
      onError: () => void,
    ) => {
      if (isEditMode) {
        // 편집 모드 종료 - 변경사항 저장
        itemRefs.current.forEach(ref => {
          if (ref?.forceBlur) {
            ref.forceBlur();
          }
        });

        Keyboard.dismiss();

        setTimeout(async () => {
          if (pendingChanges.size > 0) {
            try {
              const updates = Array.from(pendingChanges.entries()).map(
                ([id, changes]) => ({
                  id,
                  updates: changes,
                }),
              );

              await updateMultipleItems(updates);
              setPendingChanges(new Map());
            } catch (error) {
              onError();
            }
          }
        }, 300);
      } else {
        // 편집 모드 시작 - pendingChanges 초기화
        setPendingChanges(new Map());
      }

      setIsEditMode(!isEditMode);
    },
    [isEditMode, pendingChanges],
  );

  const handleNameChange = useCallback((itemId: number, newName: string) => {
    if (!newName.trim()) {
      return;
    }

    setPendingChanges(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || {};
      newMap.set(itemId, { ...existing, name: newName.trim() });
      return newMap;
    });
  }, []);

  const handleQuantityChange = useCallback(
    (itemId: number, newQuantity: number) => {
      if (newQuantity <= 0) return;

      setPendingChanges(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(itemId) || {};
        newMap.set(itemId, { ...existing, quantity: newQuantity });
        return newMap;
      });
    },
    [],
  );

  const handleUnitChange = useCallback((itemId: number, newUnit: string) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || {};
      newMap.set(itemId, { ...existing, unit: newUnit });
      return newMap;
    });
  }, []);

  const clearPendingChange = useCallback((itemId: number) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });
  }, []);

  const resetPendingChanges = useCallback(() => {
    setPendingChanges(new Map());
  }, []);

  return {
    isEditMode,
    pendingChanges,
    itemRefs,
    handleEditToggle,
    handleNameChange,
    handleQuantityChange,
    handleUnitChange,
    clearPendingChange,
    resetPendingChanges,
  };
};
