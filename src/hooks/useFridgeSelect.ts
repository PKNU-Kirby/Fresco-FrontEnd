// hooks/useFridgeSelect.ts - 권한 기반으로 개선된 버전
import { useState } from 'react';
import { Alert } from 'react-native';
import Config from 'react-native-config';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../services/AsyncStorageService';
import { User } from '../types/auth';
import { getValidAccessToken } from '../utils/authUtils';
import { PermissionAPIService } from '../services/permissionAPI';
import { PermissionUtils } from '../utils/permissionUtils';
import { ApiErrorHandler } from '../utils/errorHandler';

// API 호출 상태 관리
let isLoadingFridges = false;

export const useFridgeSelect = (navigation: any) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fridges, setFridges] = useState<FridgeWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await AsyncStorageService.getCurrentUserId();
      if (!userId) {
        navigation.replace('Login');
        return;
      }

      const user = await AsyncStorageService.getUserById(userId);
      if (!user) {
        navigation.replace('Login');
        return;
      }

      setCurrentUser(user);
      await loadUserFridges(user);
    } catch (error: any) {
      console.error('Initialize data error:', error);
      const errorMessage = ApiErrorHandler.getErrorMessage(error);
      setError(errorMessage);
      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFridges = async (user?: User) => {
    const targetUser = user || currentUser;
    if (!targetUser) return;

    // 중복 호출 방지
    if (isLoadingFridges) {
      console.log('냉장고 목록 로딩이 이미 진행 중입니다.');
      return;
    }

    try {
      isLoadingFridges = true;
      console.log('서버에서 냉장고 목록 및 권한 로딩...');

      // 병렬로 냉장고 목록과 권한 정보 가져오기
      const [fridgeData, permissions] = await Promise.all([
        loadFridgeListFromServer(),
        PermissionAPIService.getUserPermissions(),
      ]);

      if (fridgeData && permissions) {
        // 권한이 있는 냉장고만 필터링하고 병합
        const fridgesWithPermissions =
          PermissionUtils.mergeFridgeWithPermissions(fridgeData, permissions);

        // 로컬 숨김 설정 적용
        const fridgesWithHiddenStatus = await applyLocalHiddenSettings(
          fridgesWithPermissions,
          targetUser,
        );

        setFridges(fridgesWithHiddenStatus);
        console.log('냉장고 목록 로딩 완료:', fridgesWithHiddenStatus);

        // 로컬 데이터와 동기화 (백그라운드)
        syncWithLocalStorage(fridgesWithHiddenStatus, targetUser);
      } else {
        throw new Error('서버에서 데이터를 가져올 수 없습니다');
      }
    } catch (error: any) {
      console.error('서버에서 냉장고 목록 로딩 실패:', error);

      // 인증 관련 에러는 로그인으로 이동
      if (ApiErrorHandler.getErrorAction(error) === 'login') {
        Alert.alert('세션 만료', '다시 로그인해주세요.', [
          { text: '확인', onPress: () => navigation.replace('Login') },
        ]);
        return;
      }

      // 기타 에러는 로컬 데이터로 폴백
      console.log('로컬 데이터로 폴백...');
      await loadLocalFridges(targetUser);
    } finally {
      isLoadingFridges = false;
    }
  };

  // 서버에서 냉장고 목록 가져오기
  const loadFridgeListFromServer = async (): Promise<any[] | null> => {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const response = await ApiUtils.callWithRetry(async () => {
        const res = await fetch(`${Config.API_BASE_URL}/api/v1/refrigerator`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          throw { status: res.status, message: res.statusText };
        }

        return await res.json();
      });

      // 응답 검증
      if (ApiUtils.validateApiResponse(response, ['REFRIGERATOR_OK_004'])) {
        return response.result || [];
      } else {
        console.log('서버 응답 형식이 예상과 다름:', response);
        return null;
      }
    } catch (error) {
      console.error('냉장고 목록 API 호출 실패:', error);
      throw error;
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
            parseInt(fridge.id, 10),
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

      // 로컬 데이터 사용 시 경고
      setError('네트워크 연결을 확인해주세요. 로컬 데이터를 표시합니다.');
    } catch (localError) {
      console.error('로컬 데이터 로딩도 실패:', localError);
      setError('냉장고 목록을 불러올 수 없습니다.');
      Alert.alert('오류', '냉장고 목록을 불러올 수 없습니다.');
    }
  };

  // 서버 데이터를 로컬에 동기화 (백그라운드 작업)
  const syncWithLocalStorage = async (
    serverFridges: FridgeWithRole[],
    user: User,
  ) => {
    try {
      console.log('서버 데이터와 로컬 동기화 시작...');

      // 기존 로컬 냉장고 목록 가져오기
      const localFridges = await AsyncStorageService.getUserRefrigerators(
        parseInt(user.id, 10),
      );

      // 서버에 없는 로컬 냉장고 확인 (삭제된 냉장고)
      const serverFridgeIds = serverFridges.map(f => f.id);
      const removedFridges = localFridges.filter(
        localFridge => !serverFridgeIds.includes(localFridge.id),
      );

      if (removedFridges.length > 0) {
        console.log('서버에서 삭제된 냉장고들:', removedFridges);
        // 로컬에서도 삭제
        for (const removedFridge of removedFridges) {
          await AsyncStorageService.deleteRefrigerator(
            parseInt(removedFridge.id, 10),
          );
        }
      }

      // 새로운/업데이트된 서버 냉장고들을 로컬에 동기화
      for (const serverFridge of serverFridges) {
        try {
          const localFridge = localFridges.find(
            lf => lf.id === serverFridge.id,
          );
          if (!localFridge || localFridge.name !== serverFridge.name) {
            // 새로운 냉장고이거나 이름이 변경된 경우 업데이트
            console.log(`냉장고 ${serverFridge.name} 로컬 동기화 중...`);
            // AsyncStorageService에 업데이트 로직 추가 필요
          }
        } catch (syncError) {
          console.error(`냉장고 ${serverFridge.id} 동기화 실패:`, syncError);
        }
      }

      console.log('로컬 동기화 완료');
    } catch (error) {
      console.error('로컬 동기화 실패:', error);
      // 동기화 실패는 조용히 처리 (메인 기능에 영향 안줌)
    }
  };

  // 새로고침 함수
  const refreshFridgeList = async () => {
    if (currentUser) {
      setError(null);
      await loadUserFridges(currentUser);
    }
  };

  // 에러 재시도 함수
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
