import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import {
  loginWithKakaoAccount,
  getProfile as getKakaoProfile,
} from '@react-native-seoul/kakao-login';
import styles from './styles';
// import axios from 'axios';

type Props = {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  saveUserIdAndNavigate: (id: string) => Promise<void>;
  showErrorAlert: (msg: string) => void;
};

// 카카오 프로필 타입 정의
export type KakaoProfile = {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
    };
  };
};

const KakaoLoginButton = ({
  isLoading,
  setIsLoading,
  saveUserIdAndNavigate,
  showErrorAlert,
}: Props) => {
  const handleKakaoLogin = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      // 웹 브라우저로 카카오 로그인
      const token = await loginWithKakaoAccount(); // 변경된 부분
      const profile: KakaoProfile = await getKakaoProfile();

      if (!token?.accessToken) {
        throw new Error('카카오 토큰을 가져올 수 없습니다');
      }
      if (!profile?.id) {
        throw new Error('카카오 프로필 정보를 가져올 수 없습니다');
      }

      await saveUserIdAndNavigate(String(profile.id));
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
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
