import { AsyncStorageService } from './AsyncStorageService';
import Config from '../types/config';
import { CommonActions } from '@react-navigation/native';

// API 응답 타입 정의
type ApiResponse<T> = {
  code: string;
  message: string;
  result: T;
};

type User = {
  id: number;
  name: string;
};

type FridgeMember = {
  id: number;
  name: string;
  role: 'owner' | 'member';
};

type FCMTokenRequest = {
  title: string;
  body: string;
};

// 토큰 갱신 상태 관리
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export class ApiService {
  private static isAuthEndpoint(endpoint: string): boolean {
    return (
      endpoint.includes('/api/v1/auth/login') ||
      endpoint.includes('/api/v1/auth/logout') ||
      endpoint.includes('/api/v1/auth/refresh')
    );
  }
  // 공통 헤더 생성
  private static async getHeaders(): Promise<HeadersInit_> {
    const token = await AsyncStorageService.getAuthToken();
    console.log('현재 토큰:', token ? `${token}` : 'null');

    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // 로그아웃
  static async logout(navigation?: any): Promise<void> {
    console.log('🚪 로그아웃 시작');

    try {
      // 로그아웃 API 호출 시도 (실패해도 계속 진행)
      try {
        await this.apiCall<void>('/api/v1/auth/logout', {
          method: 'POST',
        });
        console.log('O 서버 로그아웃 성공');
      } catch (logoutError) {
        console.warn('!! 서버 로그아웃 실패 (무시):', logoutError);
        // 서버 로그아웃 실패해도 로컬 클리어 진행
      }
    } finally {
      // 무조건 실행 // 정리 작업
      console.log('🧹 로컬 데이터 클리어');

      // 토큰 갱신 상태 초기화
      isRefreshing = false;
      refreshPromise = null;

      // 로컬 스토리지 클리어
      await AsyncStorageService.clearAllAuthData();

      // 네비게이션 리셋
      if (navigation) {
        console.log('-> 로그인 화면으로 이동');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          }),
        );
      }

      console.log('O 로그아웃 완료');
    }
  }

  // 토큰 갱신 메서드
  static async refreshAccessToken(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
      console.log(
        '⏳ 토큰 갱신이 이미 진행 중입니다. 기존 프로미스를 반환합니다.',
      );
      return await refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        console.log('-> 토큰 갱신 시작...');
        const refreshToken = await AsyncStorageService.getRefreshToken();

        if (!refreshToken) {
          console.log('X 리프레시 토큰이 없습니다');
          return false;
        }

        const response = await fetch(
          `${Config.API_BASE_URL}/api/v1/auth/refresh`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Authorization 헤더 제거 (refresh token은 body로 전송)
            },
            body: JSON.stringify({ refreshToken }),
          },
        );

        if (!response.ok) {
          console.log('X 토큰 갱신 HTTP 실패:', response.status);

          // 401/403 -> 토큰 만료로 간주
          if (response.status === 401 || response.status === 403) {
            console.log('🚪 토큰 만료 - 재로그인 필요');
            await ApiService.logout();
          }

          return false;
        }

        const responseData: ApiResponse<{
          accessToken: string;
          refreshToken?: string;
        }> = await response.json();

        if (!responseData.code.includes('OK') || !responseData.result) {
          console.log('X 토큰 갱신 응답 실패:', responseData.message);
          return false;
        }

        // 새 토큰 저장
        await AsyncStorageService.setAuthToken(responseData.result.accessToken);
        if (responseData.result.refreshToken) {
          await AsyncStorageService.setRefreshToken(
            responseData.result.refreshToken,
          );
        }

        console.log('O 토큰 갱신 성공');
        return true;
      } catch (error) {
        console.error('X 토큰 갱신 중 오류:', error);
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return await refreshPromise;
  }

  private static isSpecialEndpoint(endpoint: string): boolean {
    return endpoint.startsWith('/grocery/');
  }

  // 공통 API 호출 메서드
  public static async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0,
  ): Promise<T> {
    try {
      const normalizedEndpoint = this.isSpecialEndpoint(endpoint)
        ? endpoint
        : endpoint.startsWith('/api/v1')
        ? endpoint
        : `/api/v1${endpoint}`;

      const url = `${Config.API_BASE_URL}${normalizedEndpoint}`;
      const headers = await this.getHeaders();

      console.log(`=> API 호출: ${options.method || 'GET'} ${url}`);
      if (options.body) {
        console.log('-- 요청 데이터:', options.body);
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // 401 에러 처리 - 인증 엔드포인트는 제외
      if (response.status === 401 && retryCount === 0) {
        // 로그아웃, 로그인, 리프레시는 재시도 안 함
        if (this.isAuthEndpoint(endpoint)) {
          console.log('X 인증 엔드포인트는 401 재시도 안 함:', endpoint);

          // 로그아웃 실패는 무시 -> 로컬 클리어
          if (endpoint.includes('/auth/logout')) {
            await AsyncStorageService.clearAllAuthData();
            throw new Error('로그아웃 처리됨');
          }

          // 다른 인증 엔드포인트 : 에러 전파
          const errorText = await response.text();
          throw new Error(errorText || '인증 실패');
        }

        // 일반 API만 토큰 갱신 시도
        console.log('!! 401 에러 감지, 토큰 갱신 시도...');
        const refreshSuccess = await this.refreshAccessToken();

        if (refreshSuccess) {
          console.log('O 토큰 갱신 성공, API 재시도...');
          return this.apiCall<T>(endpoint, options, retryCount + 1);
        } else {
          console.log('X 토큰 갱신 실패, 로그아웃 처리');
          await this.logout();
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('X API 에러 응답:', errorText);

        try {
          const errorData = JSON.parse(errorText);

          // NP (No Permission) 코드 특별 처리
          if (errorData.code === 'NP') {
            console.warn('!! 권한 에러 감지:', errorData.message);
            throw new Error('이 기능에 접근할 권한이 없습니다.');
          }

          throw new Error(errorData.message || `HTTP ${response.status}`);
        } catch (parseError) {
          let errorMessage = `서버 오류 (${response.status})`;

          switch (response.status) {
            case 400:
              errorMessage = '잘못된 요청입니다.';
              break;
            case 403:
              errorMessage = '접근 권한이 없습니다.';
              break;
            case 404:
              errorMessage = '요청한 리소스를 찾을 수 없습니다.';
              break;
            case 500:
              errorMessage = '서버 내부 오류가 발생했습니다.';
              break;
          }
          throw new Error(errorMessage);
        }
      }

      // API 응답 구조 확인
      const responseText = await response.text();
      console.log(
        `O API 응답 (${response.status}):`,
        responseText.substring(0, 200),
      );

      if (!responseText.trim()) {
        return {} as T;
      }

      const responseData = JSON.parse(responseText);

      if (
        responseData.code !== undefined &&
        responseData.result !== undefined
      ) {
        // ✅ 성공 코드 체크 로직 수정
        if (
          responseData.code.includes('OK') ||
          responseData.code.startsWith('RECIPE_') ||
          responseData.code.startsWith('INGREDIENT_') ||
          responseData.code.startsWith('REFRIGERATOR_') ||
          responseData.code.startsWith('GROCEREY_')
        ) {
          return responseData.result as T;
        } else {
          throw new Error(responseData.message || 'API 호출 실패');
        }
      }
      return responseData as T;
    } catch (error) {
      console.error('X API 호출 실패:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
        );
      }
      throw error;
    }
  }

  // 현재 사용자 정보 조회
  static async getCurrentUser(): Promise<User> {
    try {
      const userId = await AsyncStorageService.getCurrentUserId();
      if (!userId) {
        await this.logout();
        throw new Error('User not found');
      }

      const userInfo = await AsyncStorageService.getCurrentUser();
      if (!userInfo) {
        await this.logout();
        throw new Error('User info not found');
      }

      return userInfo;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      await this.logout();
      throw error;
    }
  }

  // 냉장고 멤버 목록 조회
  static async getFridgeMembers(fridgeId: number): Promise<FridgeMember[]> {
    return this.apiCall<FridgeMember[]>(
      `/api/v1/refrigerator/users/${fridgeId}`,
    );
  }

  // 냉장고 나가기
  static async leaveFridge(fridgeId: number, userId: number): Promise<void> {
    await this.apiCall<void>(
      `/api/v1/refrigerator/users/${fridgeId}/${userId}?ids=${userId}`,
      {
        method: 'DELETE',
      },
    );
  }

  // 사용 기록 조회
  static async getUsageHistory(
    fridgeId: number,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{
    history: Array<{
      id: number;
      ingredientName: string;
      action: 'added' | 'updated' | 'deleted' | 'consumed';
      quantity?: number;
      unit?: string;
      userName: string;
      createdAt: string;
    }>;
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('fridgeId', fridgeId);

    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset)
      queryParams.append('offset', options.offset.toString());
    if (options?.startDate) queryParams.append('startDate', options.startDate);
    if (options?.endDate) queryParams.append('endDate', options.endDate);

    return this.apiCall<{
      history: Array<{
        id: number;
        ingredientName: string;
        action: 'added' | 'updated' | 'deleted' | 'consumed';
        quantity?: number;
        unit?: string;
        userName: string;
        createdAt: string;
      }>;
      total: number;
    }>(`/api/v1/history/${fridgeId}`);
  }

  // 로그인
  static async login(): Promise<{
    user: User;
    token: string;
  }> {
    const response = await this.apiCall<{
      user: User;
      token: string;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await AsyncStorageService.setAuthToken(response.token);
    await AsyncStorageService.setCurrentUserId(response.user.id);

    return response;
  }

  // FCM 토큰 등록/업데이트
  static async registerFCMToken(fcmToken: string): Promise<boolean> {
    try {
      console.log('=> FCM 토큰 등록 시작:', fcmToken.substring(0, 30) + '...');

      await this.apiCall<void>('/notification', {
        method: 'POST',
        headers: {
          'X-FCM-Token': fcmToken,
        },
        body: JSON.stringify({
          title: '알림 설정 완료',
          body: 'FCM 토큰이 등록되었습니다.',
        }),
      });

      console.log('O FCM 토큰 등록 성공');
      return true;
    } catch (error) {
      console.error('X FCM 토큰 등록 실패:', error);
      return false;
    }
  }

  // 알림 설정 업데이트 (소비기한 알림 설정)
  static async updateNotificationSettings(
    fcmToken: string,
    settings: {
      expiryDaysBefore: number;
      notificationTime: string;
    },
  ): Promise<boolean> {
    try {
      console.log('=> 알림 설정 업데이트:', settings);

      await this.apiCall<void>('/notification', {
        method: 'POST',
        headers: {
          'X-FCM-Token': fcmToken,
        },
        body: JSON.stringify({
          title: '알림 설정 업데이트',
          body: `소비기한 ${settings.expiryDaysBefore}일 전, ${settings.notificationTime}에 알림 받기`,
        }),
      });

      console.log('O 알림 설정 업데이트 성공');
      return true;
    } catch (error) {
      console.error('X 알림 설정 업데이트 실패:', error);
      return false;
    }
  }

  // 테스트 푸시 알림 전송
  static async sendTestNotification(fcmToken: string): Promise<boolean> {
    try {
      console.log('=> 테스트 알림 전송');

      await this.apiCall<void>('/notification', {
        method: 'POST',
        headers: {
          'X-FCM-Token': fcmToken,
        },
        body: JSON.stringify({
          title: '테스트 알림',
          body: '푸시 알림이 정상적으로 작동합니다! 🎉',
        }),
      });

      console.log('O 테스트 알림 전송 성공');
      return true;
    } catch (error) {
      console.error('X 테스트 알림 전송 실패:', error);
      return false;
    }
  }

  // 냉장고 목록 조회
  static async getUserFridges(): Promise<
    Array<{
      id: string;
      name: string;
      description?: string;
      memberCount: number;
      userRole: 'owner' | 'member';
      createdAt: string;
    }>
  > {
    return this.apiCall<
      Array<{
        id: number;
        name: string;
        description?: string;
        memberCount: number;
        userRole: 'owner' | 'member';
        createdAt: string;
      }>
    >('/api/v1/refrigerator');
  }

  // 냉장고 생성
  static async createFridge(fridgeData: {
    name: string;
    description?: string;
  }): Promise<{ id: number; name: string }> {
    if (!fridgeData.name || fridgeData.name.trim() === '') {
      throw new Error('냉장고 이름을 입력해주세요.');
    }

    return this.apiCall<{ id: number; name: string }>('/api/v1/refrigerator', {
      method: 'POST',
      body: JSON.stringify({
        name: fridgeData.name.trim(),
        description: fridgeData.description?.trim() || '',
      }),
    });
  }

  // 냉장고 멤버 초대
  static async inviteMember(
    fridgeId: number,
    inviteData: {
      email?: string;
      userName?: string;
      message?: string;
    },
  ): Promise<void> {
    await this.apiCall<void>(`/api/v1/refrigerator/invitation`, {
      method: 'POST',
      body: JSON.stringify({
        fridgeId,
        ...inviteData,
      }),
    });
  }

  // 냉장고 멤버 삭제 (방장이 멤버를 삭제)
  static async deleteFridgeMember(
    fridgeId: number,
    deleteUserId: number,
  ): Promise<void> {
    console.log('=== 멤버 삭제 API 호출 ===');
    console.log('fridgeId:', fridgeId);
    console.log('deleteUserId:', deleteUserId);

    try {
      const result = await this.apiCall<void>(
        `/api/v1/refrigerator/users/${fridgeId}/${deleteUserId}`,
        {
          method: 'DELETE',
        },
      );
      console.log('O 멤버 삭제 성공:', result);
      return result;
    } catch (error) {
      console.error('X 멤버 삭제 API 실패:', error);
      throw error;
    }
  }
}
