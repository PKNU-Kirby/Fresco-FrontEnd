// permissionAPI.ts
import { ApiService } from '../apiServices';
import { FridgePermission } from '../../types/permission';

export class PermissionAPIService {
  /**
   * 특정 냉장고의 권한 조회
   */
  static async getFridgePermissions(fridgeId: number): Promise<{
    canEdit: boolean;
    canDelete: boolean;
  }> {
    try {
      // 전체 권한 목록 조회
      const response = await ApiService.apiCall<Record<string, boolean>>(
        `/api/v1/refrigerator/permissions`,
      );

      console.log(`🔍 냉장고 ${fridgeId} 권한 응답:`, response);

      // 해당 냉장고의 권한 추출 (숫자/문자열 둘 다 대응)
      const hasPermission =
        response?.[fridgeId] ?? response?.[String(fridgeId)] ?? false;

      console.log(`🔍 냉장고 ${fridgeId} 권한 값:`, hasPermission);

      return {
        canEdit: hasPermission,
        canDelete: hasPermission, // 서버에서 단일 boolean으로 보내는 것 같아요
      };
    } catch (error) {
      console.error(`냉장고 ${fridgeId} 권한 조회 실패:`, error);
      return {
        canEdit: false,
        canDelete: false,
      };
    }
  }

  /**
   * 사용자 권한 조회 (전체 냉장고)
   * @deprecated 더 이상 사용하지 않음. getFridgePermissions 사용
   */
  static async getUserPermissions(): Promise<FridgePermission[]> {
    console.warn(
      'getUserPermissions는 deprecated됨. getFridgePermissions 사용 권장',
    );
    return [];
  }

  /**
   * 특정 냉장고 권한 확인
   */
  static async checkFridgePermission(
    fridgeId: number,
    requiredAction: 'edit' | 'delete' | 'view',
  ): Promise<boolean> {
    try {
      if (requiredAction === 'view') {
        return true; // 목록에 있으면 볼 수 있음
      }

      const permissions = await this.getFridgePermissions(fridgeId);
      return requiredAction === 'edit'
        ? permissions.canEdit
        : permissions.canDelete;
    } catch (error) {
      console.error('냉장고 권한 확인 실패:', error);
      return false;
    }
  }
}
