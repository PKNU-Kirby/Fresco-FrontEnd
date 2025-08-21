import React, { useState } from 'react';
import { View, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AsyncStorageService } from '../../services/AsyncStorageService';
import type { RootStackParamList, SocialProvider } from '../../types/auth';
import KakaoLoginButton from './KakaoLoginButton';
import NaverLoginButton from './NaverLoginButton';
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

      /*
      console.log('>> ERD 기반 사용자 정보 저장 완료:');
      console.log(`   - User ID: ${user.id}`);
      console.log(`   - Provider: ${provider}`);
      console.log(`   - Provider ID: ${providerId}`);
      console.log(`   - 이름: ${name}`);
      console.log(`   - 이메일: ${email || '미제공'}`);
      */
      navigation.replace('FridgeSelect');
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
        
        navigation.replace('FridgeSelect');
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
