import Config from './config';
import { AsyncStorageService } from '../services/AsyncStorageService';
import type { SocialProvider } from '../types/auth';
import { clearTokens } from '../utils/authUtils';
import { refreshAccessToken } from '../services/AsyncStorageService';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
  },
  REFRIGERATOR: {
    LIST: '/api/v1/refrigerator',
    CREATE: '/api/v1/refrigerator',
    DETAIL: (id: number) => `/api/v1/refrigerator/${id}`,
    UPDATE: (id: number) => `/api/v1/refrigerator/${id}`,
    DELETE: (id: number) => `/api/v1/refrigerator/${id}`,
    ADD_USER: (id: number) => `/api/v1/refrigerator/${id}/user`,
    REMOVE_USER: (id: number) => `/api/v1/refrigerator/${id}/user`,
    USERS: {
      LIST: (refrigeratorId: number) =>
        `/api/v1/refrigerator/users/${refrigeratorId}`,
      ADD: (refrigeratorId: number) =>
        `/api/v1/refrigerator/users/${refrigeratorId}`,
      REMOVE: (refrigeratorId: number, deleteUserId: number) =>
        `/api/v1/refrigerator/users/${refrigeratorId}/${deleteUserId}`,
    },
    INVITATION: {
      CREATE: '/api/v1/refrigerator/invitation',
      GET: (refrigeratorInvitationId: number) =>
        `/api/v1/refrigerator/invitation/${refrigeratorInvitationId}`,
    },
  },
  INGREDIENT: {
    LIST: (refrigeratorId: number) => `/api/v1/ingredient/${refrigeratorId}`,
    BY_CATEGORY: (refrigeratorId: number) =>
      `/api/v1/ingredient/${refrigeratorId}/category`,
    UPDATE: (refrigeratorId: number, ingredientId: number) =>
      `/api/v1/ingredient/${refrigeratorId}/${ingredientId}`,
    USAGE_HISTORY: (refrigeratorId: number) =>
      `/api/v1/history/${refrigeratorId}`,
  },
  GROCERY: {
    CREATE: '/grocery/item',
    LIST: (groceryListId: number) => `/grocery/${groceryListId}`,
    UPDATE: (groceryListId: number) => `/grocery/${groceryListId}/update`,
    DELETE: (groceryListId: number) => `/grocery/${groceryListId}/delete`,
  },
} as const;

// API Response Types
// ============================================================================

export type SuccessCode =
  | 'AUTH_OK_001' // 로그인 성공
  | 'AUTH_OK_002' // 토큰 재발급 성공
  | 'AUTH_OK_003' // 로그아웃 성공
  | 'USER_OK_001' // 사용자 정보 조회 성공
  | 'USER_OK_002' // 사용자 정보 업데이트 성공
  | 'FRIDGE_OK_001' // 냉장고 조회 성공
  | 'FRIDGE_OK_002'; // 냉장고 생성 성공

export type ErrorCode =
  | 'AUTH_ERR_001' // 유효하지 않은 토큰
  | 'AUTH_ERR_002' // 토큰 만료
  | 'AUTH_ERR_003' // 인증 실패
  | 'AUTH_ERR_004' // 권한 없음
  | 'USER_ERR_001' // 사용자 없음
  | 'USER_ERR_002' // 잘못된 사용자 정보
  | 'FRIDGE_ERR_001' // 냉장고 없음
  | 'FRIDGE_ERR_002' // 냉장고 접근 권한 없음
  | 'COMMON_ERR_001' // 서버 내부 오류
  | 'COMMON_ERR_002' // 잘못된 요청
  | 'COMMON_ERR_003'; // 네트워크 오류

export interface BaseApiResponse {
  code: SuccessCode | ErrorCode;
  message: string;
  timestamp?: string;
}

export interface SuccessApiResponse<T = any> extends BaseApiResponse {
  code: SuccessCode;
  result: T;
}

export interface ErrorApiResponse extends BaseApiResponse {
  code: ErrorCode;
  error?: {
    details?: any;
    stack?: string;
  };
}

// Auth API Request/Response Types
// ============================================================================

