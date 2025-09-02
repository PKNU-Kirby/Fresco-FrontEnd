import React, { useEffect } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import NaverLogin from '@react-native-seoul/naver-login';
import type {
  NaverLoginResponse,
  GetProfileResponse,
} from '@react-native-seoul/naver-login';
import Config from 'react-native-config';
import { socialLoginButtonStyles as styles } from './styles';
import type { SocialProvider, NaverProfile } from '../../types';

interface NaverLoginButtonProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleSocialLoginWithAPI: (
    provider: SocialProvider,
    socialAccessToken: string,
    userProfile: {
      providerId: string;
      name: string;
      email?: string;
      profileImage?: string;
    },
  ) => Promise<void>;
  showErrorAlert: (message: string) => void;
}

interface NaverConfig {
  consumerKey: string;
  consumerSecret: string;
  appName: string;
  serviceUrlSchemeIOS: string;
  disableNaverAppAuthIOS: boolean;
}

const NAVER_CONFIG: NaverConfig = {
  consumerKey: Config.NAVER_CLIENT_ID || '',
  consumerSecret: Config.NAVER_CLIENT_SECRET || '',
  appName: 'Fresco',
  serviceUrlSchemeIOS: 'naverlogin',
  disableNaverAppAuthIOS: true,
};

// 네이버 토큰 직접 검증 함수
const verifyNaverToken = async (accessToken: string) => {
  try {
    const response = await fetch('https://openapi.naver.com/v1/nid/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();
    console.log('🔍 네이버 토큰 검증 응답:', result);

    if (result.resultcode === '00') {
      console.log('✅ 네이버 토큰 유효함');
      return { valid: true, data: result };
    } else {
      console.log('❌ 네이버 토큰 무효:', result.message);
      return { valid: false, error: result.message };
    }
  } catch (error) {
    console.error('❌ 네이버 토큰 검증 실패:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return { valid: false, error: errorMessage };
  }
};

const NaverLoginButton: React.FC<NaverLoginButtonProps> = ({
  isLoading,
  setIsLoading,
  handleSocialLoginWithAPI,
  showErrorAlert,
}) => {
  useEffect(() => {
    console.log('🔍 네이버 설정:', {
      clientId: NAVER_CONFIG.consumerKey,
      hasSecret: !!NAVER_CONFIG.consumerSecret,
      appName: NAVER_CONFIG.appName,
    });

    NaverLogin.initialize({
      appName: NAVER_CONFIG.appName,
      consumerKey: NAVER_CONFIG.consumerKey,
      consumerSecret: NAVER_CONFIG.consumerSecret,
      serviceUrlSchemeIOS: NAVER_CONFIG.serviceUrlSchemeIOS,
      disableNaverAppAuthIOS: true,
    });
  }, []);

  const handleNaverLogin = async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      console.log('🔍 네이버 로그인 시작...');
      const { failureResponse, successResponse }: NaverLoginResponse =
        await NaverLogin.login();

      if (failureResponse) {
        console.log('❌ 네이버 로그인 실패 응답:', failureResponse);
        throw new Error(failureResponse.message || '네이버 로그인 실패');
      }

      if (!successResponse?.accessToken) {
        console.log('❌ 네이버 토큰 없음');
        throw new Error('네이버 토큰을 가져올 수 없습니다');
      }

      console.log('🔍 받은 네이버 토큰 정보:', {
        tokenLength: successResponse.accessToken.length,
        tokenStart: successResponse.accessToken.substring(0, 10),
        hasSpecialChars: /[+/=]/.test(successResponse.accessToken),
        tokenType: successResponse.tokenType,
      });

      // 토큰 직접 검증
      console.log('🔍 네이버 토큰 검증 중...');
      const verification = await verifyNaverToken(successResponse.accessToken);

      if (!verification.valid) {
        throw new Error(`네이버 토큰 검증 실패: ${verification.error}`);
      }

      const profileResult: GetProfileResponse = await NaverLogin.getProfile(
        successResponse.accessToken,
      );

      console.log('🔍 네이버 프로필 결과:', profileResult);

      if (!profileResult?.response?.id) {
        throw new Error('네이버 사용자 정보를 가져올 수 없습니다');
      }

      const profile = profileResult.response as NaverProfile;
      const providerId = String(profile.id);
      const userName =
        profile.name || profile.nickname || `네이버사용자_${profile.id}`;
      const userEmail = profile.email || undefined;
      const profileImageUrl = profile.profile_image || undefined;

      console.log('🔍 서버로 전송할 네이버 데이터:', {
        provider: 'NAVER',
        tokenLength: successResponse.accessToken.length,
        userInfo: {
          providerId,
          name: userName,
          email: userEmail,
          hasProfileImage: !!profileImageUrl,
        },
      });

      await handleSocialLoginWithAPI('NAVER', successResponse.accessToken, {
        providerId,
        name: userName,
        email: userEmail,
        profileImage: profileImageUrl,
      });
    } catch (error) {
      console.error('네이버 로그인 실패:', error);
      const message =
        error instanceof Error ? error.message : '네이버 로그인 실패';
      showErrorAlert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleNaverLogin}
      style={[styles.loginButton, isLoading && styles.loadingLoginButton]}
      disabled={isLoading}
    >
      <Image
        source={require('../../assets/img/btn_login_naver.png')}
        style={styles.image}
      />
    </TouchableOpacity>
  );
};

export default NaverLoginButton;
