import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageService } from '../services/AsyncStorageService';
import { AuthAPIService } from '../services/API/authAPI';

// 토큰 갱신 상태 관리 (race condition 방지)
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// 토큰 관련 함수들
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  } catch (error) {
    // console.error('액세스 토큰 조회 실패:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('refreshToken');
    return token;
  } catch (error) {
    // console.error('리프레시 토큰 조회 실패:', error);
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
    // console.error('토큰 저장 실패:', error);
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
    // console.error('토큰 삭제 실패:', error);
    throw error;
  }
};

// utils/authUtils.ts 일부 수정

export const isTokenExpired = (token: string): boolean => {
  try {
    if (!token) return true;

    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // 30초 여유를 두고 만료 판단
    const isExpired = payload.exp <= currentTime + 30;

    if (isExpired) {
      /*
      console.log('⏰ 토큰 만료 감지:', {
        expiryTime: new Date(payload.exp * 1000).toLocaleString(),
        currentTime: new Date().toLocaleString(),
        remainingSeconds: payload.exp - currentTime,
      });
      */
    }

    return isExpired;
  } catch (error) {
    // console.error('❌ 토큰 파싱 실패:', error);
    return true;
  }
};

// Refresh Token 만료 체크 추가
export const isRefreshTokenExpired = async (): Promise<boolean> => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return true;

    return isTokenExpired(refreshToken);
  } catch (error) {
    // console.error('❌ Refresh Token 확인 실패:', error);
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
    // console.error('인증 상태 확인 실패:', error);
    return false;
  }
};

/**
 * 토큰 갱신 중복 방지를 위한 래퍼
 */
const performTokenRefresh = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    // console.log('이미 토큰 갱신 중입니다. 기존 Promise를 기다립니다.');
    return await refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = AuthAPIService.refreshToken();

  try {
    const result = await refreshPromise;
    // console.log('토큰 갱신 결과:', result);
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
      // console.log('액세스 토큰이 없습니다');
      return null;
    }

    // 토큰 만료 확인 (30초 여유를 두고 갱신)
    if (isTokenExpired(accessToken)) {
      // console.log('토큰이 만료되었습니다. 갱신을 시도합니다...');

      const refreshSuccess = await performTokenRefresh();
      if (refreshSuccess) {
        accessToken = await getAccessToken();
        if (accessToken) {
          // console.log('토큰 갱신 성공');
          return accessToken;
        } else {
          // console.log('갱신 후 토큰을 찾을 수 없음');
          return null;
        }
      } else {
        // console.log('토큰 갱신 실패');
        return null;
      }
    }

    return accessToken;
  } catch (error) {
    // console.error('유효한 토큰 조회 실패:', error);
    return null;
  }
};

/**
 * 토큰 정보 디버깅 (JWT 페이로드 분석)
 */
export const debugTokenInfo = async (): Promise<void> => {
  try {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    // console.log('=== 토큰 디버깅 정보 ===');
    // console.log('액세스 토큰 존재:', !!accessToken);
    // console.log('리프레시 토큰 존재:', !!refreshToken);

    if (accessToken) {
      try {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          /*
          console.log('토큰 페이로드:', {
            userId: payload.userId,
            발급시간: new Date(payload.iat * 1000),
            만료시간: new Date(payload.exp * 1000),
            현재시간: new Date(),
            남은시간_초: payload.exp - currentTime,
            만료여부: payload.exp <= currentTime,
          });
          */
        }
      } catch (parseError) {
        // console.error('토큰 파싱 실패:', parseError);
      }
    }
    // console.log('=====================');
  } catch (error) {
    // console.error('토큰 디버깅 실패:', error);
  }
};

/**
 * 토큰의 사용자 ID 추출
 */
export const getTokenUserId = async (): Promise<string | null> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;

    const parts = accessToken.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.userId ? String(payload.userId) : null;
  } catch (error) {
    // console.error('토큰에서 사용자 ID 추출 실패:', error);
    return null;
  }
};

/**
 * 현재 사용자 ID와 토큰 사용자 ID 일치 검증
 */
export const validateUserTokenMatch = async (
  currentUserId: string,
): Promise<{
  isValid: boolean;
  tokenUserId?: string;
  needsReauth: boolean;
}> => {
  try {
    const tokenUserId = await getTokenUserId();

    /*
    console.log('사용자 ID 검증:', {
      현재사용자ID: currentUserId,
      토큰사용자ID: tokenUserId,
      일치여부: currentUserId === tokenUserId,
    });
    */

    if (!tokenUserId) {
      return {
        isValid: false,
        needsReauth: true,
      };
    }

    const isValid = currentUserId === tokenUserId;

    return {
      isValid,
      tokenUserId,
      needsReauth: !isValid,
    };
  } catch (error) {
    // console.error('사용자-토큰 매칭 검증 실패:', error);
    return {
      isValid: false,
      needsReauth: true,
    };
  }
};

