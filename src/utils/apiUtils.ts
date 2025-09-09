// ===================================================================
// utils/apiUtils.ts - 공통 API 호출 유틸리티
// ===================================================================

import Config from 'react-native-config';
import { getAccessToken, isTokenExpired } from './authUtils';
import { AuthAPIService } from '../services/authApi';

// 인증이 필요한 API 호출 헬퍼
export const apiCallWithAuth = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  try {
    let accessToken = await getAccessToken();

    // 토큰 만료 체크 및 갱신
    if (accessToken && isTokenExpired(accessToken)) {
      const refreshSuccess = await AuthAPIService.refreshToken();
      if (!refreshSuccess) {
        throw new Error('토큰 갱신 실패 - 재로그인 필요');
      }
      accessToken = await getAccessToken();
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    const response = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 401 에러 시 토큰 갱신 후 재시도
    if (response.status === 401) {
      const refreshSuccess = await AuthAPIService.refreshToken();

      if (refreshSuccess) {
        const newToken = await getAccessToken();
        const retryResponse = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
        return retryResponse;
      } else {
        throw new Error('토큰 갱신 실패 - 재로그인 필요');
      }
    }

    return response;
  } catch (error) {
    console.error('API 호출 실패:', error);
    throw error;
  }
};

// 인증이 필요없는 API 호출 헬퍼
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return response;
  } catch (error) {
    console.error('API 호출 실패:', error);
    throw error;
  }
};
