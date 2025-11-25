// permissionAPI.ts
import { ApiService } from '../apiServices';
import { FridgePermission } from '../../types/permission';

export class PermissionAPIService {
  /**
   * 특정 냉장고의 권한 조회
   */
  // permissionAPI.ts
  static async getFridgePermissions(fridgeId: number): Promise<{
    canEdit: boolean;
    canDelete: boolean;
  }> {
    try {
      const response = await ApiService.apiCall<Record<string, boolean>>(
        `/api/v1/refrigerator/permissions`,
      );

      // console.log('=== 권한 디버깅 시작 ===');
      // console.log(`🔍 요청한 fridgeId:`, fridgeId, typeof fridgeId);
      // console.log(`🔍 전체 응답:`, JSON.stringify(response));
      // console.log(`🔍 응답의 키들:`, Object.keys(response || {}));

      // 여러 방법으로 시도
      const method1 = response?.[fridgeId];
      const method2 = response?.[String(fridgeId)];
      const method3 = response?.[Number(fridgeId)];

      // console.log(`🔍 method1 [${fridgeId}]:`, method1);
      // console.log(`🔍 method2 ["${fridgeId}"]:`, method2);
      // console.log(`🔍 method3 [Number]:`, method3);

      const hasPermission = method1 ?? method2 ?? method3 ?? false;

      // console.log(`🔍 최종 hasPermission:`, hasPermission);
      // console.log('=== 권한 디버깅 끝 ===');

      return {
        canEdit: hasPermission,
        canDelete: hasPermission,
      };
    } catch (error) {
      // console.error(`냉장고 ${fridgeId} 권한 조회 실패:`, error);
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
    /*
    console.warn(
      'getUserPermissions는 deprecated됨. getFridgePermissions 사용 권장',
    );
    */
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
      // console.error('냉장고 권한 확인 실패:', error);
      return false;
    }
  }
}
