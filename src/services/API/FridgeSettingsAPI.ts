import Config from 'react-native-config';
import { getValidAccessToken } from '../../utils/authUtils';
import { ApiErrorHandler } from '../../utils/errorHandler';

// AsyncStorageService import - 여러 방식으로 시도
import { AsyncStorageService } from '../AsyncStorageService';

// 만약 위의 방식이 안 된다면 아래 방식들 중 하나를 시도
// import AsyncStorageService from '../asyncStorageService';
// import * as AsyncStorageModule from '../asyncStorageService';
// const AsyncStorageService = AsyncStorageModule.AsyncStorageService;

// 타입 정의
export interface FridgeMember {
  userId: string;
  userName: string;
  role: 'OWNER' | 'MEMBER';
}

export interface InvitationResponse {
  refrigeratorInvitationId: string;
  refrigeratorId: string;
  refrigeratorName: string;
  inviterId: string;
  inviterName: string;
}

export interface UsageHistoryResponse {
  content: Array<{
    consumerId: string;
    consumerName: string;
    refrigeratorIngredientId: string;
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
  static async getFridgeMembers(fridgeId: string): Promise<FridgeMember[]> {
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
      console.error('냉장고 멤버 조회 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.getFridgeMembers');
      throw error;
    }
  }

  /**
   * 냉장고 멤버 추가
   */
  static async addFridgeMember(
    fridgeId: string,
    memberData: {
      id?: string;
      name?: string;
      groceryListId?: string;
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
      console.error('냉장고 멤버 추가 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.addFridgeMember');
      throw error;
    }
  }

  /**
   * 냉장고 멤버 삭제
   */
  static async removeFridgeMember(
    fridgeId: string,
    userId: string,
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
      console.error('냉장고 멤버 삭제 실패:', error);
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
    fridgeId: string,
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
        console.error('AsyncStorageService가 undefined입니다');
        throw {
          status: 500,
          code: 'SERVICE_UNAVAILABLE',
          message: 'AsyncStorageService를 사용할 수 없습니다',
        };
      }

      if (typeof AsyncStorageService.getCurrentUser !== 'function') {
        console.error('AsyncStorageService.getCurrentUser가 함수가 아닙니다');
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
        console.error('getCurrentUser 호출 실패:', userError);
        throw {
          status: 500,
          code: 'USER_SERVICE_ERROR',
          message: '사용자 정보 조회 중 오류가 발생했습니다',
        };
      }

      // 사용자 정보가 없는 경우의 처리 개선
      if (!currentUser) {
        console.warn('getCurrentUser가 null을 반환함');
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
          console.error('사용자 ID 조회도 실패:', idError);
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
        refrigeratorId: fridgeId,
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
      return result.refrigeratorInvitationId;
    } catch (error) {
      console.error('초대 코드 생성 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.generateInviteCode');
      throw error;
    }
  }

  /**
   * 초대장 정보 조회
   */
  static async getInvitationInfo(
    invitationId: string,
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
      console.error('초대장 정보 조회 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.getInvitationInfo');
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
      console.error('알림 전송 실패:', error);
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
        `${Config.API_BASE_URL}/api/v1/history?${queryParams.toString()}`,
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
      console.error('사용 히스토리 조회 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.getUsageHistory');
      throw error;
    }
  }

  /**
   * 냉장고 나가기 (현재 사용자를 멤버에서 제거)
   */
  static async leaveFridge(fridgeId: string): Promise<void> {
    try {
      // AsyncStorageService 안전성 검사
      if (
        !AsyncStorageService ||
        typeof AsyncStorageService.getCurrentUserId !== 'function'
      ) {
        console.error(
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
        console.error('getCurrentUserId 호출 실패:', userError);
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
      console.error('냉장고 나가기 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.leaveFridge');
      throw error;
    }
  }

  /**
   * 현재 사용자의 냉장고 내 역할 확인
   */
  static async getUserRoleInFridge(
    fridgeId: string,
  ): Promise<'owner' | 'member' | null> {
    try {
      // AsyncStorageService 안전성 검사
      if (
        !AsyncStorageService ||
        typeof AsyncStorageService.getCurrentUserId !== 'function'
      ) {
        console.warn(
          'AsyncStorageService.getCurrentUserId를 사용할 수 없습니다',
        );
        return null;
      }

      let currentUserId;
      try {
        currentUserId = await AsyncStorageService.getCurrentUserId();
      } catch (userError) {
        console.warn('getCurrentUserId 호출 실패:', userError);
        return null;
      }

      if (!currentUserId) {
        return null;
      }

      const members = await this.getFridgeMembers(fridgeId);
      const currentUserMember = members.find(
        member => member.userId === currentUserId,
      );

      if (!currentUserMember) {
        return null;
      }

      return currentUserMember.role === 'OWNER' ? 'owner' : 'member';
    } catch (error) {
      console.error('사용자 역할 확인 실패:', error);
      ApiErrorHandler.logError(error, 'FridgeSettingsAPI.getUserRoleInFridge');
      return null;
    }
  }
}
