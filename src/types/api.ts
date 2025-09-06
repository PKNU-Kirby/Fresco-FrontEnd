import Config from 'react-native-config';
import type { SocialProvider } from '../types/auth';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  logout as clearAuth,
} from '../utils/authUtils';

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
    // 수정된 엔드포인트들 (API 명세에 맞춤)
    USERS: {
      LIST: (refrigeratorId: string) =>
        `/api/v1/refrigerator/users/${refrigeratorId}`,
      ADD: (refrigeratorId: string) =>
        `/api/v1/refrigerator/users/${refrigeratorId}`,
      REMOVE: (refrigeratorId: string, deleteUserId: string) =>
        `/api/v1/refrigerator/users/${refrigeratorId}/${deleteUserId}`,
    },
    INVITATION: {
      CREATE: '/api/v1/refrigerator/invitation',
      GET: (refrigeratorInvitationId: string) =>
        `/api/v1/refrigerator/invitation/${refrigeratorInvitationId}`,
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
  GROCERY: {
    CREATE: '/grocery/item',
    LIST: (groceryListId: string) => `/grocery/${groceryListId}`,
    UPDATE: (groceryListId: string) => `/grocery/${groceryListId}/update`,
    DELETE: (groceryListId: string) => `/grocery/${groceryListId}/delete`,
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

// API Call Helper
// ============================================================================

// 토큰 갱신 함수
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      console.log('리프레시 토큰이 없습니다');
      return false;
    }

    console.log('토큰 갱신 시도...');
    const response = await fetch(
      `${Config.API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (!response.ok) {
      console.log('토큰 갱신 HTTP 에러:', response.status);
      return false;
    }

    const result = await response.json();

    if (result.code === 'AUTH_OK_002') {
      await saveTokens(result.result.accessToken, result.result.refreshToken);
      console.log('토큰 갱신 성공');
      return true;
    } else {
      console.log('토큰 갱신 응답 실패:', result.message);
      return false;
    }
  } catch (error) {
    console.error('토큰 갱신 에러:', error);
    return false;
  }
};

// 자동 토큰 갱신 포함 API 호출 헬퍼
const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  // 1st : 액세스 토큰 헤더에 추가
  const accessToken = await getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  let response = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // re (401 error) -> 토큰 갱신, 재시도
  if (response.status === 401) {
    console.log('401 에러 감지, 토큰 갱신 후 재시도...');

    const refreshSuccess = await refreshAccessToken();

    if (refreshSuccess) {
      // 새 토큰
      const newAccessToken = await getAccessToken();
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      response = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
      });

      console.log('토큰 갱신 후 재요청 완료, 상태:', response.status);
    } else {
      // 토큰 갱신 실패 -> 로그아웃
      console.log('토큰 갱신 실패, 인증 데이터 삭제');
      await clearAuth();
      throw new Error('AUTHENTICATION_FAILED');
    }
  }

  return response;
};

// API Functions
// ============================================================================

// 로그인 (토큰 필요x)
export const loginAPI = async (
  provider: SocialProvider,
  accessToken: string,
): Promise<LoginResponse> => {
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

// 로그아웃 (토큰 자동 갱신)
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

export const updateRefrigerator = async (id: string, data: any) => {
  const response = await apiCall(API_ENDPOINTS.REFRIGERATOR.UPDATE(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const getRefrigeratorDetail = async (id: string) => {
  const response = await apiCall(API_ENDPOINTS.REFRIGERATOR.DETAIL(id), {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 새로 추가된 API 함수들 (API 명세에 맞춤)
// ============================================================================

// 냉장고 사용자 목록 조회
export const getRefrigeratorUsers = async (refrigeratorId: string) => {
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
  refrigeratorId: string,
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
  refrigeratorId: string,
  deleteUserId: string,
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
export const deleteRefrigerator = async (refrigeratorId: string) => {
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
  refrigeratorName: string,
  inviterId: number,
  inviterName: string,
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
  refrigeratorInvitationId: string,
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

export const getIngredientList = async (refrigeratorId: string) => {
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

export const getIngredientsByCategory = async (refrigeratorId: string) => {
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
  refrigeratorId: string,
  ingredientId: string,
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
