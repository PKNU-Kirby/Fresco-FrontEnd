import { useState } from 'react';
import { Alert } from 'react-native';
import Config from 'react-native-config';
import { AsyncStorageService } from '../services/AsyncStorageService';
import { FridgeWithRole } from '../types/permission';
import { User } from '../types/auth';
import { getValidAccessToken } from '../utils/authUtils';
import { PermissionAPIService } from '../services/API/permissionAPI';
import { PermissionUtils } from '../utils/permissionUtils';
import { ApiErrorHandler } from '../utils/errorHandler';
import { ApiUtils } from '../utils/apiUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTokenUserId } from '../utils/authUtils';
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

      // 토큰에서 사용자 ID 추출
      const tokenUserId = await getTokenUserId();
      const localUserId = await AsyncStorageService.getCurrentUserId();

      console.log('토큰 사용자 ID:', tokenUserId);
      console.log('로컬 사용자 ID:', localUserId);

      if (!tokenUserId) {
        navigation.replace('Login');
        return;
      }

      let user: User | null = null;

      // 토큰 사용자와 로컬 사용자가 다르면 토큰 기준으로 변경
      if (tokenUserId !== localUserId) {
        console.log('사용자 ID 불일치 - 토큰 기준으로 동기화');

        // 토큰 사용자 정보로 사용자 조회 시도
        user = await AsyncStorageService.getUserById(tokenUserId);

        if (!user) {
          // 토큰 사용자 정보가 로컬에 없으면 기본 정보로 생성
          user = {
            id: tokenUserId,
            provider: 'UNKNOWN',
            providerId: 'UNKNOWN',
            name: `User ${tokenUserId}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          console.log('토큰 사용자 정보를 기본값으로 생성:', user);
        }
      } else {
        // 일치하면 기존대로 로컬 사용자 사용
        user = await AsyncStorageService.getUserById(localUserId);
      }

      if (!user) {
        navigation.replace('Login');
        return;
      }

      console.log('최종 설정된 사용자:', user);
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
      // console.log('냉장고 목록 로딩이 이미 진행 중입니다.');
      return;
    }

    try {
      isLoadingFridges = true;
      //      console.log('서버에서 냉장고 목록 및 권한 로딩...');

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
        // console.log('냉장고 목록 로딩 완료:', fridgesWithHiddenStatus);

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

  // 로컬 동기화에서 deleteRefrigerator 대신 사용할 함수
  const removeDeletedFridgesFromLocal = async (
    removedFridges: any[],
    targetUser: any,
  ) => {
    try {
      console.log('로컬에서 삭제된 냉장고들 제거 중:', removedFridges);

      for (const removedFridge of removedFridges) {
        try {
          // AsyncStorageService.deleteRefrigerator가 없으므로 다른 방법 사용
          // 사용자의 냉장고 목록에서만 제거
          if (AsyncStorageService.removeUserFromRefrigerator) {
            await AsyncStorageService.removeUserFromRefrigerator(
              parseInt(removedFridge.id, 10),
              parseInt(targetUser.id, 10),
            );
          } else {
            // 그것도 없다면 직접 AsyncStorage 조작
            const userKey = `user_${targetUser.id}_refrigerators`;
            const userFridges = await AsyncStorage.getItem(userKey);

            if (userFridges) {
              const fridgeList = JSON.parse(userFridges);
              const updatedFridges = fridgeList.filter(
                (fridge: any) => fridge.id !== removedFridge.id,
              );
              await AsyncStorage.setItem(
                userKey,
                JSON.stringify(updatedFridges),
              );
            }
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

  // useFridgeSelect.ts의 syncWithLocalStorage 함수 수정
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

        // AsyncStorageService.deleteRefrigerator 대신 안전한 방법 사용
        await removeDeletedFridgesFromLocal(removedFridges, user);
      }

      // 새로운/업데이트된 서버 냉장고들을 로컬에 동기화
      for (const serverFridge of serverFridges) {
        try {
          const localFridge = localFridges.find(
            lf => lf.id === serverFridge.id,
          );
          if (!localFridge || localFridge.name !== serverFridge.name) {
            console.log(`냉장고 ${serverFridge.name} 로컬 동기화 중...`);
            // 필요하면 여기서 로컬 업데이트 로직 구현
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
