// services/ApiService.ts - API 연결을 위한 서비스

const API_BASE_URL = 'https://your-api-server.com/api'; // 실제 API 서버 URL로 변경

class ApiService {
  private static getAuthHeaders = async () => {
    const token = await AsyncStorageService.getAuthToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  // 회원 관련 API
  static async getCurrentUser() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('사용자 정보를 불러올 수 없습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('getCurrentUser 에러:', error);
      throw error;
    }
  }

  // 냉장고 구성원 관련 API
  static async getFridgeMembers(fridgeId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/fridges/${fridgeId}/members`,
        {
          method: 'GET',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error('구성원 목록을 불러올 수 없습니다.');
      }

      const data = await response.json();
      return data.members;
    } catch (error) {
      console.error('getFridgeMembers 에러:', error);
      throw error;
    }
  }

  // 초대 코드 생성 API
  static async generateInviteCode(fridgeId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/fridges/${fridgeId}/invite`,
        {
          method: 'POST',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error('초대 코드를 생성할 수 없습니다.');
      }

      const data = await response.json();
      return data.inviteCode;
    } catch (error) {
      console.error('generateInviteCode 에러:', error);
      throw error;
    }
  }

  // 초대 코드 재생성 API
  static async regenerateInviteCode(fridgeId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/fridges/${fridgeId}/invite/regenerate`,
        {
          method: 'POST',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error('초대 코드를 재생성할 수 없습니다.');
      }

      const data = await response.json();
      return data.inviteCode;
    } catch (error) {
      console.error('regenerateInviteCode 에러:', error);
      throw error;
    }
  }

  // 초대 코드로 냉장고 참여 API
  static async joinFridgeByCode(inviteCode: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/fridges/join`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '냉장고 참여에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('joinFridgeByCode 에러:', error);
      throw error;
    }
  }

  // 사용 기록 조회 API
  static async getUsageHistory(
    fridgeId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/fridges/${fridgeId}/usage-history?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error('사용 기록을 불러올 수 없습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('getUsageHistory 에러:', error);
      throw error;
    }
  }

  // 특정 사용자의 사용 기록 조회 API
  static async getUserUsageHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/usage-history?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error('사용 기록을 불러올 수 없습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('getUserUsageHistory 에러:', error);
      throw error;
    }
  }

  // 식재료 사용 기록 추가 API
  static async addUsageRecord(
    fridgeId: string,
    itemId: string,
    action: 'used' | 'discarded',
    quantity?: number,
  ) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/fridges/${fridgeId}/usage`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            itemId,
            action,
            quantity,
            timestamp: new Date().toISOString(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error('사용 기록을 저장할 수 없습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('addUsageRecord 에러:', error);
      throw error;
    }
  }

  // 알림 기록 조회 API
  static async getNotificationHistory(userId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/notifications`,
        {
          method: 'GET',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error('알림 기록을 불러올 수 없습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('getNotificationHistory 에러:', error);
      throw error;
    }
  }

  // 알림 읽음 처리 API
  static async markNotificationAsRead(notificationId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error('알림 상태를 업데이트할 수 없습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('markNotificationAsRead 에러:', error);
      throw error;
    }
  }

  // 구성원 제거 API (방장 권한)
  static async removeMember(fridgeId: string, memberId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/fridges/${fridgeId}/members/${memberId}`,
        {
          method: 'DELETE',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error('구성원을 제거할 수 없습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('removeMember 에러:', error);
      throw error;
    }
  }

  // 냉장고 나가기 API
  static async leaveFridge(fridgeId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/fridges/${fridgeId}/leave`,
        {
          method: 'POST',
          headers,
        },
      );

      if (!response.ok) {
        throw new Error('냉장고를 나갈 수 없습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('leaveFridge 에러:', error);
      throw error;
    }
  }

  // 냉장고 삭제 API (방장 권한)
  static async deleteFridge(fridgeId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/fridges/${fridgeId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('냉장고를 삭제할 수 없습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('deleteFridge 에러:', error);
      throw error;
    }
  }
}

export default ApiService;

// hooks/useApiMembers.ts - API와 연결된 멤버 관리 훅
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import ApiService from '../services/ApiService';

export type Member = {
  id: string;
  name: string;
  role: 'owner' | 'member';
  joinDate: string;
  email?: string;
  avatar?: string;
};

export const useApiMembers = (fridgeId: string, _fridgeName: string) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 멤버 목록 로드 (API 연결)
  const loadMembers = async () => {
    try {
      setIsLoading(true);

      // 현재 사용자 정보 가져오기
      const user = await ApiService.getCurrentUser();
      setCurrentUser(user);

      // 냉장고 멤버 목록 가져오기
      const fridgeMembers = await ApiService.getFridgeMembers(fridgeId);

      // 멤버 목록 정렬 (방장 먼저, 그 다음 가입일순)
      const sortedMembers = fridgeMembers.sort((a: Member, b: Member) => {
        if (a.role === 'owner' && b.role === 'member') return -1;
        if (a.role === 'member' && b.role === 'owner') return 1;
        return new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
      });

      setMembers(sortedMembers);
    } catch (error) {
      console.error('멤버 목록 로드 실패:', error);
      Alert.alert('오류', '멤버 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberPress = (member: Member) => {
    const roleText = member.role === 'owner' ? '방장' : '구성원';
    const joinDateText = new Date(member.joinDate).toLocaleDateString('ko-KR');

    Alert.alert(
      member.name,
      `역할: ${roleText}\n가입일: ${joinDateText}${
        member.email ? `\n이메일: ${member.email}` : ''
      }`,
      [{ text: '확인', style: 'default' }],
    );
  };

  useEffect(() => {
    loadMembers();
  }, [fridgeId]);

  useFocusEffect(
    React.useCallback(() => {
      loadMembers();
    }, [fridgeId]),
  );

  return {
    members,
    isLoading,
    currentUser,
    loadMembers,
    handleMemberPress,
  };
};

// hooks/useApiUsageHistory.ts - API와 연결된 사용 기록 훅
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import ApiService from '../services/ApiService';

export type UsageRecord = {
  id: string;
  itemName: string;
  itemId: string;
  action: 'used' | 'discarded';
  quantity?: number;
  userName: string;
  userId: string;
  timestamp: string;
  fridgeId: string;
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
