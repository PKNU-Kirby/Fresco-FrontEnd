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
      // console.log('=== 인증 상태 확인 시작 ===');

      // 토큰 상태 확인
      const status = await getTokenStatus();
      // console.log('토큰 상태:', status);
      setTokenStatus(status);

      if (!status.hasAccessToken || !status.hasRefreshToken) {
        /*
        console.log('❌ 토큰 없음:', {
          hasAccessToken: status.hasAccessToken,
          hasRefreshToken: status.hasRefreshToken,
        });
        */
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      // 사용자 정보 조회
      const userId = await AsyncStorageService.getCurrentUserId();
      // console.log('현재 userId:', userId);

      if (userId) {
        const userData = await AsyncStorageService.getUserById(userId);
        // console.log('사용자 데이터:', userData);

        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          // console.log('✅ 인증 성공');
          return true;
        } else {
          // console.log('❌ 사용자 데이터 없음');
        }
      } else {
        // console.log('❌ userId 없음');
      }

      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      // console.error('인증 상태 확인 실패:', error);
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

        // console.log('로그인 완료:', userData);
      } catch (error) {
        // console.error('로그인 처리 실패:', error);
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
      // console.log('로그아웃 완료');
    } catch (error) {
      // console.error('로그아웃 처리 실패:', error);
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
