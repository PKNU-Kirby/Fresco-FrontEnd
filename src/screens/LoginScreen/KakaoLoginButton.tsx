import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import {
  loginWithKakaoAccount,
  getProfile as getKakaoProfile,
} from '@react-native-seoul/kakao-login';
import {
  logBackendLoginRequest,
  logCurrentTokens,
} from '../../utils/apiAuthLogger';
import styles from './styles';
import type { SocialProvider, KakaoProfile, KakaoToken } from '../../types';

interface KakaoLoginButtonProps {
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

const KakaoLoginButton: React.FC<KakaoLoginButtonProps> = ({
  isLoading,
  setIsLoading,
  saveUserDataAndNavigate,
  showErrorAlert,
}) => {
  const handleKakaoLogin = async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const token: KakaoToken = await loginWithKakaoAccount();
      const profile: KakaoProfile = await getKakaoProfile();

      if (!token?.accessToken) {
        throw new Error('카카오 토큰을 가져올 수 없습니다');
      }

      if (!profile?.id) {
        throw new Error('카카오 프로필 정보를 가져올 수 없습니다');
      }

      console.log('>> 카카오 소셜 로그인 성공!');

      const providerId = String(profile.id);
      const userName =
        profile.nickname ||
        profile.kakao_account?.profile?.nickname ||
        `카카오사용자_${profile.id}`;
      const userEmail = profile.kakao_account?.email;
      const profileImageUrl = profile.kakao_account?.profile?.profile_image_url;

      console.log('>> 카카오 사용자 정보:');
      console.log(`   - Provider ID: ${providerId}`);
      console.log(`   - 이름: ${userName}`);
      console.log(`   - 이메일: ${userEmail || '미제공'}`);
      console.log(`   - 프로필 이미지: ${profileImageUrl || '미제공'}`);

      // [API] 백엔드 로그인 요청 데이터 로깅
      logBackendLoginRequest('KAKAO', token.accessToken, providerId);

      // 사용자 정보 저장 및 화면 이동
      await saveUserDataAndNavigate(
        'KAKAO',
        providerId,
        userName,
        userEmail,
        profileImageUrl,
      );

      // 저장 후 현재 토큰 상태 확인
      setTimeout(() => {
        logCurrentTokens();
      }, 100);
    } catch (error) {
      console.error('>> 카카오 로그인 실패:', error);
      const message =
        error instanceof Error ? error.message : '카카오 로그인에 실패했습니다';
      showErrorAlert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleKakaoLogin}
      style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
      disabled={isLoading}
    >
      <Image
        source={require('../../assets/img/btn_login_kakao.png')}
        style={styles.image}
      />
    </TouchableOpacity>
  );
};

export default KakaoLoginButton;
