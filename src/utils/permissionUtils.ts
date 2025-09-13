import {
  FridgeRole,
  FridgePermission,
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
  static parsePermissionResponse(response: any): FridgePermission[] {
    console.log('권한 응답 파싱 시작:', response);

    let permissionData: { [key: string]: boolean } = {};

    // 실제 응답 구조에 맞게 처리
    if (
      response.result &&
      typeof response.result === 'object' &&
      !Array.isArray(response.result)
    ) {
      permissionData = response.result;
    } else if (
      typeof response === 'object' &&
      !Array.isArray(response) &&
      response.code
    ) {
      // 혹시 result가 최상위에 있는 경우
      const keys = Object.keys(response).filter(
        key => !['code', 'message', 'timestamp'].includes(key),
      );
      if (keys.length > 0) {
        permissionData = {};
        keys.forEach(key => {
          if (typeof response[key] === 'boolean') {
            permissionData[key] = response[key];
          }
        });
      }
    } else {
      console.warn('예상치 못한 권한 응답 구조:', response);
      return [];
    }

    // console.log('파싱할 권한 데이터:', permissionData);

    // 객체를 배열로 변환
    const permissions: FridgePermission[] = [];

    for (const [fridgeId, hasPermission] of Object.entries(permissionData)) {
      if (typeof hasPermission === 'boolean' && hasPermission) {
        // true인 경우에만 권한이 있다고 판단
        // 현재 API는 편집 권한만 제공하므로 OWNER로 가정 (실제로는 서버에서 role 정보도 제공해야 함)
        const role: FridgeRole = 'OWNER'; // 임시로 모든 권한을 OWNER로 설정
        const rolePermissions = this.getRolePermissions(role);

        permissions.push({
          fridgeId: fridgeId,
          role,
          ...rolePermissions,
        });

        console.log(`냉장고 ${fridgeId} 권한: ${role}`, rolePermissions);
      }
    }

    // console.log('최종 파싱된 권한 목록:', permissions);
    return permissions;
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
      console.log(`\n냉장고 ${fridge.name} (ID: ${fridge.id}) 처리 중...`);

      const permission = permissions.find(p => {
        // console.log(`권한 비교: ${p.fridgeId} === ${fridge.id.toString()}`);
        return p.fridgeId === fridge.id.toString();
      });

      if (!permission) {
        console.log(`냉장고 ${fridge.id}에 대한 권한을 찾을 수 없음`);
        continue;
      }

      // console.log(`냉장고 ${fridge.id} 권한 찾음:`, permission);

      const rolePermissions = this.getRolePermissions(permission.role);
      // console.log(`역할 권한:`, rolePermissions);

      const fridgeWithRole: FridgeWithRole = {
        id: fridge.id.toString(),
        name: fridge.name,
        createdAt: fridge.createdAt || new Date().toISOString(),
        updatedAt: fridge.updatedAt || new Date().toISOString(),
        isOwner: permission.role === 'OWNER',
        role: this.convertToStorageRole(permission.role),
        memberCount: fridge.memberCount || 1,
        isHidden: false,
        canEdit: rolePermissions.canEdit,
        canDelete: rolePermissions.canDelete,
      };

      console.log(`최종 냉장고 객체:`, fridgeWithRole);
      validFridges.push(fridgeWithRole);
    }

    console.log('User Fridge Info :', validFridges);
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
