import { useState } from 'react';
import { Alert } from 'react-native';
import { ApiService } from '../services/apiServices';
import { getTokenUserId } from '../utils/authUtils';
import { PermissionAPIService } from '../services/API/permissionAPI';
import { AsyncStorageService } from '../services/AsyncStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FridgeWithRole } from '../types/permission';
import { User } from '../types/auth';

export const useFridgeSelect = (navigation: any) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fridges, setFridges] = useState<FridgeWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const tokenUserId = await getTokenUserId();
      const localUserId = await AsyncStorageService.getCurrentUserId();

      console.log('토큰 사용자 ID:', tokenUserId);
      console.log('로컬 사용자 ID:', localUserId);

      if (!tokenUserId) {
        navigation.replace('Login');
        return;
      }

      let user: User | null = null;

      if (tokenUserId !== localUserId) {
        console.log('사용자 ID 불일치 - 토큰 기준으로 동기화');
        user = await AsyncStorageService.getUserById(tokenUserId);

        if (!user) {
          user = {
            id: tokenUserId,
            provider: '' as any,
            providerId: 'UNKNOWN',
            name: `User ${tokenUserId}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          console.log('토큰 사용자 정보를 기본값으로 생성:', user);
        }
      } else {
        user = await AsyncStorageService.getUserById(localUserId);
      }

      if (!user) {
        navigation.replace('Login');
        return;
      }

      console.log('최종 설정된 사용자:', user);
      setCurrentUser(user);
      await loadUserFridges(user);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFridges = async (user?: User) => {
    const targetUser = user || currentUser;
    if (!targetUser) return;

    try {
      // 1. 냉장고 목록만 먼저 가져오기
      const fridgeData = await ApiService.apiCall<any[]>(
        '/api/v1/refrigerator',
      );

      console.log(
        '🔍 [loadUserFridges] 서버에서 받은 냉장고 목록:',
        fridgeData,
      );

      // 2. 각 냉장고의 권한 정보 가져오기
      const fridgesWithPermissions = await Promise.all(
        fridgeData.map(async fridge => {
          try {
            // 각 냉장고별로 권한 조회
            const permissions = await PermissionAPIService.getFridgePermissions(
              Number(fridge.id),
            );

            console.log(
              `🔍 [loadUserFridges] 냉장고 ${fridge.id} 권한:`,
              permissions,
            );

            const result = {
              id: fridge.id,
              name: fridge.name,
              createdAt: fridge.createdAt || new Date().toISOString(),
              updatedAt: fridge.updatedAt || new Date().toISOString(),
              groceryListId: fridge.groceryListId,
              isOwner: fridge.userRole === 'owner',
              role:
                fridge.userRole === 'owner'
                  ? ('owner' as const)
                  : ('member' as const),
              memberCount: fridge.memberCount || 1,
              isHidden: false,
              canEdit: permissions.canEdit,
              canDelete: permissions.canDelete,
            } as FridgeWithRole;

            console.log(
              `🔍 [loadUserFridges] 냉장고 ${fridge.id} 최종 객체:`,
              result,
            );

            return result;
          } catch (permError) {
            console.error(`냉장고 ${fridge.id} 권한 조회 실패:`, permError);
            // 권한 조회 실패 시 기본값
            const isOwner = fridge.userRole === 'owner';
            return {
              id: fridge.id,
              name: fridge.name,
              createdAt: fridge.createdAt || new Date().toISOString(),
              updatedAt: fridge.updatedAt || new Date().toISOString(),
              groceryListId: fridge.groceryListId,
              isOwner,
              role: isOwner ? ('owner' as const) : ('member' as const),
              memberCount: fridge.memberCount || 1,
              isHidden: false,
              canEdit: isOwner,
              canDelete: isOwner,
            } as FridgeWithRole;
          }
        }),
      );

      console.log(
        '🔍 [loadUserFridges] 권한 병합 완료:',
        fridgesWithPermissions,
      );

      // 3. 숨김 설정 적용
      const fridgesWithHiddenStatus = await applyLocalHiddenSettings(
        fridgesWithPermissions,
        targetUser,
      );

      console.log(
        '🔍 [loadUserFridges] 숨김 설정 적용 완료:',
        fridgesWithHiddenStatus,
      );

      setFridges(fridgesWithHiddenStatus);
      syncWithLocalStorage(fridgesWithHiddenStatus, targetUser);
    } catch (error: any) {
      console.error('냉장고 목록 로딩 실패:', error);
      // ...
    }
  };

  // 로컬 숨김 설정 적용
  const applyLocalHiddenSettings = async (
    fridges: FridgeWithRole[],
    user: User,
  ): Promise<FridgeWithRole[]> => {
    return await Promise.all(
      fridges.map(async fridge => {
        try {
          const hiddenStatus = await AsyncStorageService.getFridgeHidden(
            parseInt(user.id, 10),
            parseInt(fridge.id.toString(), 10),
          );
          return { ...fridge, isHidden: hiddenStatus };
        } catch {
          return { ...fridge, isHidden: false };
        }
      }),
    );
  };

  // 로컬 데이터 로딩 (폴백용)
  const loadLocalFridges = async (targetUser: User) => {
    try {
      const localFridges = await AsyncStorageService.getUserRefrigerators(
        parseInt(targetUser.id, 10),
      );
      setFridges(localFridges);
      console.log('로컬 데이터 로딩 완료:', localFridges);

      setError('네트워크 연결을 확인해주세요. 로컬 데이터를 표시합니다.');
    } catch (localError) {
      console.error('로컬 데이터 로딩도 실패:', localError);
      setError('냉장고 목록을 불러올 수 없습니다.');
      Alert.alert('오류', '냉장고 목록을 불러올 수 없습니다.');
    }
  };

  const removeDeletedFridgesFromLocal = async (
    removedFridges: any[],
    targetUser: any,
  ) => {
    try {
      console.log('❌ 서버에서 삭제된 냉장고 정리:', removedFridges);

      // 🔥 서버에서 이미 삭제된 냉장고들이므로
      // 로컬에서만 제거 (서버 API 호출 불필요)

      for (const removedFridge of removedFridges) {
        try {
          // AsyncStorage에서만 제거
          const userKey = `user_${targetUser.id}_refrigerators`;
          const userFridges = await AsyncStorage.getItem(userKey);

          if (userFridges) {
            const fridgeList = JSON.parse(userFridges);
            const updatedFridges = fridgeList.filter(
              (fridge: any) => fridge.id !== removedFridge.id,
            );
            await AsyncStorage.setItem(userKey, JSON.stringify(updatedFridges));
          }

          console.log(`냉장고 ${removedFridge.id} 로컬 제거 완료`);
        } catch (error) {
          console.error(`냉장고 ${removedFridge.id} 로컬 제거 실패:`, error);
        }
      }
    } catch (error) {
      console.error('로컬 냉장고 제거 전체 실패:', error);
    }
  };

  const syncWithLocalStorage = async (
    serverFridges: FridgeWithRole[],
    user: User,
  ) => {
    try {
      console.log('서버 데이터와 로컬 동기화 시작...');

      const localFridges = await AsyncStorageService.getUserRefrigerators(
        parseInt(user.id, 10),
      );

      const serverFridgeIds = serverFridges.map(f => f.id);
      const removedFridges = localFridges.filter(
        localFridge => !serverFridgeIds.includes(localFridge.id),
      );

      if (removedFridges.length > 0) {
        console.log('서버에서 삭제된 냉장고들:', removedFridges);
        await removeDeletedFridgesFromLocal(removedFridges, user);
      }

      console.log('로컬 동기화 완료');
    } catch (error) {
      console.error('로컬 동기화 실패:', error);
    }
  };

  const refreshFridgeList = async () => {
    if (currentUser) {
      setError(null);
      await loadUserFridges(currentUser);
    }
  };

  const retryLoad = async () => {
    if (currentUser) {
      setError(null);
      setLoading(true);
      await loadUserFridges(currentUser);
      setLoading(false);
    }
  };

  return {
    currentUser,
    fridges,
    loading,
    error,
    initializeData,
    loadUserFridges,
    refreshFridgeList,
    retryLoad,
  };
};
