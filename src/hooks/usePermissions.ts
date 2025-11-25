import { useState, useEffect, useCallback } from 'react';
import { ApiErrorHandler } from '../utils/errorHandler';
import { PermissionUtils } from '../utils/permissionUtils';
import { FridgePermission, FridgeRole } from '../types/permission';
import { User } from '../types/auth';

export const usePermissions = (currentUser: User | null) => {
  const [permissions, setPermissions] = useState<FridgePermission[]>([]);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    if (!currentUser) {
      setPermissions([]);
      return;
    }

    setPermissionLoading(true);
    setPermissionError(null);

    try {
      setPermissions([]);
    } catch (error: any) {
      // console.error('권한 로드 실패:', error);
      const errorMessage = ApiErrorHandler.getErrorMessage(error);
      setPermissionError(errorMessage);
      setPermissions([]);
    } finally {
      setPermissionLoading(false);
    }
  }, [currentUser]);

  const hasPermission = useCallback(
    (fridgeId: number, action: 'edit' | 'delete' | 'view') => {
      return PermissionUtils.hasPermission(
        permissions,
        fridgeId.toString(),
        action,
      );
    },
    [permissions],
  );

  const getPermission = useCallback(
    (fridgeId: number) => {
      const permission = permissions.find(p => p.fridgeId === fridgeId);

      if (permission) {
        /*
        console.log(`>> 권한 조회 - 냉장고 ${fridgeId}:`, {
          role: permission.role,
          canDelete: permission.canDelete,
          canEdit: permission.canEdit,
          fridgeId: permission.fridgeId,
        });
        */
      } else {
        // console.log(`>> 권한 없음 - 냉장고 ${fridgeId}`);
      }

      return permission;
    },
    [permissions],
  );

  const getFridgeRole = useCallback(
    (fridgeId: number): FridgeRole | null => {
      const permission = getPermission(fridgeId);
      return permission?.role || null;
    },
    [getPermission],
  );

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    permissionLoading,
    permissionError,
    loadPermissions,
    hasPermission,
    getPermission,
    getFridgeRole,
  };
};
