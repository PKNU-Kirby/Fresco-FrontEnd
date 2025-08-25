import React, { useEffect } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import NaverLogin from '@react-native-seoul/naver-login';
import type {
  NaverLoginResponse,
  GetProfileResponse,
} from '@react-native-seoul/naver-login';
import Config from 'react-native-config';
import {
  logBackendLoginRequest,
  logCurrentTokens,
} from '../../utils/apiAuthLogger';
import styles from './styles';
import type { SocialProvider, NaverProfile } from '../../types';

interface NaverLoginButtonProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  saveUserDataAndNavigate: (
    provider: SocialProvider,
    providerId: string,
    name: string,
    email?: string,
    profileImage?: string,
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
  appName: 'fresco_frontend',
  serviceUrlSchemeIOS: 'naverlogin',
  disableNaverAppAuthIOS: true,
};

const NaverLoginButton: React.FC<NaverLoginButtonProps> = ({
  isLoading,
  setIsLoading,
  saveUserDataAndNavigate,
  showErrorAlert,
}) => {
  useEffect(() => {
    NaverLogin.initialize(NAVER_CONFIG);
  }, []);

  const handleNaverLogin = async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const { failureResponse, successResponse }: NaverLoginResponse =
        await NaverLogin.login();

      if (failureResponse) {
        throw new Error(failureResponse.message || '네이버 로그인 실패');
      }

      if (!successResponse?.accessToken) {
        throw new Error('네이버 토큰을 가져올 수 없습니다');
      }

      const profileResult: GetProfileResponse = await NaverLogin.getProfile(
        successResponse.accessToken,
      );

      if (!profileResult?.response?.id) {
        throw new Error('네이버 사용자 정보를 가져올 수 없습니다');
      }

      //console.log('>> 네이버 소셜 로그인 성공!');

      const profile = profileResult.response as NaverProfile;
      const providerId = String(profile.id);
      const userName =
        profile.name || profile.nickname || `네이버사용자_${profile.id}`;
      const userEmail = profile.email || undefined;
      const profileImageUrl = profile.profile_image || undefined;

      // [API] 백엔드 로그인 요청 데이터 로깅
      logBackendLoginRequest('NAVER', successResponse.accessToken, providerId);

      // 사용자 정보 저장 & 화면 이동
      await saveUserDataAndNavigate(
        'NAVER',
        providerId,
        userName,
        userEmail,
        profileImageUrl,
      );

      // 현재 토큰 상태 확인
      setTimeout(() => {
        logCurrentTokens();
      }, 100);
    } catch (error) {
      // console.error('>> 네이버 로그인 실패:', error);
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
