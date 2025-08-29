import React, { useState } from 'react';
import { View, Alert, Text } from 'react-native';
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

  // AsyncStorage 로그인
  const saveUserDataAndNavigate = async (
    provider: SocialProvider,
    providerId: string,
    name: string,
    email?: string,
    profileImage?: string,
  ): Promise<void> => {
    try {
      setIsLoading(true);

      // 사용자 생성/업데이트
      const user = await AsyncStorageService.createUserFromLogin(
        provider,
        providerId,
        name,
        email,
        profileImage,
      );

      // 현재 사용자로 설정
      await AsyncStorageService.setCurrentUserId(user.id);

      // 사용자의 기본 냉장고 초기화 : 최초 로그인
      await AsyncStorageService.initializeDefaultFridgeForUser(
        parseInt(user.id, 10),
      );

      // 대기 중인 초대가 있는지 확인
      const pendingInvite = await DeepLinkHandler.getPendingInvite();

      if (pendingInvite) {
        // 초대 확인 화면으로 이동
        navigation.navigate('InviteConfirm', {
          token: pendingInvite.token,
          fridgeInfo: {
            name: pendingInvite.fridgeName || '냉장고',
            inviterName: pendingInvite.inviterName || '사용자',
            memberCount: pendingInvite.memberCount || 1,
          },
        });
      } else {
        // 일반적인 냉장고 선택 화면으로 이동
        navigation.replace('FridgeSelect');
      }
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
      Alert.alert('오류', '로그인 정보 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const showErrorAlert = (message: string): void => {
    Alert.alert('로그인 실패', message, [{ text: '확인', style: 'default' }]);
  };

  // [API] 함수 (추후 사용)
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
      // TODO: API 연동시 주석 해제
      /*
      const response = await fetch('/api/v1/auth/login', {
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
        // 서버에서 받은 실제 사용자 ID와 토큰 저장
        const user = await AsyncStorageService.createUserFromLogin(
          provider,
          userProfile.providerId,
          userProfile.name,
          userProfile.email,
          userProfile.profileImage,
          result.result.user?.fcmToken
        );

        // 서버에서 받은 실제 사용자 ID로 업데이트
        await AsyncStorageService.setCurrentUserId(parseInt(result.result.userId));
        
        // 서버 토큰 저장
        await AsyncStorage.multiSet([
          ['accessToken', result.result.accessToken],
          ['refreshToken', result.result.refreshToken],
        ]);
        
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
        } else {
          navigation.replace('FridgeSelect');
        }
      } else {
        showErrorAlert(result.message || '로그인에 실패했습니다.');
      }
      */

      // 현재는 AsyncStorage 방식 사용
      await saveUserDataAndNavigate(
        provider,
        userProfile.providerId,
        userProfile.name,
        userProfile.email,
        userProfile.profileImage,
      );
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
            saveUserDataAndNavigate={saveUserDataAndNavigate}
            showErrorAlert={showErrorAlert}
          />
          <NaverLoginButton
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            saveUserDataAndNavigate={saveUserDataAndNavigate}
            showErrorAlert={showErrorAlert}
          />
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

/*
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
*/
