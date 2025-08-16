import React, { useState } from 'react';
import { View } from 'react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomText from '../../components/common/CustomText';
import KakaoLoginButton from './KakaoLoginButton';
import NaverLoginButton from './NaverLoginButton';
import styles from './styles';

// 중앙 관리되는 타입들 import
import type { RootStackParamList, SocialProvider } from '../../types/auth';

const LoginScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // TODO: API 연동 시 사용할 함수 (현재는 주석 처리)
  /*
  const loginAPI = async (provider: SocialProvider, accessToken: string): Promise<LoginResponse> => {
    const requestData: LoginRequest = {
      provider,
      accessToken,
    };

    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const handleSocialLogin = async (
    provider: SocialProvider, 
    socialAccessToken: string, 
    userProfile: {
      providerId: string;
      name: string;
      email?: string;
      profileImage?: string;
    }
  ): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await loginAPI(provider, socialAccessToken);
      
      if (response.code === 'AUTH_OK_001') {
        // 서버에서 받은 토큰과 사용자 정보 저장
        await AsyncStorage.multiSet([
          ['accessToken', response.result.accessToken],
          ['refreshToken', response.result.refreshToken],
          ['userId', userProfile.providerId], // 서버에서 받은 실제 사용자 ID
          ['userName', userProfile.name],
          ['userProvider', provider],
          ...(userProfile.email ? [['userEmail', userProfile.email]] : []),
          ...(userProfile.profileImage ? [['userProfileImage', userProfile.profileImage]] : []),
        ]);
        
        navigation.replace('FridgeSelect');
      } else {
        showErrorAlert(response.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 API 호출 실패:', error);
      showErrorAlert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  */

  // 현재 사용 중인 함수 (AsyncStorage 테스트용)
  const saveUserDataAndNavigate = async (
    provider: SocialProvider,
    providerId: string, // 소셜 로그인에서 받은 고유 ID
    name: string,
    email?: string,
    profileImage?: string,
  ): Promise<void> => {
    try {
      // 기본 사용자 정보 배열
      const userDataArray: [string, string][] = [
        ['userId', providerId], // 현재는 providerId를 userId로 사용 (추후 서버에서 받은 실제 userId로 변경)
        ['userProvider', provider],
        ['userProviderId', providerId],
        ['userName', name],
      ];

      // optional 필드들 안전하게 추가
      if (email) {
        userDataArray.push(['userEmail', email]);
      }
      if (profileImage) {
        userDataArray.push(['userProfileImage', profileImage]);
      }

      // ERD에 맞춘 사용자 정보 저장
      await AsyncStorage.multiSet(userDataArray);

      // 테스트용 더미 토큰 저장
      const tokenArray: [string, string][] = [
        ['accessToken', `dummy_access_token_${providerId}`],
        ['refreshToken', `dummy_refresh_token_${providerId}`],
      ];
      await AsyncStorage.multiSet(tokenArray);

      console.log('✅ 사용자 정보 저장 완료:');
      console.log(`   - Provider: ${provider}`);
      console.log(`   - Provider ID: ${providerId}`);
      console.log(`   - 이름: ${name}`);
      console.log(`   - 이메일: ${email || '미제공'}`);

      navigation.replace('FridgeSelect');
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
      Alert.alert('오류', '로그인 정보 저장에 실패했습니다.');
    }
  };

  const showErrorAlert = (message: string): void => {
    Alert.alert('로그인 실패', message, [{ text: '확인', style: 'default' }]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <View style={styles.header}>
          <CustomText weight="bold" style={styles.headerText}>
            로그인
          </CustomText>
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
