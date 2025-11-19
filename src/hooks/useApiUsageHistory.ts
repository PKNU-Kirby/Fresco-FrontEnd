// hooks/useApiUsageHistory.ts - API와 연결된 사용 기록 훅
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import ApiService from '../services/apiServices';

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

export const useApiUsageHistory = (fridgeId?: string, userId?: string) => {
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

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
      Alert.alert('오류', '사용 기록을 불러올 수 없습니다.');
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
    itemId: string,
    action: 'used' | 'discarded',
    quantity?: number,
  ) => {
    if (!fridgeId) {
      Alert.alert('오류', '냉장고 정보가 필요합니다.');
      return;
    }

    try {
      await ApiService.addUsageRecord(fridgeId, itemId, action, quantity);
      // 기록 추가 후 목록 새로고침
      refresh();
    } catch (error) {
      console.error('사용 기록 추가 실패:', error);
      Alert.alert('오류', '사용 기록을 저장할 수 없습니다.');
    }
  };

  useEffect(() => {
    if (fridgeId || userId) {
      loadUsageHistory();
    }
  }, [fridgeId, userId]);

  return {
    usageHistory,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    addUsageRecord,
  };
};
