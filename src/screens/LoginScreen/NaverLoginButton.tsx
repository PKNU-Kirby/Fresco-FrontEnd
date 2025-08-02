import React, { useEffect } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import NaverLogin from '@react-native-seoul/naver-login';
import type {
  NaverLoginResponse,
  GetProfileResponse,
} from '@react-native-seoul/naver-login';
import Config from 'react-native-config';
import styles from './styles';

type Props = {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  saveUserIdAndNavigate: (id: string) => Promise<void>;
  showErrorAlert: (msg: string) => void;
};

const NAVER_CONFIG = {
  consumerKey: Config.NAVER_CLIENT_ID || '',
  consumerSecret: Config.NAVER_CLIENT_SECRET || '',
  appName: 'fresco_frontend',
  serviceUrlSchemeIOS: 'naverlogin',
  disableNaverAppAuthIOS: true,
};

const NaverLoginButton = ({
  isLoading,
  setIsLoading,
  saveUserIdAndNavigate,
  showErrorAlert,
}: Props) => {
  useEffect(() => {
    NaverLogin.initialize(NAVER_CONFIG);
  }, []);

  const handleNaverLogin = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const { failureResponse, successResponse }: NaverLoginResponse =
        await NaverLogin.login();

      if (failureResponse) {
        throw new Error(failureResponse.message || '네이버 로그인 실패');
      }
      if (!successResponse?.accessToken) {
        throw new Error('네이버 토큰 없음');
      }

      const profileResult: GetProfileResponse = await NaverLogin.getProfile(
        successResponse.accessToken,
      );

      if (!profileResult?.response?.id) {
        throw new Error('네이버 사용자 정보 없음');
      }

      console.log('네이버 accessToken:', successResponse.accessToken);
      console.log('네이버 사용자 정보:', profileResult.response);

      await saveUserIdAndNavigate(String(profileResult.response.id));
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
      style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
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
