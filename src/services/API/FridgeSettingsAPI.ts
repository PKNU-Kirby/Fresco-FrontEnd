import Config from '../../types/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getValidAccessToken } from '../../utils/authUtils';
import { ApiErrorHandler } from '../../utils/errorHandler';
import { AsyncStorageService } from '../AsyncStorageService';
import { ApiService } from '../apiServices';

// 타입 정의
export interface FridgeMember {
  userId: number;
  userName: string;
  role: 'OWNER' | 'MEMBER';
}
// 사용 기록 타입
export type HistoryRecord = {
  consumerId: number;
  consumerName: string;
  refrigeratorIngredientId: number;
  ingredientName: string;
  usedQuantity: number;
  unit: string;
  usedAt: string;
};

export type HistoryResponse = {
  content: HistoryRecord[];
  pageInfo: {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    first: boolean;
    last: boolean;
  };
};

export interface InvitationResponse {
  refrigeratorInvitationId: number;
  refrigeratorId: number;
  refrigeratorName: string;
  inviterId: number;
  inviterName: string;
}

export interface UsageHistoryResponse {
  content: Array<{
    consumerId: number;
    consumerName: string;
    refrigeratorIngredientId: number;
    ingredientName: string;
    usedQuantity: number;
    unit: string;
    usedAt: string;
  }>;
  pageInfo: {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
  };
}