export interface LoginRequest {
  provider: SocialProvider;
  accessToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LoginResponse extends SuccessApiResponse {
  code: 'AUTH_OK_001';
  result: {
    userId: number;
    accessToken: string;
    refreshToken: string;
    user?: {
      id: number;
      name: string;
      email?: string;
      profileImage?: string;
      provider: SocialProvider;
      providerId: number;
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

export interface RefreshTokenResponse extends SuccessApiResponse {
  code: 'AUTH_OK_002';
  result: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LogoutResponse extends SuccessApiResponse {
  code: 'AUTH_OK_003';
  result: {
    message: string;
  };
}

const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0,
): Promise<Response> => {
  try {
    const accessToken = await AsyncStorageService.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    console.log(`API 호출: ${options.method || 'GET'} ${endpoint}`);
    console.log(
      '토큰 사용:',
      accessToken ? `${accessToken.substring(0, 20)}...` : 'none',
    );

    let response = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`API 응답: ${response.status} ${response.statusText}`);

    // 401 에러이고 재시도가 1회 미만인 경우
    if (response.status === 401 && retryCount < 1) {
      console.log('401 에러 감지, 토큰 갱신 후 재시도...');

      const refreshSuccess = await refreshAccessToken();

      if (refreshSuccess) {
        console.log('토큰 갱신 성공, API 재시도...');
        // 재귀 호출로 재시도 (retryCount 증가로 무한 루프 방지)
        return apiCall(endpoint, options, retryCount + 1);
      } else {
        console.log('토큰 갱신 실패, 인증 데이터 삭제 후 로그아웃');
        await clearTokens();
        throw new Error('AUTHENTICATION_FAILED');
      }
    }

    return response;
  } catch (error) {
    // console.error('API 호출 실패:', error);
    throw error;
  }
};

// API Functions
// ============================================================================

// 로그인
export const loginAPI = async (
  provider: SocialProvider,
  accessToken: string,
): Promise<LoginResponse> => {
  console.log('🔍 Config.API_BASE_URL:', Config.API_BASE_URL);
  console.log(
    '🔍 전체 URL:',
    `${Config.API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
  );
  const response = await fetch(
    `${Config.API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, accessToken }),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 로그아웃
export const logoutAPI = async (): Promise<void> => {
  const response = await apiCall(API_ENDPOINTS.AUTH.LOGOUT, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

// 수동 토큰 갱신
export const refreshTokenAPI = async (
  refreshToken: string,
): Promise<RefreshTokenResponse> => {
  const response = await fetch(
    `${Config.API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 냉장고 API (토큰 자동 갱신)
// ============================================================================

export const getRefrigeratorList = async () => {
  const response = await apiCall(API_ENDPOINTS.REFRIGERATOR.LIST, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const createRefrigerator = async (name: string) => {
  const response = await apiCall(API_ENDPOINTS.REFRIGERATOR.CREATE, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const updateRefrigerator = async (id: number, data: any) => {
  const response = await apiCall(API_ENDPOINTS.REFRIGERATOR.UPDATE(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const getRefrigeratorDetail = async (id: number) => {
  const response = await apiCall(API_ENDPOINTS.REFRIGERATOR.DETAIL(id), {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 냉장고 사용자 목록 조회
export const getRefrigeratorUsers = async (refrigeratorId: number) => {
  const response = await apiCall(
    API_ENDPOINTS.REFRIGERATOR.USERS.LIST(refrigeratorId),
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 냉장고에 사용자 추가
export const addUserToRefrigerator = async (
  refrigeratorId: number,
  inviterName: string,
) => {
  const response = await apiCall(
    API_ENDPOINTS.REFRIGERATOR.USERS.ADD(refrigeratorId),
    {
      method: 'POST',
      body: JSON.stringify({ inviterName }),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 특정 사용자를 냉장고에서 제거
export const removeUserFromRefrigerator = async (
  refrigeratorId: number,
  deleteUserId: number,
) => {
  const response = await apiCall(
    API_ENDPOINTS.REFRIGERATOR.USERS.REMOVE(refrigeratorId, deleteUserId),
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 냉장고 삭제
export const deleteRefrigerator = async (refrigeratorId: number) => {
  const response = await apiCall(
    API_ENDPOINTS.REFRIGERATOR.DELETE(refrigeratorId),
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 냉장고 초대장 생성
export const createRefrigeratorInvitation = async (
  refrigeratorId: number,
  refrigeratorName: number,
  inviterId: number,
  inviterName: number,
) => {
  const response = await apiCall(API_ENDPOINTS.REFRIGERATOR.INVITATION.CREATE, {
    method: 'POST',
    body: JSON.stringify({
      refrigeratorId,
      refrigeratorName,
      inviterId,
      inviterName,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 냉장고 초대장 조회
export const getRefrigeratorInvitation = async (
  refrigeratorInvitationId: number,
) => {
  const response = await apiCall(
    API_ENDPOINTS.REFRIGERATOR.INVITATION.GET(refrigeratorInvitationId),
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 식재료 API (토큰 자동 갱신)
// ============================================================================

export const getIngredientList = async (refrigeratorId: number) => {
  const response = await apiCall(
    API_ENDPOINTS.INGREDIENT.LIST(refrigeratorId),
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const getIngredientsByCategory = async (refrigeratorId: number) => {
  const response = await apiCall(
    API_ENDPOINTS.INGREDIENT.BY_CATEGORY(refrigeratorId),
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const updateIngredient = async (
  refrigeratorId: number,
  ingredientId: number,
  data: any,
) => {
  const response = await apiCall(
    API_ENDPOINTS.INGREDIENT.UPDATE(refrigeratorId, ingredientId),
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
