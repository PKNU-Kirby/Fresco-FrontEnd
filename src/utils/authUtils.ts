// AsyncStorage 유저 관리자
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SocialProvider, UserId } from '../types';

// ERD 기반 사용자 정보 타입
export interface StoredUserInfo {
  userId: string;
  provider: SocialProvider;
  providerId: string;
  name: string;
  email?: string;
  profileImage?: string;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API 설정
const API_BASE_URL = '${Config.API_BASE_URL}';

// ============================================================================
// 토큰 관리
// ============================================================================
export const saveTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  const tokenArray: [string, string][] = [
    ['accessToken', accessToken],
    ['refreshToken', refreshToken],
  ];
  await AsyncStorage.multiSet(tokenArray);
};

export const getAccessToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('accessToken');
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('refreshToken');
};

// ============================================================================
// 토큰 자동 갱신 (동시성 제어 개선)
// ============================================================================

// 토큰 갱신 중인지 추적하는 변수
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * 토큰 갱신 함수 (동시성 제어 포함)
 * @returns {Promise<boolean>} 갱신 성공 여부
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  // 이미 갱신 중이라면 기존 프로미스를 반환
  if (isRefreshing && refreshPromise) {
    console.log('토큰 갱신이 이미 진행 중입니다. 기존 프로미스를 반환합니다.');
    return await refreshPromise;
  }

  // 갱신 시작 플래그 설정
  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      console.log('토큰 갱신 시작...');

      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        console.log('Refresh Token이 없습니다.');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (
          data.result &&
          data.result.accessToken &&
          data.result.refreshToken
        ) {
          // 새 토큰들 저장
          await saveTokens(data.result.accessToken, data.result.refreshToken);
          console.log('토큰 갱신 성공');
          return true;
        } else {
          console.log('토큰 갱신 응답 형식이 올바르지 않음:', data);
          return false;
        }
      } else {
        console.log('토큰 갱신 API 실패:', response.status);
        return false;
      }
    } catch (error) {
      console.error('토큰 갱신 중 오류:', error);
      return false;
    } finally {
      // 갱신 완료 후 플래그 리셋
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return await refreshPromise;
};

/**
 * 토큰이 만료되었는지 확인하는 함수
 * @returns {Promise<boolean>} 토큰 만료 여부
 */
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return true;

    // JWT 토큰 파싱
    const tokenParts = accessToken.split('.');
    if (tokenParts.length !== 3) return true;

    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // 만료 시간보다 30초 일찍 갱신 (버퍼 시간)
    return payload.exp <= currentTime + 30;
  } catch (error) {
    console.error('토큰 만료 확인 중 오류:', error);
    return true;
  }
};

/**
 * 유효한 Access Token을 가져오는 함수 (동시성 제어 개선)
 * @returns {Promise<string | null>} 유효한 Access Token 또는 null
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    // 1. 현재 토큰 확인
    let accessToken = await getAccessToken();
    if (!accessToken) return null;

    // 2. 토큰 만료 확인
    const expired = await isTokenExpired();

    // 3. 만료된 경우 갱신 시도 (동시성 제어됨)
    if (expired) {
      console.log('토큰이 만료되어 갱신 시도...');
      const refreshSuccess = await refreshAccessToken();

      if (refreshSuccess) {
        accessToken = await getAccessToken();
        console.log('토큰 갱신 완료');
      } else {
        console.log('토큰 갱신 실패');
        return null;
      }
    }

    return accessToken;
  } catch (error) {
    console.error('유효한 토큰 가져오기 실패:', error);
    return null;
  }
};

/**
 * API 호출을 위한 인증 헤더를 가져오는 함수 (개선)
 * @returns {Promise<{Authorization: string} | {}>} 인증 헤더 또는 빈 객체
 */
export const getAuthHeaders = async (): Promise<
  { Authorization: string } | {}
> => {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw new Error('유효한 토큰이 없습니다');
  }
  return { Authorization: `Bearer ${accessToken}` };
};

/**
 * 토큰 갱신을 포함한 API 호출 래퍼 함수 (개선)
 * @param {Function} apiFunction - 실행할 API 함수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @returns {Promise<any>} API 응답
 */
