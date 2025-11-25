import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import {
  loginWithKakaoAccount,
  getProfile as getKakaoProfile,
} from '@react-native-seoul/kakao-login';
import { socialLoginButtonStyles as styles } from './styles';
import type { SocialProvider, KakaoProfile, KakaoToken } from '../../types';

interface KakaoLoginButtonProps {
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

const KakaoLoginButton: React.FC<KakaoLoginButtonProps> = ({
  isLoading,
  setIsLoading,
  handleSocialLoginWithAPI,
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

      const providerId = String(profile.id);
      const userName =
        profile.nickname ||
        profile.kakao_account?.profile?.nickname ||
        `카카오사용자_${profile.id}`;
      const userEmail = profile.kakao_account?.email;
      const profileImageUrl = profile.kakao_account?.profile?.profile_image_url;

      // API 호출로 변경
      await handleSocialLoginWithAPI('KAKAO', token.accessToken, {
        providerId,
        name: userName,
        email: userEmail,
        profileImage: profileImageUrl,
      });
    } catch (error) {
      // console.error('카카오 로그인 실패:', error);
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
      style={[styles.loginButton, isLoading && styles.loadingLoginButton]}
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
