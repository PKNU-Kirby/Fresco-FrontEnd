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

// API Endpoints types
// ============================================================================

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/v1/auth/login', // POST - 로그인(회원가입 자동)
    REFRESH: '/api/v1/auth/refresh', // GET - 액세스 토큰 재발급 요청
    LOGOUT: '/api/v1/auth/logout', // POST - 로그아웃
  },

  // Refrigerator
  REFRIGERATOR: {
    LIST: '/api/v1/refrigerator', // GET - 냉장고 전체 조회
    CREATE: '/api/v1/refrigerator', // POST - 냉장고 생성
    DETAIL: (id: string) => `/api/v1/refrigerator/${id}`, // GET - 냉장고 상세 조회
    UPDATE: (id: string) => `/api/v1/refrigerator/${id}`, // PUT - 냉장고 이름 변경
    DELETE: (id: string) => `/api/v1/refrigerator/${id}`, // DELETE - 냉장고 삭제
    ADD_USER: (id: string) => `/api/v1/refrigerator/${id}/user`, // POST - 냉장고 그룹에 인원 추가
    REMOVE_USER: (id: string) => `/api/v1/refrigerator/${id}/user`, // DELETE - 냉장고 그룹에서 인원 삭제
    INVITATION: {
      CREATE: '/api/v1/refrigerator/invitation', // POST - 냉장고 초대 정보 생성
      GET: '/api/v1/refrigerator/invitation', // GET - 냉장고 초대 정보 불러오기
    },
  },

  // Ingredient
  INGREDIENT: {
    LIST: (refrigeratorId: string) => `/api/v1/ingredient/${refrigeratorId}`, // GET - 식재료 전체 조회
    BY_CATEGORY: (refrigeratorId: string) =>
      `/api/v1/ingredient/${refrigeratorId}/category`, // GET - 카테고리별 식재료 조회
    UPDATE: (refrigeratorId: string, ingredientId: string) =>
      `/api/v1/ingredient/${refrigeratorId}/${ingredientId}`, // PATCH - 식재료 정보 변경
    USAGE_HISTORY: (refrigeratorId: string) =>
      `/api/v1/ingredient/${refrigeratorId}/history`, // GET - 사용 기록 조회
  },

  // Grocery
  GROCERY: {
    CREATE: '/grocery/item', // POST - 장바구니 항목 등록
    LIST: (groceryListId: string) => `/grocery/${groceryListId}`, // GET - 장바구니 전체 조회
    UPDATE: (groceryListId: string) => `/grocery/${groceryListId}/update`, // PATCH - 장바구니 정보 수정
    DELETE: (groceryListId: string) => `/grocery/${groceryListId}/delete`, // DELETE - 장바구니 항목 삭제
  },
} as const;

// API Response code types
// ============================================================================
// 나중에 다시 확인

// success code
export type SuccessCode =
  | 'AUTH_OK_001' // 로그인 성공
  | 'AUTH_OK_002' // 토큰 재발급 성공
  | 'AUTH_OK_003' // 로그아웃 성공
  | 'USER_OK_001' // 사용자 정보 조회 성공
  | 'USER_OK_002' // 사용자 정보 업데이트 성공
  | 'FRIDGE_OK_001' // 냉장고 조회 성공
  | 'FRIDGE_OK_002'; // 냉장고 생성 성공

// error code
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

// Common Api Response
// ============================================================================

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
    stack?: string; // dev mode
  };
}

// API Client Config types
// ============================================================================

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
}

// Request / Response Interceptor types
// ============================================================================

export type RequestInterceptor = (
  config: ApiRequestConfig,
) => ApiRequestConfig | Promise<ApiRequestConfig>;

export type ResponseInterceptor = (
  response: ApiResponse,
) => ApiResponse | Promise<ApiResponse>;

export type ErrorInterceptor = (error: any) => any | Promise<any>;

// API Logging types
// ============================================================================

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: HttpMethod;
  url: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  duration?: number;
  error?: any;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ApiLogger {
  log: (level: LogLevel, message: string, data?: any) => void;
  logRequest: (config: ApiRequestConfig) => void;
  logResponse: (response: ApiResponse) => void;
  logError: (error: any) => void;
}

// API Hook types (React Query나 SWR 사용 시)
// ============================================================================

export interface UseApiOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  retryOnMount?: boolean;
  staleTime?: number;
  cacheTime?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface ApiMutationOptions {
  onSuccess?: (data: any, variables: any) => void;
  onError?: (error: any, variables: any) => void;
  onSettled?: (data: any, error: any, variables: any) => void;
}

// Environment Config
// ============================================================================

export interface EnvironmentConfig {
  apiBaseUrl: string;
  enableApiLogging: boolean;
  apiTimeout: number;
  enableMocking: boolean;
  mockDelay: number;
}

export type Environment = 'development' | 'staging' | 'production';

export type EnvironmentConfigs = Record<Environment, EnvironmentConfig>;
