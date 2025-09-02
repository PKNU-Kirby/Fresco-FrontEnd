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
  console.log('Is Logged In:', await isLoggedIn());
  console.log('=====================');
};
