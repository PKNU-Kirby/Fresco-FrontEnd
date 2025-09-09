import Config from 'react-native-config';
import { getValidAccessToken } from '../utils/authUtils';

export interface FridgeCreateRequest {
  name: string;
}

export interface FridgeUpdateRequest {
  name: string;
}

export interface FridgeCreateResponse {
  id: number;
  name: string;
  groceryListId: number;
}

export interface FridgeUpdateResponse {
  id: number;
  name: string;
  groceryListId: number;
}

export type FridgeDeleteResponse = string;

export class FridgeControllerAPI {
  /**
   * 공통 API 호출 헬퍼
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const url = `${Config.API_BASE_URL}${endpoint}`;
      console.log(`API 요청: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      console.log(`API 응답: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        return text as unknown as T;
      }
    } catch (error) {
      console.error(`API 요청 실패 ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * 냉장고 생성 - POST
   */
  static async create(
    fridgeData: FridgeCreateRequest,
  ): Promise<FridgeCreateResponse> {
    console.log('냉장고 생성 요청:', fridgeData);

    return await this.makeRequest<FridgeCreateResponse>(
      '/api/v1/refrigerator',
      {
        method: 'POST',
        body: JSON.stringify(fridgeData),
      },
    );
  }

  /**
   * 냉장고 수정 - PUT
   */
  static async update(
    fridgeId: string,
    updateData: FridgeUpdateRequest,
  ): Promise<FridgeUpdateResponse> {
    console.log('냉장고 수정 요청:', { fridgeId, updateData });

    return await this.makeRequest<FridgeUpdateResponse>(
      `/api/v1/refrigerator/${fridgeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      },
    );
  }

  /**
   * 냉장고 삭제 - DELETE
   */
  static async delete(fridgeId: string): Promise<FridgeDeleteResponse> {
    console.log('냉장고 삭제 요청:', fridgeId);

    return await this.makeRequest<FridgeDeleteResponse>(
      `/api/v1/refrigerator/${fridgeId}`,
      {
        method: 'DELETE',
      },
    );
  }

  /**
   * 냉장고 목록 조회 - GET
   */
  static async getList(): Promise<any> {
    console.log('냉장고 목록 요청');

    return await this.makeRequest<any>('/api/v1/refrigerator', {
      method: 'GET',
    });
  }

  /**
   * API 응답 검증
   */
  static isSuccessResponse(
    response: any,
    operation: 'create' | 'update' | 'delete',
  ): boolean {
    if (!response) return false;

    switch (operation) {
      case 'create':
      case 'update':
        // { id, name, groceryListId }
        return (
          response &&
          typeof response.id === 'number' &&
          typeof response.name === 'string'
        );

      case 'delete':
        // string 응답 || 빈 응답
        return (
          typeof response === 'string' ||
          response === '' ||
          response === undefined
        );

      default:
        return false;
    }
  }

  /**
   * 에러 디버깅용 정보 출력
   */
  static logApiError(
    operation: string,
    fridgeId: string | null,
    error: any,
  ): void {
    console.log(`=== ${operation} API 에러 디버깅 ===`);
    console.log('냉장고 ID:', fridgeId);
    console.log('에러 시각:', new Date().toISOString());
    console.log('에러 내용:', error);
    if (error.status) {
      console.log('HTTP 상태:', error.status);
    }
    console.log('========================');
  }
}
