// services/API/authAPI.ts
import Config from '../../types/config';
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

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export class AuthAPIService {
  // login API
  static async login(
    provider: SocialProvider,
    accessToken: string,
  ): Promise<LoginResponse> {
    try {
      console.log('🔐 로그인 요청:', { provider });

      const response = await fetch(`${Config.API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, accessToken }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: LoginResponse = await response.json();

      // 🔍 토큰 정보 로깅 (디버깅용)
      if (result.result?.accessToken && result.result?.refreshToken) {
        console.log('📝 로그인 응답 토큰 정보:', {
          accessToken: result.result.accessToken.substring(0, 50) + '...',
          refreshToken: result.result.refreshToken.substring(0, 50) + '...',
          tokensAreSame:
            result.result.accessToken === result.result.refreshToken,
        });

        // 토큰 페이로드 분석
        try {
          const accessPayload = JSON.parse(
            atob(result.result.accessToken.split('.')[1]),
          );
          const refreshPayload = JSON.parse(
            atob(result.result.refreshToken.split('.')[1]),
          );

          console.log('📊 토큰 만료시간 분석:', {
            accessExp: new Date(accessPayload.exp * 1000).toLocaleString(),
            refreshExp: new Date(refreshPayload.exp * 1000).toLocaleString(),
            sameExpiry: accessPayload.exp === refreshPayload.exp,
          });
        } catch (e) {
          console.warn('토큰 페이로드 파싱 실패:', e);
        }
      }

      return result;
    } catch (error) {
      console.error('❌ 로그인 API 실패:', error);
      throw error;
    }
  }

  // logout API
  static async logout(accessToken?: string): Promise<void> {
    try {
      if (accessToken) {
        await fetch(`${Config.API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.warn('⚠️ 서버 로그아웃 실패:', error);
    } finally {
      await clearTokens();
    }
  }

  // token Refresh API - 개선된 버전
  static async refreshToken(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
      console.log('⏳ 이미 토큰 갱신 중 - 기존 Promise 대기');
      return await refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const refreshToken = await getRefreshToken();
        const currentAccessToken = await getAccessToken();

        console.log('🔄 토큰 갱신 시도:', {
          hasRefreshToken: !!refreshToken,
          hasAccessToken: !!currentAccessToken,
        });

        if (!refreshToken) {
          console.error('❌ Refresh Token이 없습니다');
          return false;
        }

        // ⚠️ 중요: Authorization 헤더 제거 또는 유효한 토큰만 전송
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // 현재 Access Token이 만료되지 않았다면 헤더에 포함
        if (currentAccessToken) {
          try {
            const payload = JSON.parse(atob(currentAccessToken.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            if (payload.exp > currentTime) {
              headers.Authorization = `Bearer ${currentAccessToken}`;
              console.log('✅ 유효한 Access Token을 헤더에 포함');
            } else {
              console.log('⚠️ Access Token 만료 - 헤더에서 제외');
            }
          } catch (e) {
            console.warn('토큰 검증 실패:', e);
          }
        }

        const response = await fetch(
          `${Config.API_BASE_URL}/api/v1/auth/refresh`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ refreshToken }),
          },
        );

        console.log('📡 Refresh 응답 상태:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ 토큰 갱신 실패:', {
            status: response.status,
            error: errorText,
          });

          if (response.status === 401 || response.status === 403) {
            console.log('🚪 인증 만료 - 토큰 클리어 및 재로그인 필요');
            await clearTokens();
          }
          return false;
        }

        const result: RefreshTokenResponse = await response.json();

        console.log('📥 Refresh 응답:', {
          code: result.code,
          hasAccessToken: !!result.result?.accessToken,
          hasRefreshToken: !!result.result?.refreshToken,
        });

        if (result.code === 'AUTH_OK_002' && result.result?.accessToken) {
          const newAccessToken = result.result.accessToken;
          const newRefreshToken = result.result.refreshToken || refreshToken;

          // 🔍 토큰 변경 여부 확인
          const tokenChanged = currentAccessToken !== newAccessToken;
          console.log('🔄 토큰 변경 여부:', {
            changed: tokenChanged,
            oldToken: currentAccessToken?.substring(0, 30) + '...',
            newToken: newAccessToken?.substring(0, 30) + '...',
          });

          await saveTokens(newAccessToken, newRefreshToken);
          console.log('✅ 토큰 갱신 성공');

          return true;
        }

        console.warn('⚠️ 예상치 못한 응답 형식:', result);
        return false;
      } catch (error) {
        console.error('❌ 토큰 갱신 중 오류:', error);
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return await refreshPromise;
  }
}
