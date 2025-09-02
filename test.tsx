import Config from 'react-native-config';
import type { SocialProvider } from '../types/auth';

// HTTP types
// ============================================================================

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
    DETAIL: (id: string) => `/api/v1/refrigerator/${id}`,
    UPDATE: (id: string) => `/api/v1/refrigerator/${id}`,
    DELETE: (id: string) => `/api/v1/refrigerator/${id}`,
    ADD_USER: (id: string) => `/api/v1/refrigerator/${id}/user`,
    REMOVE_USER: (id: string) => `/api/v1/refrigerator/${id}/user`,
    INVITATION: {
      CREATE: '/api/v1/refrigerator/invitation',
      GET: '/api/v1/refrigerator/invitation',
    },
  },
  INGREDIENT: {
    LIST: (refrigeratorId: string) => `/api/v1/ingredient/${refrigeratorId}`,
    BY_CATEGORY: (refrigeratorId: string) =>
      `/api/v1/ingredient/${refrigeratorId}/category`,
    UPDATE: (refrigeratorId: string, ingredientId: string) =>
      `/api/v1/ingredient/${refrigeratorId}/${ingredientId}`,
    USAGE_HISTORY: (refrigeratorId: string) =>
      `/api/v1/ingredient/${refrigeratorId}/history`,
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

// Auth API Request Types
// ============================================================================

export interface LoginRequest {
  provider: SocialProvider;
  accessToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Auth API Response Types
// ============================================================================

export interface LoginResponse extends SuccessApiResponse {
  code: 'AUTH_OK_001';
  result: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    user?: {
      id: string;
      name: string;
      email?: string;
      profileImage?: string;
      provider: SocialProvider;
      providerId: string;
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

// API Functions
// ============================================================================

export const loginAPI = async (
  provider: SocialProvider,
  accessToken: string,
): Promise<LoginResponse> => {
  const response = await fetch(
    `${Config.API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        accessToken,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const refreshTokenAPI = async (
  refreshToken: string,
): Promise<RefreshTokenResponse> => {
  const response = await fetch(
    `${Config.API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const logoutAPI = async (accessToken: string): Promise<void> => {
  const response = await fetch(
    `${Config.API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};
