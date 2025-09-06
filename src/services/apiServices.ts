import { AsyncStorageService } from './AsyncStorageService';
import Config from 'react-native-config';
import { CommonActions } from '@react-navigation/native';

// 타입 정의 추가
type SocialProvider = 'KAKAO' | 'NAVER';

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

// 냉장고 아이템 관련 타입 추가
export type ApiFridgeItem = {
  id: string;
  ingredientId: string;
  categoryId: string;
  ingredientName: string;
  expirationDate: string;
  quantity: number;
  unit: string;
  fridgeId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiItemResponse<T> = {
  content: T[];
  pageInfo: {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
};

export type FilterRequest = {
  categoryIds: number[];
  sort: string;
  page: number;
  size: number;
};

export class ApiService {
  // 서버 URL - 실제 서버 주소로 변경해야 합니다
  private static readonly BASE_URL = `${Config.API_BASE_URL}`;

  // 공통 헤더 생성
  private static async getHeaders(): Promise<HeadersInit_> {
    const token = await AsyncStorageService.getAuthToken(); // 인증 토큰 가져오기

    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // 공통 API 호출 메서드
  private static async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const url = `${Config.API_BASE_URL}${endpoint}`;
      const headers = await this.getHeaders();
      console.log(`API 호출: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const responseData: ApiResponse<T> = await response.json();
      console.log(`API 응답 (${response.status}):`, responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      // 성공 코드 체크 (OK가 포함된 코드면 성공)
      if (!responseData.code.includes('OK')) {
        throw new Error(responseData.message || 'API 호출 실패');
      }

      return responseData.result as T; // result 리턴
    } catch (error) {
      console.error('API 호출 실패:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
        );
      }
      throw error;
    }
  }

  // 현재 사용자 정보 조회 (AsyncStorage에서)
  static async getCurrentUser(): Promise<User> {
    try {
      const userId = await AsyncStorageService.getCurrentUserId();

      if (!userId) {
        // 사용자 ID가 없으면 로그아웃 처리
        await this.logout();
        throw new Error('User not found');
      }

      // AsyncStorageService에서 사용자 정보를 가져오기
      const userInfo = await AsyncStorageService.getCurrentUser();

      if (!userInfo) {
        await this.logout();
        throw new Error('User info not found');
      }

      return userInfo;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      // 에러 발생시 로그아웃 처리
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

  // apiServices.ts에 추가
  static async getUserPermissions(): Promise<{ [key: string]: boolean }> {
    return this.apiCall<{ [key: string]: boolean }>(
      '/api/v1/refrigerator/permissions',
    );
  }

  // 냉장고 삭제 (소유자만 가능)
  static async deleteRefrigerator(fridgeId: string): Promise<void> {
    await this.apiCall<void>(`/api/v1/refrigerator/${fridgeId}`, {
      method: 'DELETE',
    });
  }

  // 냉장고 나가기
  static async leaveFridge(fridgeId: string, userId: string): Promise<void> {
    await this.apiCall<void>(
      `/api/v1/refrigerator/users/${fridgeId}/${userId}`,
      {
        method: 'DELETE',
      },
    );
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
    return this.apiCall<{ id: string; name: string }>('/api/v1/refrigerator', {
      method: 'POST',
      body: JSON.stringify(fridgeData),
    });
  }

  // 냉장고 멤버 초대
  static async inviteMember(): Promise<void> {
    await this.apiCall<void>(`/api/v1/refrigerator/invitation`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // 식재료 목록 조회
  static async getFridgeIngredients(fridgeId: string): Promise<
    Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      unit: string;
      expiryDate?: string;
      addedBy: string;
      addedAt: string;
    }>
  > {
    return this.apiCall<
      Array<{
        id: string;
        name: string;
        category: string;
        quantity: number;
        unit: string;
        expiryDate?: string;
        addedBy: string;
        addedAt: string;
      }>
    >(`/ap1/v1/ingredient/${fridgeId}`);
  }

  // 식재료 추가
  static async addIngredient(
    fridgeId: string,
    ingredientData: {
      name: string;
      category: string;
      quantity: number;
      unit: string;
      expiryDate?: string;
    },
  ): Promise<{ id: string }> {
    return this.apiCall<{ id: string }>(`/ap1/v1/ingredient/${fridgeId}`, {
      method: 'POST',
      body: JSON.stringify(ingredientData),
    });
  }

  // 식재료 수정
  static async updateIngredient(
    fridgeId: string,
    fridgeIngredientId: string,
    updateData: Partial<{
      name: string;
      category: string;
      quantity: number;
      unit: string;
      expiryDate?: string;
    }>,
  ): Promise<void> {
    await this.apiCall<void>(`/ap1/v1/ingredient/${fridgeIngredientId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // ========== 냉장고 아이템 관리 기능 추가 ==========

  // 냉장고 아이템 조회 (필터링 포함) - 기존 엔드포인트 패턴 사용
  static async getFridgeItems(
    fridgeId: string,
    filter: Partial<FilterRequest> = {},
  ): Promise<ApiItemResponse<ApiFridgeItem>> {
    const defaultFilter: FilterRequest = {
      categoryIds: [],
      sort: 'createdAt',
      page: 0,
      size: 50,
      ...filter,
    };

    // filterRequest를 쿼리 파라미터로 변환
    const queryParams = new URLSearchParams();
    queryParams.append(
      'categoryIds',
      JSON.stringify(defaultFilter.categoryIds),
    );
    queryParams.append('sort', defaultFilter.sort);
    queryParams.append('page', defaultFilter.page.toString());
    queryParams.append('size', defaultFilter.size.toString());

    const endpoint = `/ap1/v1/ingredient/${fridgeId}?${queryParams.toString()}`;

    return this.apiCall<ApiItemResponse<ApiFridgeItem>>(endpoint);
  }

  // 냉장고 아이템 업데이트 - 기존 엔드포인트 패턴 사용
  static async updateFridgeItem(
    itemId: string,
    updates: {
      unit?: string;
      expirationDate?: string;
      quantity?: number;
    },
  ): Promise<ApiFridgeItem> {
    return this.apiCall<ApiFridgeItem>(`/ap1/v1/ingredient/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // 냉장고 아이템 삭제 - 기존 엔드포인트 패턴 사용
  static async deleteFridgeItem(itemId: string): Promise<void> {
    return this.apiCall<void>(`/ap1/v1/ingredient/${itemId}`, {
      method: 'DELETE',
    });
  }

  // 냉장고 아이템 추가 - 기존 엔드포인트 패턴 사용
  static async addFridgeItem(
    fridgeId: string,
    item: {
      ingredientName: string;
      categoryId: number;
      quantity: number;
      unit: string;
      expirationDate: string;
    },
  ): Promise<ApiFridgeItem> {
    return this.apiCall<ApiFridgeItem>(`/ap1/v1/ingredient/${fridgeId}`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  // 여러 아이템 일괄 추가
  static async addMultipleFridgeItems(
    fridgeId: string,
    items: Array<{
      ingredientName: string;
      categoryId: number;
      quantity: number;
      unit: string;
      expirationDate: string;
    }>,
  ): Promise<ApiFridgeItem[]> {
    return this.apiCall<ApiFridgeItem[]>(
      `/ap1/v1/ingredient/${fridgeId}/batch`,
      {
        method: 'POST',
        body: JSON.stringify({ items }),
      },
    );
  }

  // 카테고리 목록 조회 (필요시 추가)
  static async getCategories(): Promise<
    Array<{
      id: number;
      name: string;
    }>
  > {
    return this.apiCall<
      Array<{
        id: number;
        name: string;
      }>
    >('/api/v1/categories');
  }

  // ========== 기존 코드 계속 ==========

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
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset)
      queryParams.append('offset', options.offset.toString());
    if (options?.startDate) queryParams.append('startDate', options.startDate);
    if (options?.endDate) queryParams.append('endDate', options.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/history`;

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
    }>(endpoint);
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

    // 토큰과 사용자 정보를 AsyncStorage에 저장
    await AsyncStorageService.setAuthToken(response.token);
    await AsyncStorageService.setCurrentUserId(response.user.id);
    await AsyncStorageService.setCurrentUser(response.user);

    return response;
  }

  // 로그아웃
  static async logout(navigation?: any): Promise<void> {
    try {
      // 서버 로그아웃 API 호출
      await this.apiCall<void>('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // 서버 로그아웃 실패해도 로컬 데이터는 클리어
      console.warn('서버 로그아웃 실패:', error);
    } finally {
      // 모든 인증 관련 데이터 삭제
      await AsyncStorageService.clearAllAuthData();

      // 로그인 화면으로 이동 (navigation이 전달된 경우)
      if (navigation) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }], // 실제 로그인 스크린 이름으로 변경
          }),
        );
      }
    }
  }

  // 액세스 토큰 갱신
  static async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorageService.getRefreshToken();

      if (!refreshToken) {
        console.log('리프레시 토큰이 없습니다');
        return false;
      }

      console.log('리프레시 토큰으로 액세스 토큰 갱신 중...');

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );

      if (!response.ok) {
        console.log('토큰 갱신 실패:', response.status);
        return false;
      }

      const responseData: ApiResponse<{
        token: string;
        refreshToken?: string;
      }> = await response.json();

      if (!responseData.success || !responseData.data) {
        console.log('토큰 갱신 응답 실패');
        return false;
      }

      // 새 액세스 토큰 저장
      await AsyncStorageService.setAuthToken(responseData.data.token);

      // 새 리프레시 토큰이 있으면 저장
      if (responseData.data.refreshToken) {
        await AsyncStorageService.setRefreshToken(
          responseData.data.refreshToken,
        );
      }

      console.log('토큰 갱신 성공');
      return true;
    } catch (error) {
      console.error('토큰 갱신 중 오류 발생:', error);
      return false;
    }
  }

  // 토큰 유효성 검증
  static async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.log('토큰 유효성 검증 실패:', error);
      return false;
    }
  }
}
