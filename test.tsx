import { AsyncStorageService } from './AsyncStorageService';
import Config from 'react-native-config';
import { CommonActions } from '@react-navigation/native';

// API 응답 타입 정의
type ApiResponse<T> = {
  code: string;
  message: string;
  result: T;
};

type User = {
  id: string;
  name: string;
};

type FridgeMember = {
  id: string;
  name: string;
  role: 'owner' | 'member';
};

// 토큰 갱신 상태 관리
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export class ApiService {
  // 🔥 인증 관련 엔드포인트 확인 메서드 추가
  private static isAuthEndpoint(endpoint: string): boolean {
    return (
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/logout') ||
      endpoint.includes('/auth/refresh')
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

  // 토큰 갱신 메서드 (동시성 제어 추가)
  static async refreshAccessToken(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
      console.log('⏳ 토큰 갱신이 이미 진행 중입니다. 기존 프로미스를 반환합니다.');
      return await refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        console.log('🔄 토큰 갱신 시작...');
        const refreshToken = await AsyncStorageService.getRefreshToken();
        
        if (!refreshToken) {
          console.log('❌ 리프레시 토큰이 없습니다');
          return false;
        }

        const response = await fetch(
          `${Config.API_BASE_URL}/api/v1/auth/refresh`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 🔥 Authorization 헤더 제거 (refresh token은 body로만 전송)
            },
            body: JSON.stringify({ refreshToken }),
          },
        );

        if (!response.ok) {
          console.log('❌ 토큰 갱신 HTTP 실패:', response.status);
          
          // 🔥 401/403이면 토큰 만료로 간주
          if (response.status === 401 || response.status === 403) {
            console.log('🚪 토큰 만료 - 재로그인 필요');
            await this.logout();
          }
          
          return false;
        }

        const responseData: ApiResponse<{
          accessToken: string;
          refreshToken?: string;
        }> = await response.json();

        if (!responseData.code.includes('OK') || !responseData.result) {
          console.log('❌ 토큰 갱신 응답 실패:', responseData.message);
          return false;
        }

        // 새 토큰 저장
        await AsyncStorageService.setAuthToken(responseData.result.accessToken);
        if (responseData.result.refreshToken) {
          await AsyncStorageService.setRefreshToken(
            responseData.result.refreshToken,
          );
        }

        console.log('✅ 토큰 갱신 성공');
        return true;
      } catch (error) {
        console.error('❌ 토큰 갱신 중 오류:', error);
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return await refreshPromise;
  }

  // 공통 API 호출 메서드 (토큰 갱신 로직 추가)
  public static async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0,
  ): Promise<T> {
    try {
      const url = `${Config.API_BASE_URL}${endpoint}`;
      const headers = await this.getHeaders();

      console.log(`📡 API 호출: ${options.method || 'GET'} ${url}`);
      if (options.body) {
        console.log('📤 요청 데이터:', options.body);
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // 🔥 401 에러 처리 - 인증 엔드포인트는 제외
      if (response.status === 401 && retryCount === 0) {
        // 🔥 로그아웃, 로그인, 리프레시는 재시도 안 함
        if (this.isAuthEndpoint(endpoint)) {
          console.log('🚫 인증 엔드포인트는 401 재시도 안 함:', endpoint);
          
          // 로그아웃 실패는 무시하고 로컬 클리어만
          if (endpoint.includes('/auth/logout')) {
            await AsyncStorageService.clearAllAuthData();
            throw new Error('로그아웃 처리됨');
          }
          
          // 다른 인증 엔드포인트는 에러 전파
          const errorText = await response.text();
          throw new Error(errorText || '인증 실패');
        }

        // 🔥 일반 API만 토큰 갱신 시도
        console.log('🔐 401 에러 감지, 토큰 갱신 시도...');
        const refreshSuccess = await this.refreshAccessToken();

        if (refreshSuccess) {
          console.log('✅ 토큰 갱신 성공, API 재시도...');
          return this.apiCall<T>(endpoint, options, retryCount + 1);
        } else {
          console.log('❌ 토큰 갱신 실패, 로그아웃 처리');
          await this.logout();
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 에러 응답:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
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
      console.log(`✅ API 응답 (${response.status}):`, responseText.substring(0, 200));

      if (!responseText.trim()) {
        return {} as T;
      }

      const responseData = JSON.parse(responseText);

      // ApiResponse 구조인 경우 result 반환, 아닌 경우 전체 반환
      if (
        responseData.code !== undefined &&
        responseData.result !== undefined
      ) {
        if (!responseData.code.includes('OK')) {
          throw new Error(responseData.message || 'API 호출 실패');
        }
        return responseData.result as T;
      } else {
        return responseData as T;
      }
    } catch (error) {
      console.error('❌ API 호출 실패:', error);
      
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
  static async getFridgeMembers(fridgeId: string): Promise<FridgeMember[]> {
    return this.apiCall<FridgeMember[]>(
      `/api/v1/refrigerator/users/${fridgeId}`,
    );
  }

  // 냉장고 나가기
  static async leaveFridge(fridgeId: string, userId: string): Promise<void> {
    await this.apiCall<void>(
      `/api/v1/refrigerator/users/${fridgeId}/${userId}?ids=${userId}`,
      {
        method: 'DELETE',
      },
    );
  }

  // 냉장고 목록 조회
  static async getUserFridges(): Promise
    Array<{
      id: string;
      name: string;
      description?: string;
      memberCount: number;
      userRole: 'owner' | 'member';
      createdAt: string;
    }>
   {
    return this.apiCall
      Array<{
        id: string;
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
  }): Promise<{ id: string; name: string }> {
    if (!fridgeData.name || fridgeData.name.trim() === '') {
      throw new Error('냉장고 이름을 입력해주세요.');
    }

    return this.apiCall<{ id: string; name: string }>('/api/v1/refrigerator', {
      method: 'POST',
      body: JSON.stringify({
        name: fridgeData.name.trim(),
        description: fridgeData.description?.trim() || '',
      }),
    });
  }

  // 냉장고 멤버 초대
  static async inviteMember(
    fridgeId: string,
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

  // 냉장고 멤버 삭제 (방장이 구성원을 삭제)
  static async deleteFridgeMember(
    fridgeId: string,
    deleteUserId: string,
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
      console.log('✅ 멤버 삭제 성공:', result);
      return result;
    } catch (error) {
      console.error('❌ 멤버 삭제 API 실패:', error);
      throw error;
    }
  }

  // 사용 기록 조회
  static async getUsageHistory(
    fridgeId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{
    history: Array<{
      id: string;
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
        id: string;
        ingredientName: string;
        action: 'added' | 'updated' | 'deleted' | 'consumed';
        quantity?: number;
        unit?: string;
        userName: string;
        createdAt: string;
      }>;
      total: number;
    }>(`/api/v1/history?${queryParams.toString()}`);
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

  // 🔥 로그아웃 - 개선된 버전
  static async logout(navigation?: any): Promise<void> {
    console.log('🚪 로그아웃 시작');
    
    try {
      // 🔥 로그아웃 API 호출 시도 (실패해도 계속 진행)
      try {
        await this.apiCall<void>('/api/v1/auth/logout', {
          method: 'POST',
        });
        console.log('✅ 서버 로그아웃 성공');
      } catch (logoutError) {
        console.warn('⚠️ 서버 로그아웃 실패 (무시):', logoutError);
        // 서버 로그아웃 실패해도 로컬 클리어는 진행
      }
    } finally {
      // 🔥 무조건 실행되는 정리 작업
      console.log('🧹 로컬 데이터 클리어');
      
      // 토큰 갱신 상태 초기화
      isRefreshing = false;
      refreshPromise = null;
      
      // 로컬 스토리지 클리어
      await AsyncStorageService.clearAllAuthData();
      
      // 네비게이션 리셋
      if (navigation) {
        console.log('🔄 로그인 화면으로 이동');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          }),
        );
      }
      
      console.log('✅ 로그아웃 완료');
    }
  }
}