export class FridgeSettingsAPIService {
  /**
   * 냉장고 멤버 목록 조회
   */
  static async getFridgeMembers(fridgeId: number): Promise<FridgeMember[]> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/refrigerator/users/${fridgeId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      const data = await response.json();

      if (!data.code || !data.code.includes('OK')) {
        throw {
          status: 200,
          code: 'API_ERROR',
          message: data.message || 'API 응답 오류',
        };
      }

      return data.result || [];
    } catch (error) {
      // console.error('냉장고 멤버 조회 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.getFridgeMembers');
      throw error;
    }
  }

  /**
   * 냉장고 멤버 추가
   */
  static async addFridgeMember(
    fridgeId: number,
    memberData: {
      id?: number;
      name?: string;
      groceryListId?: number;
    },
  ): Promise<void> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/refrigerator/users/${fridgeId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(memberData),
        },
      );

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      const data = await response.json();

      if (!data.code || !data.code.includes('OK')) {
        throw {
          status: 200,
          code: 'API_ERROR',
          message: data.message || '멤버 추가 실패',
        };
      }
    } catch (error) {
      // console.error('냉장고 멤버 추가 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.addFridgeMember');
      throw error;
    }
  }

  /**
   * 냉장고 멤버 삭제
   */
  static async removeFridgeMember(
    fridgeId: number,
    userId: number,
  ): Promise<void> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      // API 문서에 따라 ids 쿼리 파라미터 추가
      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/refrigerator/users/${fridgeId}/${userId}?ids=${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      // DELETE는 보통 응답 본문이 없거나 단순한 상태만 반환
      if (response.status !== 204) {
        const data = await response.json();
        if (!data.code || !data.code.includes('OK')) {
          throw {
            status: 200,
            code: 'API_ERROR',
            message: data.message || '멤버 삭제 실패',
          };
        }
      }
    } catch (error) {
      // console.error('냉장고 멤버 삭제 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.removeFridgeMember');
      throw error;
    }
  }

  /**
   * 초대장 생성
   */
  /**
   * 초대장 생성 - 쿼리 파라미터 방식으로 수정
   */
  static async generateInviteCode(
    fridgeId: number,
    fridgeName: string,
  ): Promise<string> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      // AsyncStorageService 안전성 검사
      if (!AsyncStorageService) {
        // console.error('AsyncStorageService가 undefined입니다');
        throw {
          status: 500,
          code: 'SERVICE_UNAVAILABLE',
          message: 'AsyncStorageService를 사용할 수 없습니다',
        };
      }

      if (typeof AsyncStorageService.getCurrentUser !== 'function') {
        // console.error('AsyncStorageService.getCurrentUser가 함수가 아닙니다');
        throw {
          status: 500,
          code: 'SERVICE_UNAVAILABLE',
          message: 'getCurrentUser 메서드를 사용할 수 없습니다',
        };
      }

      let currentUser;
      try {
        currentUser = await AsyncStorageService.getCurrentUser();
        console.log('getCurrentUser 결과:', currentUser);
      } catch (userError) {
        // console.error('getCurrentUser 호출 실패:', userError);
        throw {
          status: 500,
          code: 'USER_SERVICE_ERROR',
          message: '사용자 정보 조회 중 오류가 발생했습니다',
        };
      }

      // 사용자 정보가 없는 경우의 처리 개선
      if (!currentUser) {
        // console.warn('getCurrentUser가 null을 반환함');
        // 대안: getCurrentUserId로 사용자 ID만이라도 가져오기
        try {
          const userId = await AsyncStorageService.getCurrentUserId();
          console.log('대안으로 사용자 ID 조회:', userId);
          if (userId) {
            // 사용자 ID로 임시 사용자 객체 생성
            currentUser = {
              id: userId,
              name: `User${userId}`, // 사용자 ID 기반 기본 이름
            };
            console.log('임시 사용자 객체 생성:', currentUser);
          } else {
            throw {
              status: 401,
              code: 'USER_NOT_AUTHENTICATED',
              message: '로그인이 필요합니다. 다시 로그인해주세요.',
            };
          }
        } catch (idError) {
          // console.error('사용자 ID 조회도 실패:', idError);
          throw {
            status: 401,
            code: 'USER_NOT_AUTHENTICATED',
            message: '로그인이 필요합니다. 다시 로그인해주세요.',
          };
        }
      }

      if (!currentUser.id || !currentUser.name) {
        throw {
          status: 400,
          code: 'INVALID_USER_DATA',
          message: '사용자 정보가 불완전합니다',
        };
      }

      // 쿼리 파라미터 방식으로 변경 (cURL과 동일)
      const queryParams = new URLSearchParams({
        refrigeratorId: fridgeId.toString(),
        refrigeratorName: fridgeName,
        inviterId: currentUser.id.toString(),
        inviterName: currentUser.name,
      });

      console.log('초대 API 호출 - 쿼리 파라미터:', queryParams.toString());

      const response = await fetch(
        `${
          Config.API_BASE_URL
        }/api/v1/refrigerator/invitation?${queryParams.toString()}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: '', // 빈 body (cURL과 동일)
        },
      );

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      const data = await response.json();
      console.log('초대 API 응답:', data);

      if (!data.code || !data.code.includes('OK')) {
        throw {
          status: 200,
          code: 'API_ERROR',
          message: data.message || '초대 코드 생성 실패',
        };
      }

      const result: InvitationResponse = data.result;

      return result.refrigeratorInvitationId.toString();
    } catch (error) {
      // console.error('초대 코드 생성 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.generateInviteCode');
      throw error;
    }
  }

  /**
   * 초대장 정보 조회
   */
  static async getInvitationInfo(
    invitationId: number,
  ): Promise<InvitationResponse> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/refrigerator/invitation/${invitationId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      const data = await response.json();

      if (!data.code || !data.code.includes('OK')) {
        throw {
          status: 200,
          code: 'API_ERROR',
          message: data.message || '초대장 정보 조회 실패',
        };
      }

      return data.result;
    } catch (error) {
      // console.error('초대장 정보 조회 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.getInvitationInfo');
      throw error;
    }
  }

  /**
   * 초대 코드로 냉장고 참여
   */
  /**
   * 초대 코드로 냉장고 참여
   */
  static async joinRefrigeratorByInvitation(fridgeId: number): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      console.log('냉장고 참여 시도 - refrigeratorId:', fridgeId);

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/refrigerator/users/${fridgeId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      const data = await response.json();

      if (!data.code || !data.code.includes('OK')) {
        throw {
          status: 200,
          code: 'API_ERROR',
          message: data.message || '냉장고 참여 실패',
        };
      }

      console.log('냉장고 참여 성공:', data);
    } catch (error) {
      // console.error('냉장고 참여 실패:', error);
      ApiErrorHandler.logError(
        error,
        'FridgeSettingsAPI.joinRefrigeratorByInvitation',
      );
      throw error;
    }
  }

  /**
   * 초대 코드 유효성 검증
   */
  static async validateInvitationCode(
    refrigeratorInvitationId: number,
  ): Promise<InvitationResponse> {
    try {
      // getValidAccessToken 대신 직접 가져오기
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      console.log('초대 코드 유효성 검증:', refrigeratorInvitationId);
      console.log('사용할 토큰:', token.substring(0, 30) + '...');

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/refrigerator/invitation/${refrigeratorInvitationId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      const data = await response.json();

      if (!data.code || !data.code.includes('OK')) {
        throw {
          status: 200,
          code: 'API_ERROR',
          message: data.message || '초대 코드 조회 실패',
        };
      }

      console.log('초대 코드 유효성 검증 완료:', data.result);
      return data.result;
    } catch (error) {
      // console.error('초대 코드 유효성 검증 실패:', error);
      ApiErrorHandler.logError(
        error,
        'FridgeSettingsAPI.validateInvitationCode',
      );
      throw error;
    }
  }

  /**
   * 알림 전송
   */
  static async sendNotification(notificationData: {
    title: string;
    body: string;
  }): Promise<string> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/notification`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(notificationData),
        },
      );

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      const data = await response.json();

      if (!data.code || !data.code.includes('OK')) {
        throw {
          status: 200,
          code: 'API_ERROR',
          message: data.message || '알림 전송 실패',
        };
      }

      return data.result;
    } catch (error) {
      // console.error('알림 전송 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.sendNotification');
      throw error;
    }
  }

  /**
   * 사용 히스토리 조회 (페이지네이션)
   */
  static async getUsageHistory(pageData: {
    page: number;
    size: number;
    sort: string;
    fridgeId: number;
  }): Promise<UsageHistoryResponse> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      const queryParams = new URLSearchParams({
        page: pageData.page.toString(),
        size: pageData.size.toString(),
        sort: pageData.sort,
      });

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/history/refrigeratorId=${
          pageData.fridgeId
        }&?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      const data = await response.json();

      if (!data.code || !data.code.includes('OK')) {
        throw {
          status: 200,
          code: 'API_ERROR',
          message: data.message || '사용 히스토리 조회 실패',
        };
      }

      return data.result;
    } catch (error) {
      // console.error('사용 히스토리 조회 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.getUsageHistory');
      throw error;
    }
  }

  /**
   * 냉장고 나가기 (현재 사용자를 멤버에서 제거)
   */
  static async leaveFridge(fridgeId: number): Promise<void> {
    try {
      // AsyncStorageService 안전성 검사
      if (
        !AsyncStorageService ||
        typeof AsyncStorageService.getCurrentUserId !== 'function'
      ) {
        // console.error(
          'AsyncStorageService.getCurrentUserId를 사용할 수 없습니다',
        );
        throw {
          status: 500,
          code: 'SERVICE_UNAVAILABLE',
          message: 'AsyncStorageService를 사용할 수 없습니다',
        };
      }

      let currentUserId;
      try {
        currentUserId = await AsyncStorageService.getCurrentUserId();
      } catch (userError) {
        // console.error('getCurrentUserId 호출 실패:', userError);
        throw {
          status: 500,
          code: 'USER_SERVICE_ERROR',
          message: '사용자 ID 조회 중 오류가 발생했습니다',
        };
      }

      if (!currentUserId) {
        throw {
          status: 400,
          code: 'USER_NOT_FOUND',
          message: '사용자 정보를 찾을 수 없습니다',
        };
      }

      await this.removeFridgeMember(fridgeId, currentUserId);
    } catch (error) {
      // console.error('냉장고 나가기 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.leaveFridge');
      throw error;
    }
  }

  /**
   * 현재 사용자의 냉장고 내 역할 확인
   */
  static async getUserRoleInFridge(
    fridgeId: number,
  ): Promise<'owner' | 'member' | null> {
    try {
      // AsyncStorageService 안전성 검사
      if (
        !AsyncStorageService ||
        typeof AsyncStorageService.getCurrentUserId !== 'function'
      ) {
        /*
        console.warn(
          'AsyncStorageService.getCurrentUserId를 사용할 수 없습니다',
        );
        */
        return null;
      }

      let currentUserId;
      try {
        currentUserId = await AsyncStorageService.getCurrentUserId();
      } catch (userError) {
        // console.warn('getCurrentUserId 호출 실패:', userError);
        return null;
      }

      if (!currentUserId) {
        return null;
      }

      const members = await this.getFridgeMembers(fridgeId);
      const currentUserMember = members.find(
        member => member.userId === parseInt(currentUserId, 10),
      );

      if (!currentUserMember) {
        return null;
      }

      return currentUserMember.role === 'OWNER' ? 'owner' : 'member';
    } catch (error) {
      // console.error('사용자 역할 확인 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.getUserRoleInFridge');
      return null;
    }
  }
}

