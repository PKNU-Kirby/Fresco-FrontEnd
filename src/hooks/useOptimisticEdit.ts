import { useState, useCallback } from 'react';
import { FridgeWithRole } from '../types/permission';

interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete' | 'hide';
  data?: any;
  originalData?: FridgeWithRole;
}

export const useOptimisticEdit = () => {
  const [isEditMode, setIsEditMode] = useState(false);

  // 로컬 편집용 냉장고 목록 (실제 화면에 표시되는 데이터)
  const [editableFridges, setEditableFridges] = useState<FridgeWithRole[]>([]);

  // 변경사항 추적
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);

  // 편집 모드 시작 - 서버 데이터를 로컬로 복사
  const startEdit = useCallback((serverFridges: FridgeWithRole[]) => {
    setIsEditMode(true);
    setEditableFridges([...serverFridges]); // 깊은 복사
    setPendingChanges([]);
  }, []);

  // 편집 모드 취소 - 서버 데이터로 되돌리기
  const cancelEdit = useCallback((serverFridges: FridgeWithRole[]) => {
    setIsEditMode(false);
    setEditableFridges([...serverFridges]);
    setPendingChanges([]);
  }, []);

  // 로컬에서 냉장고 추가 (즉시 UI 반영) - 타입 수정
  const addFridgeLocally = useCallback((name: string) => {
    const tempId = `temp_${Date.now()}`;
    const newFridge: FridgeWithRole = {
      id: tempId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOwner: true,
      role: 'owner',
      memberCount: 1,
      isHidden: false,
      canEdit: true,
      canDelete: true,
    };

    // UI에 즉시 반영
    setEditableFridges(prev => [...prev, newFridge]);

    // 변경사항 기록
    setPendingChanges(prev => [
      ...prev,
      {
        id: tempId,
        type: 'create',
        data: { name },
      },
    ]);
  }, []);

  // 로컬에서 냉장고 편집 (즉시 UI 반영)
  const editFridgeLocally = useCallback(
    (fridgeId: number, newName: string) => {
      const originalFridge = editableFridges.find(f => f.id === fridgeId);
      if (!originalFridge) return;

      // UI에 즉시 반영
      setEditableFridges(prev =>
        prev.map(fridge =>
          fridge.id === fridgeId
            ? { ...fridge, name: newName, updatedAt: new Date().toISOString() }
            : fridge,
        ),
      );

      // 변경사항 기록 (이미 있다면 업데이트)
      setPendingChanges(prev => {
        const existingIndex = prev.findIndex(
          change => change.id === fridgeId && change.type === 'update',
        );
        const newChange: PendingChange = {
          id: fridgeId,
          type: 'update',
          data: { name: newName },
          originalData: originalFridge,
        };

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newChange;
          return updated;
        } else {
          return [...prev, newChange];
        }
      });
    },
    [editableFridges],
  );

  // 로컬에서 냉장고 삭제 (즉시 UI 반영)
  // useOptimisticEdit.ts 110번 줄 근처

  const deleteFridgeLocally = (fridgeId: number) => {
    const fridgeIdStr = String(fridgeId);

    if (fridgeIdStr.startsWith('temp_')) {
      // 임시 냉장고는 바로 제거
      setEditableFridges(prev =>
        prev.filter(f => String(f.id) !== fridgeIdStr),
      );
      setPendingChanges(prev =>
        prev.filter(change => change.id !== fridgeIdStr),
      );
    } else {
      // 서버 냉장고는 삭제 대기열에 추가
      const fridgeToDelete = editableFridges.find(f => f.id === fridgeId);

      setEditableFridges(prev => prev.filter(f => f.id !== fridgeId));
      setPendingChanges(prev => [
        ...prev.filter(change => change.id !== fridgeIdStr), // 기존 변경사항 제거
        {
          type: 'delete' as const,
          id: fridgeIdStr,
          data: fridgeToDelete, // ✅ 올바른 데이터
        },
      ]);
    }
  };

  // 로컬에서 냉장고 숨김 토글 (즉시 UI 반영)
  const toggleHiddenLocally = useCallback((fridge: FridgeWithRole) => {
    setEditableFridges(prev =>
      prev.map(f => (f.id === fridge.id ? { ...f, isHidden: !f.isHidden } : f)),
    );

    // 숨김은 로컬 설정이므로 pendingChanges에 추가하지 않음
    // 대신 별도로 처리하거나 즉시 AsyncStorage에 저장할 수 있음
  }, []);

  // 변경사항 확정 - 서버에 배치 전송
  const commitChanges = useCallback(
    async (
      onCreateFridge: (name: string) => Promise<any>,
      onUpdateFridge: (id: string, name: string) => Promise<any>,
      onDeleteFridge: (id: string) => Promise<any>,
    ) => {
      try {
        console.log('변경사항 서버 전송 시작:', pendingChanges);

        // 순서: 1. 삭제 -> 2. 업데이트 -> 3. 생성
        const deleteChanges = pendingChanges.filter(c => c.type === 'delete');
        const updateChanges = pendingChanges.filter(c => c.type === 'update');
        const createChanges = pendingChanges.filter(c => c.type === 'create');

        // 1. 삭제 처리
        for (const change of deleteChanges) {
          await onDeleteFridge(change.id);
        }

        // 2. 업데이트 처리
        for (const change of updateChanges) {
          await onUpdateFridge(change.id, change.data.name);
        }

        // 3. 생성 처리
        for (const change of createChanges) {
          await onCreateFridge(change.data.name);
        }

        // 성공 시 편집 모드 종료
        setIsEditMode(false);
        setPendingChanges([]);

        return true;
      } catch (error) {
        // console.error('변경사항 전송 실패:', error);
        throw error;
      }
    },
    [pendingChanges],
  );

  // 변경사항이 있는지 확인
  const hasChanges = pendingChanges.length > 0;

  return {
    // 상태
    isEditMode,
    editableFridges,
    pendingChanges,
    hasChanges,

    // 편집 모드 제어
    startEdit,
    cancelEdit,
    commitChanges,

    // 로컬 작업
    addFridgeLocally,
    editFridgeLocally,
    deleteFridgeLocally,
    toggleHiddenLocally,
  };
};
