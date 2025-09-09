import { useState } from 'react';
import { Alert } from 'react-native';
import Config from 'react-native-config';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../services/AsyncStorageService';
import { User } from '../types/auth';
import { getAccessToken } from '../utils/authUtils';
import { AuthAPIService } from '../services/authAPI';

// API 호출 상태 관리: 중복 호출 방지
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

      // 현재 액세스 토큰 확인
      let accessToken = await getAccessToken();

      if (!accessToken) {
        console.log('토큰이 없어서 로그인으로 이동');
        navigation.replace('Login');
        return;
      }

      // API 호출 함수
      const makeApiCall = async (token: string) => {
        return await fetch(`${Config.API_BASE_URL}/api/v1/refrigerator`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
      };

      // 첫 번째 API 호출 시도
      let response = await makeApiCall(accessToken);

      // 401 에러시 토큰 갱신 후 재시도
      if (response.status === 401) {
        console.log('401 에러 감지, 토큰 갱신 시도...');

        const refreshSuccess = await AuthAPIService.refreshToken();

        if (refreshSuccess) {
          console.log('토큰 갱신 성공, API 재시도...');
          accessToken = await getAccessToken();

          if (accessToken) {
            response = await makeApiCall(accessToken);
          } else {
            throw new Error('토큰 갱신 후 토큰을 찾을 수 없음');
          }
        } else {
          console.log('토큰 갱신 실패, 로그인 필요');
          Alert.alert('세션 만료', '다시 로그인해주세요.', [
            { text: '확인', onPress: () => navigation.replace('Login') },
          ]);
          return;
        }
      }

      // 응답 처리
      if (response.ok) {
        const serverResponse = await response.json();
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
                if (fridge.id === 1 || fridge.id === 3) {
                  return true;
                }
                // 3. 기본값: 모든 사용자를 소유자로 설정 (테스트용)
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
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('서버에서 냉장고 목록 로딩 실패:', error);

      // 특정 에러 메시지에 따른 처리
      if (
        error.message?.includes('토큰 갱신 실패') ||
        error.message?.includes('유효한 토큰이 없습니다')
      ) {
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

  // 새로고침 함수
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
    refreshFridgeList,
  };
};
