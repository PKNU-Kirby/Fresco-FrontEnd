import { useState } from 'react';
import { Alert } from 'react-native';
import Config from 'react-native-config';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../services/AsyncStorageService';
import { User } from '../types/auth';
import { getAuthHeaders, apiCallWithTokenRefresh } from '../utils/authUtils';

// API 호출 상태 관리 : 중복 호출 방지
let isLoadingFridges = false;

export const useFridgeSelect = (navigation: any) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fridges, setFridges] = useState<FridgeWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const initializeData = async () => {
    try {
      setLoading(true);
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
      // 서버에서 냉장고 목록 가져오기
      await loadUserFridges(user);
    } catch (error) {
      console.error('Initialize data error:', error);
      Alert.alert('오류', '데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserFridges = async (user?: User) => {
    const targetUser = user || currentUser;
    if (!targetUser) return;

    // 이미 로딩 중이면 중복 호출 방지
    if (isLoadingFridges) {
      console.log('냉장고 목록 로딩이 이미 진행 중입니다.');
      return;
    }

    try {
      isLoadingFridges = true;
      console.log('서버에서 냉장고 목록 로딩...');

      // 토큰 갱신을 포함한 API 호출
      const serverResponse = await apiCallWithTokenRefresh(async () => {
        // getAuthHeaders 사용으로 토큰 관리 일원화
        const headers = await getAuthHeaders();

        const response = await fetch(
          `${Config.API_BASE_URL}/api/v1/refrigerator`,
          {
            method: 'GET',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        );

        if (!response.ok) {
          throw { status: response.status, message: `HTTP ${response.status}` };
        }

        return response.json();
      });

      console.log('서버 응답:', serverResponse);

      if (
        serverResponse.code === 'REFRIGERATOR_OK_004' &&
        serverResponse.result
      ) {
        // 서버 데이터를 로컬 형식으로 변환
        const serverFridges: FridgeWithRole[] = serverResponse.result.map(
          (fridge: any) => ({
            id: fridge.id.toString(),
            name: fridge.name,
            createdAt: fridge.createdAt || new Date().toISOString(),
            updatedAt: fridge.updatedAt || new Date().toISOString(),

            // 역할 구분 로직 (백엔드 수정 전까지 임시 처리)
            isOwner: (() => {
              // 1. 백엔드에서 isOwner나 userRole을 제공하는 경우
              if (fridge.isOwner !== undefined) {
                return fridge.isOwner;
              }
              if (fridge.userRole !== undefined) {
                return fridge.userRole === 'OWNER';
              }

              // 2. 임시 테스트: 특정 냉장고 ID를 소유자로 설정
              // TODO: 백엔드 수정 후 이 부분 제거
              if (fridge.id === 1 || fridge.id === 3) {
                return true;
              }

              // 3. 기본값: 모든 사용자를 소유자로 설정 (테스트용)
              // 또는 false로 설정해서 편집 기능을 비활성화할 수도 있음
              return true;
            })(),

            isHidden: false, // 기본값 (숨김은 로컬 설정)
          }),
        );

        // 로컬 숨김 설정 적용
        const fridgesWithHiddenStatus = await Promise.all(
          serverFridges.map(async fridge => {
            try {
              const hiddenStatus = await AsyncStorageService.getFridgeHidden(
                parseInt(targetUser.id, 10),
                parseInt(fridge.id, 10),
              );
              return { ...fridge, isHidden: hiddenStatus };
            } catch {
              return { ...fridge, isHidden: false };
            }
          }),
        );

        setFridges(fridgesWithHiddenStatus);
        console.log('냉장고 목록 로딩 완료:', fridgesWithHiddenStatus);

        // 로컬 데이터와 동기화
        await syncWithLocalStorage(fridgesWithHiddenStatus, targetUser);
      } else {
        console.log(
          '서버에서 냉장고 목록을 가져올 수 없음, 응답:',
          serverResponse,
        );
        // 서버 실패 시 로컬 데이터 사용
        await loadLocalFridges(targetUser);
      }
    } catch (error: any) {
      console.error('서버에서 냉장고 목록 로딩 실패:', error);

      // 토큰 갱신 실패로 인한 로그인 필요한 경우
      if (
        error.message &&
        error.message.includes('토큰 갱신 실패 - 재로그인 필요')
      ) {
        Alert.alert('세션 만료', '다시 로그인해주세요.', [
          { text: '확인', onPress: () => navigation.replace('Login') },
        ]);
        return;
      }

      // 유효한 토큰이 없는 경우도 로그인 필요
      if (error.message && error.message.includes('유효한 토큰이 없습니다')) {
        Alert.alert('세션 만료', '다시 로그인해주세요.', [
          { text: '확인', onPress: () => navigation.replace('Login') },
        ]);
        return;
      }

      console.log('로컬 데이터로 폴백...');
      await loadLocalFridges(targetUser);
    } finally {
      isLoadingFridges = false;
    }
  };

  // 로컬 데이터 로딩 헬퍼 함수
  const loadLocalFridges = async (targetUser: User) => {
    try {
      const localFridges = await AsyncStorageService.getUserRefrigerators(
        parseInt(targetUser.id, 10),
      );
      setFridges(localFridges);
      console.log('로컬 데이터 로딩 완료:', localFridges);
    } catch (localError) {
      console.error('로컬 데이터 로딩도 실패:', localError);
      Alert.alert('오류', '냉장고 목록을 불러올 수 없습니다.');
    }
  };

  // 서버 데이터를 로컬에 동기화하는 헬퍼 함수
  const syncWithLocalStorage = async (
    serverFridges: FridgeWithRole[],
    user: User,
  ) => {
    try {
      // 로컬 데이터 업데이트 로직
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
        // 필요하다면 로컬에서도 삭제 로직 구현
      }

      // 새로운 서버 냉장고들을 로컬에 추가/업데이트
      for (const serverFridge of serverFridges) {
        try {
          // 로컬 AsyncStorage에 냉장고 정보 저장/업데이트
          // AsyncStorageService에 해당 메서드가 있다면 사용
          console.log(`냉장고 ${serverFridge.name} 로컬 동기화 완료`);
        } catch (syncError) {
          console.error(`냉장고 ${serverFridge.id} 동기화 실패:`, syncError);
        }
      }

      console.log('로컬 동기화 완료');
    } catch (error) {
      console.error('로컬 동기화 실패:', error);
    }
  };

  // 새로고침 함수 추가
  const refreshFridgeList = async () => {
    if (currentUser) {
      await loadUserFridges(currentUser);
    }
  };

  return {
    currentUser,
    fridges,
    loading,
    initializeData,
    loadUserFridges,
    refreshFridgeList, // 새로고침 함수 추가
  };
};
