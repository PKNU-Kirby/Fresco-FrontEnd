import { useState, useCallback } from 'react';

export const useEditMode = (initialItems: FridgeItem[]) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemsToDisplay, setItemsToDisplay] =
    useState<FridgeItem[]>(initialItems);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [updatedItems, setUpdatedItems] = useState<
    Map<string, Partial<FridgeItem>>
  >(new Map());

  // 편집 모드 진입/종료
  const toggleEditMode = useCallback(() => {
    if (isEditMode) {
      // 편집 모드 종료 시 변경사항 초기화
      setItemsToDisplay(initialItems);
      setItemsToDelete([]);
      setUpdatedItems(new Map());
    }
    setIsEditMode(!isEditMode);
  }, [isEditMode, initialItems]);

  // 아이템을 삭제 목록에 추가 (화면에서만 제거)
  const markItemForDeletion = useCallback((itemId: string) => {
    setItemsToDelete(prev => [...prev, itemId]);
    setItemsToDisplay(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // 삭제 목록에서 제거 (화면에 다시 표시)
  const unmarkItemForDeletion = useCallback(
    (itemId: string) => {
      setItemsToDelete(prev => prev.filter(id => id !== itemId));
      const originalItem = initialItems.find(item => item.id === itemId);
      if (originalItem) {
        setItemsToDisplay(prev => [...prev, originalItem]);
      }
    },
    [initialItems],
  );

  // 아이템 정보 업데이트 (화면에만 반영)
  const updateItemLocally = useCallback(
    (itemId: string, updates: Partial<FridgeItem>) => {
      setUpdatedItems(prev => {
        const newMap = new Map(prev);
        newMap.set(itemId, { ...newMap.get(itemId), ...updates });
        return newMap;
      });

      setItemsToDisplay(prev =>
        prev.map(item => (item.id === itemId ? { ...item, ...updates } : item)),
      );
    },
    [],
  );

  // 모든 변경사항 적용
  const applyChanges = useCallback(async () => {
    try {
      // 1. 배치 삭제 실행
      if (itemsToDelete.length > 0) {
        await batchDeleteItems(itemsToDelete);
        // console.log(`${itemsToDelete.length}개 아이템 삭제 완료`);
      }

      // 2. 개별 업데이트 실행
      const updatePromises = Array.from(updatedItems.entries()).map(
        ([itemId, updates]) => updateFridgeItem(itemId, updates),
      );

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        // console.log(`${updatePromises.length}개 아이템 업데이트 완료`);
      }

      // 3. 전체 목록 새로 불러오기
      // 이 부분은 상위 컴포넌트에서 처리하도록 콜백으로 전달
      return true;
    } catch (error) {
      // console.error('변경사항 적용 실패:', error);
      throw error;
    }
  }, [itemsToDelete, updatedItems]);

  return {
    isEditMode,
    itemsToDisplay,
    itemsToDelete,
    toggleEditMode,
    markItemForDeletion,
    unmarkItemForDeletion,
    updateItemLocally,
    applyChanges,
    hasChanges: itemsToDelete.length > 0 || updatedItems.size > 0,
  };
};
