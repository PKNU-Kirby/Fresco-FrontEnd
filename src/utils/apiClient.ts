// utils/apiClient.ts - 통합 API 클라이언트
import Config from 'react-native-config';

export class ApiClient {
  private static baseURL = Config.API_BASE_URL;

  /**
   * 인증이 필요한 API 호출
   */
  static async authenticatedRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await getValidAccessToken();

    if (!token) {
      throw { status: 401, message: '인증 토큰이 없습니다' };
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;

      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      throw {
        status: response.status,
        message: errorData.message || response.statusText,
        data: errorData,
      };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return (await response.text()) as any;
    }
  }

  /**
   * GET 요청
   */
  static async get<T = any>(endpoint: string): Promise<T> {
    return this.authenticatedRequest<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST 요청
   */
  static async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.authenticatedRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청
   */
  static async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.authenticatedRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   */
  static async delete<T = any>(endpoint: string): Promise<T> {
    return this.authenticatedRequest<T>(endpoint, { method: 'DELETE' });
  }
}