export class UsageHistoryAPI {
  static formatTime(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * 냉장고 사용 기록 조회
   */
  static async getUsageHistory(fridgeId: number): Promise<HistoryResponse> {
    try {
      console.log(`냉장고 ${fridgeId} 사용 기록 조회 중...`);

      const response = await ApiService.apiCall<HistoryResponse>(
        `/api/v1/history/${fridgeId}`,
        {
          method: 'GET',
        },
      );

      console.log(`사용 기록 조회 완료: ${response.content.length}개`);
      return response;
    } catch (error) {
      // console.error('사용 기록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 페이지네이션을 사용한 전체 사용 기록 조회
   */
  static async getAllUsageHistory(
    fridgeId: number,
    maxPages: number = 10,
  ): Promise<HistoryRecord[]> {
    const allRecords: HistoryRecord[] = [];
    let currentPage = 0;
    let hasMore = true;

    try {
      while (hasMore && currentPage < maxPages) {
        const response = await this.getUsageHistory(fridgeId, {
          page: currentPage,
          size: 100,
        });

        allRecords.push(...response.content);
        hasMore = response.pageInfo.hasNext;
        currentPage++;
      }

      console.log(`전체 사용 기록 조회 완료: ${allRecords.length}개`);
      return allRecords;
    } catch (error) {
      // console.error('전체 사용 기록 조회 실패:', error);
      throw error;
    }
  }
}
