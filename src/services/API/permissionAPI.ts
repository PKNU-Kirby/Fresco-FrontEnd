import { ApiService } from '../apiServices';
import { FridgePermission } from '../../types/permission';
import { PermissionUtils } from '../../utils/permissionUtils';

export class PermissionAPIService {
  /**
   * 사용자 권한 조회 (토큰 갱신 자동 처리)
   */
  // services/PermissionAPI.ts
  static async getUserPermissions(): Promise<FridgePermission[]> {
    try {
      const data = await ApiService.apiCall<any>(
        '/api/v1/refrigerator/permissions',
      );

      // ✅ 응답 형식 확인
      console.log('권한 API 응답:', data);

      // result가 객체 형식 {"37": true, "42": true}
      if (data && typeof data === 'object') {
        return Object.entries(data).map(([fridgeId, canEdit]) => ({
          fridgeId,
          canEdit: Boolean(canEdit),
          canDelete: Boolean(canEdit), // 편집 가능하면 삭제도 가능
        }));
      }

      return [];
    } catch (error) {
      console.error('권한 조회 실패:', error);
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
      const response = await ApiService.apiCall<{ result: any[] }>(
        '/api/v1/refrigerator/member-counts',
        {
          method: 'POST',
          body: JSON.stringify({ fridgeIds }),
        },
      );

      return response.result || [];
    } catch (error) {
      console.error('멤버 수 조회 실패:', error);
      // 실패 시 기본값 반환
      return fridgeIds.map(fridgeId => ({ fridgeId, memberCount: 1 }));
    }
  }
}
