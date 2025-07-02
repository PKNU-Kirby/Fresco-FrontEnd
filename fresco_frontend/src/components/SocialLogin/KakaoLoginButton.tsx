// 카카오 로그인 버튼 컴포넌트
// 1. 카카오 로그인 버튼을 렌더링
// 2. 로그인 시도, 프로필 정보 가져오기, 에러 처리 등

import React from 'react';
import {TouchableOpacity, Image} from 'react-native';
import {
  login as kakaoLogin,
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
      // token, ID 가져오기
      const token = await kakaoLogin();
      const profile: KakaoProfile = await getKakaoProfile();

      if (!token?.accessToken) {
        throw new Error('카카오 토큰을 가져올 수 없습니다');
      }
      if (!profile?.id) {
        throw new Error('카카오 프로필 정보를 가져올 수 없습니다');
      }

      // 백엔드에 토큰 전달
      /*
      await axios.post('https://your-backend-api.com/auth/kakao', {
        accessToken: token.accessToken,
      });
      */
      // 백엔드 API 호출을 생략 : 프로필 ID 바로 사용함
      // 실제로는 백엔드 API를 호출하여 사용자 정보를 저장하고,
      // 사용자 ID를 받아와야 함

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
      style={[styles.loginButton, isLoading && {opacity: 0.7}]}
      disabled={isLoading}>
      <Image
        source={require('../../assets/img/btn_login_kakao.png')}
        style={styles.image}
      />
    </TouchableOpacity>
  );
};

export default KakaoLoginButton;
