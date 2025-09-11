import Config from 'react-native-config';
import {
  getRefreshToken,
  saveTokens,
  clearTokens,
  getAccessToken,
} from '../../utils/authUtils';
import type {
  SocialProvider,
  LoginResponse,
  RefreshTokenResponse,
} from '../../types/auth';

// token refresh state
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export class AuthAPIService {
  private static readonly BASE_URL = Config.API_BASE_URL;

  // login API
  static async login(
    provider: SocialProvider,
    accessToken: string,
  ): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, accessToken }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('로그인 API 실패:', error);
      throw error;
    }
  }

  // logout API
  static async logout(accessToken?: string): Promise<void> {
    try {
      if (accessToken) {
        await fetch(`${this.BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.warn('서버 로그아웃 실패:', error);
    } finally {
      await clearTokens();
    }
  }

  // token Refresh API
  static async refreshToken(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
      return await refreshPromise;
    }

    isRefreshing = true;

    refreshPromise = (async () => {
      try {
        const beforeToken = await getAccessToken();
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          return false;
        }

        const response = await fetch(`${this.BASE_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          console.log('토큰 갱신 HTTP 에러:', response.status);
          if (response.status === 401 || response.status === 403) {
            await clearTokens();
          }
          return false;
        }

        const result: RefreshTokenResponse = await response.json();
        console.log('서버 응답:', {
          code: result.code,
          hasAccessToken: !!result.result?.accessToken,
          hasRefreshToken: !!result.result?.refreshToken,
        });

        if (result.code === 'AUTH_OK_002' && result.result.accessToken) {
          const newAccessToken = result.result.accessToken;
          const newRefreshToken = result.result.refreshToken || refreshToken;

          await saveTokens(newAccessToken, newRefreshToken);

          const afterToken = await getAccessToken();
          const tokenChanged = beforeToken !== afterToken;
          console.log('변경된 토큰 :', tokenChanged);

          return true;
        }

        return false;
      } catch (error) {
        console.error('토큰 갱신 실패:', error);
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return await refreshPromise;
  }
}
