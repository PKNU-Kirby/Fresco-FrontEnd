import Config from 'react-native-config';
import { FridgePermission, PermissionResponse } from '../../types/permission';
import { getValidAccessToken } from '../../utils/authUtils';
import { ApiErrorHandler } from '../../utils/errorHandler';
import { PermissionUtils } from '../../utils/permissionUtils';

export class PermissionAPIService {
  /**
   * 사용자 권한 조회
   */
  static async getUserPermissions(): Promise<FridgePermission[]> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      // console.log('권한 API 호출 시작...');

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/refrigerator/permissions`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      // console.log('권한 API 응답 상태:', response.status);

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      const data: PermissionResponse = await response.json();
      // console.log('권한 API 원본 응답:', JSON.stringify(data, null, 2));

      // 성공 코드 확인 (실제 API 스펙에 맞게 수정 필요)
      if (!data.code || !data.code.includes('OK')) {
        throw {
          status: 200,
          code: 'API_ERROR',
          message: data.message || 'API 응답 오류',
        };
      }

      return PermissionUtils.parsePermissionResponse(data);
    } catch (error) {
      console.error('권한 조회 실패:', error);
      ApiErrorHandler.logError(error, 'PermissionAPI.getUserPermissions');

      // 권한 조회 실패 시 빈 배열 반환 (앱이 계속 동작하도록)
      console.warn('권한 조회 실패로 빈 권한 목록 반환');
      return [];
    }
  }

  /**
   * 특정 냉장고 권한 확인
   */
  static async checkFridgePermission(
    fridgeId: string,
    requiredAction: 'edit' | 'delete' | 'view',
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions();
      return PermissionUtils.hasPermission(
        permissions,
        fridgeId,
        requiredAction,
      );
    } catch (error) {
      console.error('냉장고 권한 확인 실패:', error);
      ApiErrorHandler.logError(error, 'PermissionAPI.checkFridgePermission');
      return false;
    }
  }

  /**
   * 냉장고별 멤버 수 조회
   */
  static async getFridgeMemberCounts(
    fridgeIds: string[],
  ): Promise<Array<{ fridgeId: string; memberCount: number }>> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      // 냉장고 멤버 수 조회 API (실제 엔드포인트에 맞게 수정)
      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/refrigerator/member-counts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ fridgeIds }),
        },
      );

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
        };
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('멤버 수 조회 실패:', error);
      ApiErrorHandler.logError(error, 'PermissionAPI.getFridgeMemberCounts');

      // 실패 시 기본값 반환
      return fridgeIds.map(fridgeId => ({ fridgeId, memberCount: 1 }));
    }
  }
}
