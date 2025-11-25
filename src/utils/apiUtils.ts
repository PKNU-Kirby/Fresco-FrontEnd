import Config from '../types/config';
import { getAccessToken, isTokenExpired } from './authUtils';
import { AuthAPIService } from '../services/API/authAPI';
import { ApiErrorHandler } from './errorHandler';

// 인증이 필요한 API 호출 헬퍼
export const apiCallWithAuth = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  try {
    let accessToken = await getAccessToken();

    // 토큰 만료 체크 및 갱신
    if (accessToken && isTokenExpired(accessToken)) {
      const refreshSuccess = await AuthAPIService.refreshToken();
      if (!refreshSuccess) {
        throw new Error('토큰 갱신 실패 - 재로그인 필요');
      }
      accessToken = await getAccessToken();
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    const response = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 401 에러 시 토큰 갱신 후 재시도
    if (response.status === 401) {
      const refreshSuccess = await AuthAPIService.refreshToken();

      if (refreshSuccess) {
        const newToken = await getAccessToken();
        const retryResponse = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
        return retryResponse;
      } else {
        throw new Error('토큰 갱신 실패 - 재로그인 필요');
      }
    }

    return response;
  } catch (error) {
    // console.error('API 호출 실패:', error);
    throw error;
  }
};

// 인증이 필요없는 API 호출 헬퍼
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return response;
  } catch (error) {
    // console.error('API 호출 실패:', error);
    throw error;
  }
};

export class ApiUtils {
  /**
   * 재시도 로직이 포함된 API 호출
   */
  static async callWithRetry<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 2,
    retryDelay: number = 1000,
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;

        // 재시도 불가능한 에러면 즉시 throw
        if (!ApiErrorHandler.isRetryableError(error)) {
          throw error;
        }

        // 마지막 시도였으면 에러 throw
        if (attempt === maxRetries) {
          break;
        }

        // 재시도 전 딜레이
        console.log(
          `API 호출 실패 (${attempt + 1}/${
            maxRetries + 1
          }). ${retryDelay}ms 후 재시도...`,
        );
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // 지수 백오프
      }
    }

    throw lastError;
  }

  /**
   * 응답 검증
   */
  static validateApiResponse(
    response: any,
    expectedCodes: string[] = [],
  ): boolean {
    if (!response) return false;
    if (expectedCodes.length === 0)
      return !!response.result || response.success === true;
    return expectedCodes.includes(response.code);
  }

  /**
   * URL 파라미터 생성
   */
  static buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * HTTP 요청 타임아웃 설정
   */
  static createTimeoutPromise<T>(
    promise: Promise<T>,
    timeoutMs: number = 30000,
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject({
            code: 'TIMEOUT_ERROR',
            message: `요청 시간이 ${timeoutMs}ms를 초과했습니다.`,
          });
        }, timeoutMs);
      }),
    ]);
  }

  /**
   * Base64 인코딩
   */
  static base64Encode(str: string): string {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (error) {
      // console.error('Base64 인코딩 실패:', error);
      return '';
    }
  }

  /**
   * Base64 디코딩
   */
  static base64Decode(str: string): string {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch (error) {
      // console.error('Base64 디코딩 실패:', error);
      return '';
    }
  }

  /**
   * FormData 생성 헬퍼
   */
  static createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else {
          formData.append(key, value);
        }
      }
    });

    return formData;
  }
}
