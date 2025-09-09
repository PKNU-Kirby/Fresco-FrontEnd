import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageService } from '../services/AsyncStorageService';
import { AuthAPIService } from '../services/authAPI';

// 토큰 갱신 상태 관리 (race condition 방지)
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// 토큰 관련 함수들
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  } catch (error) {
    console.error('액세스 토큰 조회 실패:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('refreshToken');
    return token;
  } catch (error) {
    console.error('리프레시 토큰 조회 실패:', error);
    return null;
  }
};

export const saveTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
  } catch (error) {
    console.error('토큰 저장 실패:', error);
    throw error;
  }
};

export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'isLoggedIn',
      'loginProvider',
      'lastLoginTime',
    ]);
    await AsyncStorageService.clearAllAuthData();
  } catch (error) {
    console.error('토큰 삭제 실패:', error);
    throw error;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    if (!token) return true;

    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // 30초 여유를 두고 만료 판단
    return payload.exp <= currentTime + 30;
  } catch (error) {
    console.error('토큰 파싱 실패:', error);
    return true;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const [accessToken, isLoggedIn] = await Promise.all([
      getAccessToken(),
      AsyncStorage.getItem('isLoggedIn'),
    ]);

    return !!(accessToken && isLoggedIn === 'true');
  } catch (error) {
    console.error('인증 상태 확인 실패:', error);
    return false;
  }
};

/**
 * 토큰 갱신 중복 방지를 위한 래퍼
 */
const performTokenRefresh = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    console.log('이미 토큰 갱신 중입니다. 기존 Promise를 기다립니다.');
    return await refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = AuthAPIService.refreshToken();

  try {
    const result = await refreshPromise;
    console.log('토큰 갱신 결과:', result);
    return result;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

/**
 * 유효한 액세스 토큰 조회 (자동 갱신 포함)
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    let accessToken = await getAccessToken();

    if (!accessToken) {
      console.log('액세스 토큰이 없습니다');
      return null;
    }

    // 토큰 만료 확인 (30초 여유를 두고 갱신)
    if (isTokenExpired(accessToken)) {
      console.log('토큰이 만료되었습니다. 갱신을 시도합니다...');

      const refreshSuccess = await performTokenRefresh();
      if (refreshSuccess) {
        accessToken = await getAccessToken();
        if (accessToken) {
          console.log('토큰 갱신 성공');
          return accessToken;
        } else {
          console.log('갱신 후 토큰을 찾을 수 없음');
          return null;
        }
      } else {
        console.log('토큰 갱신 실패');
        return null;
      }
    }

    return accessToken;
  } catch (error) {
    console.error('유효한 토큰 조회 실패:', error);
    return null;
  }
};
/**
 * 토큰 상태 확인 (디버깅용)
 */
export const getTokenStatus = async (): Promise<{
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  isAccessTokenExpired: boolean;
  accessTokenExpiresIn?: number;
}> => {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      getAccessToken(),
      getRefreshToken(),
    ]);

    const hasAccessToken = !!accessToken;
    const hasRefreshToken = !!refreshToken;
    let isAccessTokenExpired = true;
    let accessTokenExpiresIn: number | undefined;

    if (accessToken) {
      try {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          isAccessTokenExpired = payload.exp <= currentTime;
          accessTokenExpiresIn = payload.exp - currentTime;
        }
      } catch (parseError) {
        console.error('토큰 파싱 실패:', parseError);
      }
    }

    return {
      hasAccessToken,
      hasRefreshToken,
      isAccessTokenExpired,
      accessTokenExpiresIn,
    };
  } catch (error) {
    console.error('토큰 상태 확인 실패:', error);
    return {
      hasAccessToken: false,
      hasRefreshToken: false,
      isAccessTokenExpired: true,
    };
  }
};
