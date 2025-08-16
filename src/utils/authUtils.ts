import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SocialProvider,
  //  LoginRequest,
  //  LoginResponse,
  //  RefreshTokenRequest,
  //  RefreshTokenResponse,
  //  LogoutResponse,
  //  StorageKey,
  UserId,
} from '../types';

// ERD 기반 사용자 정보 타입
export interface StoredUserInfo {
  userId: string; // 실제 서버 DB의 사용자 ID (추후 서버에서 받을 예정)
  provider: SocialProvider;
  providerId: string; // 소셜 로그인 제공자의 고유 ID
  name: string;
  email?: string;
  profileImage?: string;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// AsyncStorage 기반 인증 함수들 (현재 사용 중)
// ============================================================================

// 토큰 저장/조회
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

// ERD 기반 사용자 정보 저장/조회
export const saveUserInfo = async (userInfo: StoredUserInfo): Promise<void> => {
  // 기본 정보 배열
  const userDataArray: [string, string][] = [
    ['userId', userInfo.userId],
    ['userProvider', userInfo.provider],
    ['userProviderId', userInfo.providerId],
    ['userName', userInfo.name],
    ['userProfile', JSON.stringify(userInfo)],
  ];

  // optional 필드들 안전하게 추가
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

// 로그인 상태 확인
export const isLoggedIn = async (): Promise<boolean> => {
  const userId = await getUserId();
  const accessToken = await getAccessToken();
  return !!(userId && accessToken);
};

// 로그아웃
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

export const clearAllAuthData = async (): Promise<void> => {
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
};

// 디버그 정보 출력
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

// ============================================================================
// API 연동 준비 함수들 (주석 처리, 추후 사용)
// ============================================================================

/*
// 서버 API 호출 함수들
export const loginAPI = async (
  provider: SocialProvider,
  accessToken: string
): Promise<LoginResponse> => {
  const requestData: LoginRequest = {
    provider,
    accessToken,
  };

  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const refreshTokenAPI = async (
  refreshToken: string
): Promise<RefreshTokenResponse> => {
  const requestData: RefreshTokenRequest = {
    refreshToken,
  };

  const response = await fetch('/api/v1/auth/refresh', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const logoutAPI = async (): Promise<LogoutResponse> => {
  const accessToken = await getAccessToken();
  
  const response = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 통합 로그인 처리 함수 (API 연동 시 사용)
export const handleSocialLogin = async (
  provider: SocialProvider,
  socialAccessToken: string,
  userProfile: {
    providerId: string;
    name: string;
    email?: string;
    profileImage?: string;
  }
): Promise<boolean> => {
  try {
    // 1. 서버에 로그인 요청
    const response = await loginAPI(provider, socialAccessToken);
    
    if (response.code === 'AUTH_OK_001') {
      // 2. 서버에서 받은 토큰 저장
      await saveTokens(response.result.accessToken, response.result.refreshToken);
      
      // 3. 사용자 정보 저장 (서버에서 받은 실제 userId 사용)
      const userInfo: StoredUserInfo = {
        userId: response.result.userId, // 서버에서 받은 실제 사용자 ID
        provider,
        providerId: userProfile.providerId,
        name: userProfile.name,
        email: userProfile.email,
        profileImage: userProfile.profileImage,
      };
      
      await saveUserInfo(userInfo);
      
      return true;
    } else {
      throw new Error(response.message || '로그인에 실패했습니다.');
    }
  } catch (error) {
    console.error('로그인 처리 실패:', error);
    throw error;
  }
};

// 토큰 갱신 처리
export const handleTokenRefresh = async (): Promise<boolean> => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.');
    }

    const response = await refreshTokenAPI(refreshToken);
    
    if (response.code === 'AUTH_OK_002') {
      await saveTokens(response.result.accessToken, response.result.refreshToken);
      return true;
    } else {
      throw new Error(response.message || '토큰 갱신에 실패했습니다.');
    }
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    // 토큰 갱신 실패 시 로그아웃 처리
    await logout();
    return false;
  }
};

// 로그아웃 처리 (서버 호출 포함)
export const handleLogout = async (): Promise<boolean> => {
  try {
    // 1. 서버에 로그아웃 요청
    await logoutAPI();
    
    // 2. 로컬 데이터 삭제
    await logout();
    
    return true;
  } catch (error) {
    console.error('로그아웃 처리 실패:', error);
    // 서버 호출 실패해도 로컬 데이터는 삭제
    await logout();
    return false;
  }
};
*/
