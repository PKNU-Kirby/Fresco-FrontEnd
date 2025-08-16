import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SocialProvider } from '../types/auth';

interface ApiLogData {
  timestamp: string;
  url: string;
  method: string;
  headers?: any;
  body?: any;
  provider?: SocialProvider;
  providerId?: string; // userId 대신 providerId 사용 (더 정확함)
}

// ============================================================================
// API 요청 로깅 함수들
// ============================================================================

// 기본 API 요청 로그 출력
export const logApiRequest = (data: ApiLogData): void => {
  console.log('\n🚀 ===== API 요청 로그 =====');
  console.log(`⏰ 시간: ${data.timestamp}`);
  console.log(`🌐 URL: ${data.method} ${data.url}`);

  if (data.provider) {
    console.log(`🔐 소셜 제공자: ${data.provider}`);
  }

  if (data.headers) {
    console.log('📝 Headers:');
    console.log(JSON.stringify(data.headers, null, 2));
  }

  if (data.body) {
    console.log('📦 Request Body:');
    console.log(JSON.stringify(data.body, null, 2));
  }

  if (data.providerId) {
    console.log(`👤 Provider ID (참고): ${data.providerId}`);
  }

  console.log('=============================\n');
};

// 백엔드 로그인 요청 로그 (ERD 기반 개선)
export const logBackendLoginRequest = (
  provider: SocialProvider,
  accessToken: string,
  providerId?: string,
): void => {
  const requestData = {
    provider,
    accessToken,
  };

  logApiRequest({
    timestamp: new Date().toLocaleString('ko-KR'),
    url: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: requestData,
    provider,
    providerId,
  });

  // 토큰 보안 체크 (마스킹)
  console.log('🔒 토큰 보안 체크:');
  console.log(`   - 토큰 길이: ${accessToken.length}자`);
  console.log(`   - 토큰 앞 10자: ${accessToken.substring(0, 10)}...`);
  console.log(
    `   - 토큰 마지막 5자: ...${accessToken.substring(accessToken.length - 5)}`,
  );
};

// 토큰 재발급 요청 로그
export const logRefreshTokenRequest = (refreshToken: string): void => {
  const requestData = {
    refreshToken,
  };

  logApiRequest({
    timestamp: new Date().toLocaleString('ko-KR'),
    url: '/api/v1/auth/refresh',
    method: 'GET', // 또는 POST (API 스펙에 따라)
    headers: {
      'Content-Type': 'application/json',
    },
    body: requestData,
  });
};

// 로그아웃 요청 로그
export const logLogoutRequest = (accessToken?: string): void => {
  logApiRequest({
    timestamp: new Date().toLocaleString('ko-KR'),
    url: '/api/v1/auth/logout',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });
};

// ============================================================================
// AsyncStorage 상태 로깅 함수들
// ============================================================================

// ERD 기반으로 개선된 현재 저장된 정보 로그
export const logCurrentTokens = async (): Promise<void> => {
  try {
    const [
      userId,
      userProvider,
      userProviderId,
      userName,
      userEmail,
      userProfileImage,
      userFcmToken,
      accessToken,
      refreshToken,
      userProfile,
    ] = await AsyncStorage.multiGet([
      'userId',
      'userProvider',
      'userProviderId',
      'userName',
      'userEmail',
      'userProfileImage',
      'userFcmToken',
      'accessToken',
      'refreshToken',
      'userProfile',
    ]);

    console.log('\n📱 ===== 현재 저장된 정보 =====');
    console.log('👤 사용자 정보:');
    console.log(`   - 사용자 ID: ${userId[1] || 'null'}`);
    console.log(`   - Provider: ${userProvider[1] || 'null'}`);
    console.log(`   - Provider ID: ${userProviderId[1] || 'null'}`);
    console.log(`   - 이름: ${userName[1] || 'null'}`);
    console.log(`   - 이메일: ${userEmail[1] || 'null'}`);
    console.log(`   - 프로필 이미지: ${userProfileImage[1] ? '있음' : 'null'}`);
    console.log(`   - FCM 토큰: ${userFcmToken[1] ? '있음' : 'null'}`);

    console.log('\n🔑 토큰 정보:');
    console.log(
      `   - 액세스 토큰: ${
        accessToken[1] ? `${accessToken[1].substring(0, 15)}...` : 'null'
      }`,
    );
    console.log(
      `   - 리프레시 토큰: ${
        refreshToken[1] ? `${refreshToken[1].substring(0, 15)}...` : 'null'
      }`,
    );

    if (userProfile[1]) {
      console.log('\n📄 전체 프로필:');
      console.log(userProfile[1]);
    }

    console.log('===============================\n');
  } catch (error) {
    console.error('❌ 저장된 정보 읽기 실패:', error);
  }
};

// ============================================================================
// API 응답/에러 로깅 함수들
// ============================================================================

// API 응답 로그
export const logApiResponse = (
  url: string,
  status: number,
  data: any,
): void => {
  console.log('\n✅ ===== API 응답 로그 =====');
  console.log(`🌐 URL: ${url}`);
  console.log(`📊 Status: ${status}`);
  console.log('📦 Response Data:');
  console.log(JSON.stringify(data, null, 2));
  console.log('============================\n');
};

// API 에러 로그
export const logApiError = (url: string, error: any): void => {
  console.log('\n❌ ===== API 에러 로그 =====');
  console.log(`🌐 URL: ${url}`);
  console.log(`🚨 Error:`, error);
  if (error?.response) {
    console.log(`📊 Status: ${error.response.status}`);
    console.log(`📦 Response Data:`, error.response.data);
  }
  console.log('============================\n');
};

// ============================================================================
// 개발용 유틸리티 함수들
// ============================================================================

// 모든 AsyncStorage 키-값 쌍 출력 (디버깅용)
export const logAllStorageData = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);

    console.log('\n🗃️ ===== 전체 AsyncStorage 데이터 =====');
    stores.forEach(([key, value]) => {
      if (key.includes('Token') && value) {
        // 토큰은 마스킹해서 출력
        console.log(`${key}: ${value.substring(0, 10)}...`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
    console.log('=====================================\n');
  } catch (error) {
    console.error('❌ AsyncStorage 데이터 읽기 실패:', error);
  }
};

// AsyncStorage 초기화 (개발용)
export const clearAllStorageData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage 모든 데이터 삭제 완료');
  } catch (error) {
    console.error('❌ AsyncStorage 초기화 실패:', error);
  }
};
