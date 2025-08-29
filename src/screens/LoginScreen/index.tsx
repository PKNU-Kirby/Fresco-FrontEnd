import React, { useState } from 'react';
import { View, Alert, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AsyncStorageService } from '../../services/AsyncStorageService';
import { DeepLinkHandler } from '../../utils/deepLinkHandler';
import type { RootStackParamList, SocialProvider } from '../../types/auth';
import KakaoLoginButton from '../../components/Login/KakaoLoginButton';
import NaverLoginButton from '../../components/Login/NaverLoginButton';
import styles from './styles';

const LoginScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const showErrorAlert = (message: string): void => {
    Alert.alert('로그인 실패', message, [{ text: '확인', style: 'default' }]);
  };

  // API를 통한 로그인 처리
  const handleSocialLoginWithAPI = async (
    provider: SocialProvider,
    socialAccessToken: string,
    userProfile: {
      providerId: string;
      name: string;
      email?: string;
      profileImage?: string;
    },
  ): Promise<void> => {
    setIsLoading(true);

    try {
      // API 호출
      const response = await fetch(`${Config.API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          accessToken: socialAccessToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.code === 'AUTH_OK_001') {
        // 서버 토큰 및 로그인 상태 저장
        await AsyncStorage.multiSet([
          ['accessToken', result.result.accessToken],
          ['refreshToken', result.result.refreshToken],
          ['isLoggedIn', 'true'],
          ['loginProvider', provider],
          ['lastLoginTime', new Date().toISOString()],
        ]);

        // 사용자 정보는 기존 방식으로 저장 (또는 서버에서 사용자 정보 API 추가 호출)
        const user = await AsyncStorageService.createUserFromLogin(
          provider,
          userProfile.providerId,
          userProfile.name,
          userProfile.email,
          userProfile.profileImage,
        );

        await AsyncStorageService.setCurrentUserId(user.id);
        await AsyncStorageService.initializeDefaultFridgeForUser(
          parseInt(user.id, 10),
        );

        // 대기 중인 초대 확인
        const pendingInvite = await DeepLinkHandler.getPendingInvite();

        if (pendingInvite) {
          navigation.replace('InviteConfirm', {
            token: pendingInvite.token,
            fridgeInfo: {
              name: pendingInvite.fridgeName || '냉장고',
              inviterName: pendingInvite.inviterName || '사용자',
              memberCount: pendingInvite.memberCount || 1,
            },
          });

          // 임시로 FridgeSelect로 이동
          navigation.replace('FridgeSelect');
        } else {
          navigation.replace('FridgeSelect');
        }
      } else {
        showErrorAlert(result.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 API 호출 실패:', error);
      showErrorAlert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <View style={styles.header}>
          <Text style={styles.headerText}>로그인</Text>
        </View>
        <View style={styles.buttonWrapper}>
          <KakaoLoginButton
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            handleSocialLoginWithAPI={handleSocialLoginWithAPI}
            showErrorAlert={showErrorAlert}
          />
          <NaverLoginButton
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            handleSocialLoginWithAPI={handleSocialLoginWithAPI}
            showErrorAlert={showErrorAlert}
          />
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