/**
 * 개선된 유효한 액세스 토큰 조회 (사용자 ID 검증 포함)
 */
export const getValidAccessTokenWithUserCheck = async (
  expectedUserId?: string,
): Promise<{
  token: string | null;
  needsReauth: boolean;
  reason?: string;
}> => {
  try {
    let accessToken = await getAccessToken();

    if (!accessToken) {
      // console.log('액세스 토큰이 없습니다');
      return {
        token: null,
        needsReauth: true,
        reason: '토큰 없음',
      };
    }

    // 토큰 만료 확인
    if (isTokenExpired(accessToken)) {
      // console.log('토큰이 만료되었습니다. 갱신을 시도합니다...');

      const refreshSuccess = await performTokenRefresh();
      if (refreshSuccess) {
        accessToken = await getAccessToken();
        if (!accessToken) {
          return {
            token: null,
            needsReauth: true,
            reason: '갱신 후 토큰 없음',
          };
        }
      } else {
        return {
          token: null,
          needsReauth: true,
          reason: '토큰 갱신 실패',
        };
      }
    }

    // 사용자 ID 검증 (제공된 경우)
    if (expectedUserId) {
      const validation = await validateUserTokenMatch(expectedUserId);
      if (!validation.isValid) {
        return {
          token: null,
          needsReauth: true,
          reason: `사용자 ID 불일치 (기대: ${expectedUserId}, 토큰: ${validation.tokenUserId})`,
        };
      }
    }

    return {
      token: accessToken,
      needsReauth: false,
    };
  } catch (error) {
    // console.error('개선된 토큰 조회 실패:', error);
    return {
      token: null,
      needsReauth: true,
      reason: '토큰 조회 오류',
    };
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
        // console.error('토큰 파싱 실패:', parseError);
      }
    }

    return {
      hasAccessToken,
      hasRefreshToken,
      isAccessTokenExpired,
      accessTokenExpiresIn,
    };
  } catch (error) {
    // console.error('토큰 상태 확인 실패:', error);
    return {
      hasAccessToken: false,
      hasRefreshToken: false,
      isAccessTokenExpired: true,
    };
  }
};

// utils/authUtils.ts에 추가

/**
 * 로그인 후 토큰 검증 (백엔드 이슈 확인용)
 */
export const validateLoginTokens = async (): Promise<{
  isValid: boolean;
  issues: string[];
}> => {
  const issues: string[] = [];

  try {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!accessToken || !refreshToken) {
      issues.push('토큰이 저장되지 않음');
      return { isValid: false, issues };
    }

    // 1. 토큰이 같은지 확인
    if (accessToken === refreshToken) {
      issues.push('⚠️ Access Token과 Refresh Token이 동일함 (백엔드 이슈)');
    }

    // 2. 만료시간 확인
    try {
      const accessPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const refreshPayload = JSON.parse(atob(refreshToken.split('.')[1]));

      if (accessPayload.exp === refreshPayload.exp) {
        issues.push(
          '⚠️ Access Token과 Refresh Token의 만료시간이 동일함 (백엔드 이슈)',
        );
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const accessExpInHours = (accessPayload.exp - currentTime) / 3600;
      const refreshExpInHours = (refreshPayload.exp - currentTime) / 3600;

      /*
      console.log('📊 토큰 만료시간 분석:', {
        accessTokenExpiry: `${accessExpInHours.toFixed(2)} 시간`,
        refreshTokenExpiry: `${refreshExpInHours.toFixed(2)} 시간`,
        recommendedAccess: '1 hour',
        recommendedRefresh: '7~30 days',
      });
      */

      if (accessExpInHours < 0.5) {
        issues.push(
          `Access Token 만료시간이 너무 짧음: ${accessExpInHours.toFixed(
            2,
          )}시간`,
        );
      }

      if (refreshExpInHours < 24) {
        issues.push(
          `Refresh Token 만료시간이 너무 짧음: ${refreshExpInHours.toFixed(
            2,
          )}시간`,
        );
      }
    } catch (e) {
      issues.push('토큰 페이로드 파싱 실패');
    }

    /*
    console.log('🔍 토큰 검증 결과:', {
      isValid: issues.length === 0,
      issues,
    });
    */

    return {
      isValid: issues.length === 0,
      issues,
    };
  } catch (error) {
    // console.error('토큰 검증 실패:', error);
    return {
      isValid: false,
      issues: ['토큰 검증 중 오류 발생'],
    };
  }
};
