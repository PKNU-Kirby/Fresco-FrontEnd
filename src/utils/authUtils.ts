import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageService } from '../services/AsyncStorageService';

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
