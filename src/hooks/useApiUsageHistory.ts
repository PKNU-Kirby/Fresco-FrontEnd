// hooks/useApiUsageHistory.ts - API와 연결된 사용 기록 훅
import { useState, useEffect } from 'react';
import { ApiService } from '../services/apiServices';

export type UsageRecord = {
  id: number;
  itemName: string;
  itemId: number;
  action: 'used' | 'discarded';
  quantity?: number;
  userName: string;
  userId: number;
  timestamp: string;
  fridgeId: number;
  fridgeName: string;
};

// ConfirmModal 상태 타입
export interface UsageHistoryModalState {
  errorModalVisible: boolean;
  errorMessage: string;
  setErrorModalVisible: (visible: boolean) => void;
}

export const useApiUsageHistory = (fridgeId?: number, userId?: number) => {
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // ConfirmModal 상태들
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadUsageHistory = async (
    pageNum: number = 1,
    append: boolean = false,
  ) => {
    try {
      if (pageNum === 1) setIsLoading(true);

      let data;
      if (fridgeId) {
        // 특정 냉장고의 사용 기록
        data = await ApiService.getUsageHistory(fridgeId, pageNum);
      } else if (userId) {
        // 특정 사용자의 사용 기록
        data = await ApiService.getUserUsageHistory(userId, pageNum);
      } else {
        throw new Error('fridgeId 또는 userId가 필요합니다.');
      }

      if (append) {
        setUsageHistory(prev => [...prev, ...data.records]);
      } else {
        setUsageHistory(data.records);
      }

      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('사용 기록 로드 실패:', error);
      setErrorMessage('사용 기록을 불러올 수 없습니다.');
      setErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      loadUsageHistory(page + 1, true);
    }
  };

  const refresh = () => {
    loadUsageHistory(1, false);
  };

  const addUsageRecord = async (
    itemId: number,
    action: 'used' | 'discarded',
    quantity?: number,
  ) => {
    if (!fridgeId) {
      setErrorMessage('냉장고 정보가 필요합니다.');
      setErrorModalVisible(true);
      return;
    }

    try {
      await ApiService.addUsageRecord(fridgeId, itemId, action, quantity);
      // 기록 추가 후 목록 새로고침
      refresh();
    } catch (error) {
      console.error('사용 기록 추가 실패:', error);
      setErrorMessage('사용 기록을 저장할 수 없습니다.');
      setErrorModalVisible(true);
    }
  };

  useEffect(() => {
    if (fridgeId || userId) {
      loadUsageHistory();
    }
  }, [fridgeId, userId]);

  const modalState: UsageHistoryModalState = {
    errorModalVisible,
    errorMessage,
    setErrorModalVisible,
  };

  return {
    usageHistory,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    addUsageRecord,
    modalState,
  };
};
