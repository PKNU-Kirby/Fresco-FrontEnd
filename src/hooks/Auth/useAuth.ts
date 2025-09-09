import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageService } from '../../services/AsyncStorageService';
import {
  getTokenStatus,
  saveTokens,
  clearTokens,
  getValidAccessToken,
} from '../../utils/authUtils';
import { User } from '../../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenStatus, setTokenStatus] = useState<any>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // 토큰 상태 확인
      const status = await getTokenStatus();
      setTokenStatus(status);

      if (!status.hasAccessToken || !status.hasRefreshToken) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      // 사용자 정보 조회
      const userId = await AsyncStorageService.getCurrentUserId();
      if (userId) {
        const userData = await AsyncStorageService.getUserById(userId);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }

      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (accessToken: string, refreshToken: string, userData: User) => {
      try {
        await saveTokens(accessToken, refreshToken);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('lastLoginTime', Date.now().toString());

        setUser(userData);
        setIsAuthenticated(true);

        // 토큰 상태 업데이트
        const status = await getTokenStatus();
        setTokenStatus(status);

        console.log('로그인 완료:', userData);
      } catch (error) {
        console.error('로그인 처리 실패:', error);
        throw error;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setTokenStatus(null);
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 처리 실패:', error);
      throw error;
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    return await checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    isLoading,
    tokenStatus,
    login,
    logout,
    refreshAuth,
    checkAuthStatus,
  };
};

// utils/apiClient.ts - 통합 API 클라이언트
import Config from 'react-native-config';

export class ApiClient {
  private static baseURL = Config.API_BASE_URL;

  /**
   * 인증이 필요한 API 호출
   */
  static async authenticatedRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await getValidAccessToken();

    if (!token) {
      throw { status: 401, message: '인증 토큰이 없습니다' };
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;

      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      throw {
        status: response.status,
        message: errorData.message || response.statusText,
        data: errorData,
      };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return (await response.text()) as any;
    }
  }

  /**
   * GET 요청
   */
  static async get<T = any>(endpoint: string): Promise<T> {
    return this.authenticatedRequest<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST 요청
   */
  static async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.authenticatedRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청
   */
  static async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.authenticatedRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   */
  static async delete<T = any>(endpoint: string): Promise<T> {
    return this.authenticatedRequest<T>(endpoint, { method: 'DELETE' });
  }
}