export const apiCallWithTokenRefresh = async (
  apiFunction: () => Promise<any>,
  maxRetries: number = 1,
): Promise<any> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiFunction();
      return response;
    } catch (error: any) {
      console.log(
        `API 호출 시도 ${attempt + 1} 실패:`,
        error?.message || error,
      );

      // 401 또는 403 에러이고 재시도 가능한 경우
      if (
        (error.status === 401 ||
          error.status === 403 ||
          error.message === '유효한 토큰이 없습니다') &&
        attempt < maxRetries
      ) {
        console.log('인증 오류 감지, 토큰 갱신 시도...');

        const refreshSuccess = await refreshAccessToken();
        if (refreshSuccess) {
          console.log('토큰 갱신 성공, API 재시도...');
          continue; // 다음 반복에서 재시도
        } else {
          console.log('토큰 갱신 실패');
          throw new Error('토큰 갱신 실패 - 재로그인 필요');
        }
      } else {
        // 재시도 불가능하거나 다른 에러인 경우
        throw error;
      }
    }
  }
};

/**
 * 토큰 갱신 상태 확인 함수 (디버깅용)
 */
export const getTokenRefreshStatus = () => {
  return {
    isRefreshing,
    hasRefreshPromise: !!refreshPromise,
  };
};

// ============================================================================
// 사용자 정보 관리
// ============================================================================
export const saveUserInfo = async (userInfo: StoredUserInfo): Promise<void> => {
  const userDataArray: [string, string][] = [
    ['userId', userInfo.userId],
    ['userProvider', userInfo.provider],
    ['userProviderId', userInfo.providerId],
    ['userName', userInfo.name],
    ['userProfile', JSON.stringify(userInfo)],
  ];

  if (userInfo.email) {
    userDataArray.push(['userEmail', userInfo.email]);
  }
  if (userInfo.profileImage) {
    userDataArray.push(['userProfileImage', userInfo.profileImage]);
  }
  if (userInfo.fcmToken) {
    userDataArray.push(['userFcmToken', userInfo.fcmToken]);
  }

  await AsyncStorage.multiSet(userDataArray);
};

export const getUserInfo = async (): Promise<StoredUserInfo | null> => {
  try {
    const userProfileString = await AsyncStorage.getItem('userProfile');
    return userProfileString ? JSON.parse(userProfileString) : null;
  } catch (error) {
    console.error('사용자 정보 읽기 실패:', error);
    return null;
  }
};

// 개별 사용자 정보 조회 (호환성 유지)
export const getUserId = async (): Promise<UserId | null> => {
  return await AsyncStorage.getItem('userId');
};

export const getUserName = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('userName');
};

export const getUserEmail = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('userEmail');
};

export const getUserProvider = async (): Promise<SocialProvider | null> => {
  return (await AsyncStorage.getItem('userProvider')) as SocialProvider | null;
};

export const getUserProviderId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('userProviderId');
};

// ============================================================================
// 인증 상태 관리
// ============================================================================
export const isLoggedIn = async (): Promise<boolean> => {
  const userId = await getUserId();
  const accessToken = await getAccessToken();
  return !!(userId && accessToken);
};

export const logout = async (): Promise<boolean> => {
  try {
    const keysToRemove: string[] = [
      'accessToken',
      'refreshToken',
      'userId',
      'userProvider',
      'userProviderId',
      'userName',
      'userEmail',
      'userProfileImage',
      'userFcmToken',
      'userProfile',
    ];
    await AsyncStorage.multiRemove(keysToRemove);

    // 토큰 갱신 상태도 리셋
    isRefreshing = false;
    refreshPromise = null;

    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    return false;
  }
};

// ============================================================================
// 디버그/유틸리티
// ============================================================================
export const debugAuthInfo = async (): Promise<void> => {
  const userInfo = await getUserInfo();
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  const tokenExpired = await isTokenExpired();
  const refreshStatus = getTokenRefreshStatus();

  console.log('=== Auth Debug Info ===');
  console.log('User Info:', userInfo);
  console.log(
    'Access Token:',
    accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
  );
  console.log(
    'Refresh Token:',
    refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null',
  );
  console.log('Token Expired:', tokenExpired);
  console.log('Is Logged In:', await isLoggedIn());
  console.log('Refresh Status:', refreshStatus);
  console.log('=====================');
};
