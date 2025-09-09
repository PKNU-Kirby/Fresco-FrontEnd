import {
  FridgeRole,
  FridgePermission,
  PermissionResponse,
  FridgeWithRole,
} from '../types/permission';

export class PermissionUtils {
  /**
   * 역할에 따른 권한 계산
   */
  static getRolePermissions(role: FridgeRole): {
    canEdit: boolean;
    canDelete: boolean;
  } {
    switch (role) {
      case 'OWNER':
        return { canEdit: true, canDelete: true };
      case 'PARTICIPANT':
        return { canEdit: true, canDelete: false };
      default:
        return { canEdit: false, canDelete: false };
    }
  }

  /**
   * FridgeRole을 AsyncStorageService의 role 타입으로 변환
   */
  static convertToStorageRole(role: FridgeRole): 'owner' | 'member' {
    return role === 'OWNER' ? 'owner' : 'member';
  }

  /**
   * AsyncStorageService의 role을 FridgeRole로 변환
   */
  static convertFromStorageRole(role: 'owner' | 'member'): FridgeRole {
    return role === 'owner' ? 'OWNER' : 'PARTICIPANT';
  }

  /**
   * 냉장고 권한 확인
   */
  static hasPermission(
    userPermissions: FridgePermission[],
    fridgeId: string,
    requiredAction: 'edit' | 'delete' | 'view',
  ): boolean {
    const permission = userPermissions.find(p => p.fridgeId === fridgeId);
    if (!permission) return false;

    switch (requiredAction) {
      case 'view':
        return true; // 권한이 있으면 무조건 볼 수 있음
      case 'edit':
        return permission.canEdit;
      case 'delete':
        return permission.canDelete;
      default:
        return false;
    }
  }

  /**
   * 권한 API 응답을 FridgePermission 배열로 변환
   */
  static parsePermissionResponse(
    response: PermissionResponse,
  ): FridgePermission[] {
    if (!response.result) return [];

    return response.result.map(item => {
      const rolePermissions = this.getRolePermissions(item.role);
      return {
        fridgeId: item.fridgeId,
        role: item.role,
        ...rolePermissions,
      };
    });
  }

  /**
   * 냉장고와 권한 정보 병합 (타입 에러 수정됨)
   */
  static mergeFridgeWithPermissions(
    fridges: any[],
    permissions: FridgePermission[],
  ): FridgeWithRole[] {
    const validFridges: FridgeWithRole[] = [];

    for (const fridge of fridges) {
      const permission = permissions.find(
        p => p.fridgeId === fridge.id.toString(),
      );

      if (!permission) {
        // 권한이 없는 냉장고는 제외
        continue;
      }

      const rolePermissions = this.getRolePermissions(permission.role);

      const fridgeWithRole: FridgeWithRole = {
        id: fridge.id.toString(),
        name: fridge.name,
        createdAt: fridge.createdAt || new Date().toISOString(),
        updatedAt: fridge.updatedAt || new Date().toISOString(),
        isOwner: permission.role === 'OWNER',
        role: this.convertToStorageRole(permission.role),
        memberCount: fridge.memberCount || 1, // 서버에서 제공하거나 기본값 1
        isHidden: false, // 로컬 설정에서 나중에 적용
        canEdit: rolePermissions.canEdit,
        canDelete: rolePermissions.canDelete,
      };

      validFridges.push(fridgeWithRole);
    }

    return validFridges;
  }

  /**
   * 로컬 FridgeWithRole을 서버 권한과 동기화
   */
  static syncLocalFridgeWithPermissions(
    localFridge: FridgeWithRole,
    permissions: FridgePermission[],
  ): FridgeWithRole {
    const permission = permissions.find(p => p.fridgeId === localFridge.id);

    if (!permission) {
      // 권한이 없으면 읽기 전용으로 설정
      return {
        ...localFridge,
        isOwner: false,
        role: 'member',
        canEdit: false,
        canDelete: false,
      };
    }

    const rolePermissions = this.getRolePermissions(permission.role);

    return {
      ...localFridge,
      isOwner: permission.role === 'OWNER',
      role: this.convertToStorageRole(permission.role),
      canEdit: rolePermissions.canEdit,
      canDelete: rolePermissions.canDelete,
    };
  }

  /**
   * 멤버 수 업데이트 (서버에서 받은 데이터로)
   */
  static updateMemberCount(
    fridges: FridgeWithRole[],
    memberCountData: Array<{ fridgeId: string; memberCount: number }>,
  ): FridgeWithRole[] {
    return fridges.map(fridge => {
      const memberData = memberCountData.find(m => m.fridgeId === fridge.id);
      return {
        ...fridge,
        memberCount: memberData?.memberCount || fridge.memberCount,
      };
    });
  }
}
