import { useState, useEffect, useCallback } from 'react';
import {
  FridgePermission,
  PermissionUtils,
  FridgeRole,
} from '../types/permission';
import { PermissionAPIService } from '../services/permissionAPI';
import { ApiErrorHandler } from '../utils/errorHandler';
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
      const userPermissions = await PermissionAPIService.getUserPermissions();
      setPermissions(userPermissions);
      console.log('사용자 권한 로드 완료:', userPermissions);
    } catch (error: any) {
      console.error('권한 로드 실패:', error);
      const errorMessage = ApiErrorHandler.getErrorMessage(error);
      setPermissionError(errorMessage);
      setPermissions([]);
    } finally {
      setPermissionLoading(false);
    }
  }, [currentUser]);

  const hasPermission = useCallback(
    (fridgeId: string, action: 'edit' | 'delete' | 'view') => {
      return PermissionUtils.hasPermission(permissions, fridgeId, action);
    },
    [permissions],
  );

  const getPermission = useCallback(
    (fridgeId: string) => {
      return permissions.find(p => p.fridgeId === fridgeId);
    },
    [permissions],
  );

  const getFridgeRole = useCallback(
    (fridgeId: string): FridgeRole | null => {
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
