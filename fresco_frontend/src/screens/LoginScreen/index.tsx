import React, {useState} from 'react';
import {View} from 'react-native';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import CustomText from '../../components/common/CustomText';
import KakaoLoginButton from '../../components/SocialLogin/KakaoLoginButton';
import NaverLoginButton from '../../components/SocialLogin/NaverLoginButton';
import styles from './styles';
import {RootStackParamList} from '../../../App';

const LoginScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);

  const saveUserIdAndNavigate = async (userId: string) => {
    try {
      await AsyncStorage.setItem('userId', userId);
      navigation.replace('FridgeSelect');
    } catch (error) {
      console.error('사용자 ID 저장 실패:', error);
      Alert.alert('오류', '로그인 정보 저장에 실패했습니다.');
    }
  };

  const showErrorAlert = (message: string) => {
    Alert.alert('로그인 실패', message, [{text: '확인', style: 'default'}]);
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
            saveUserIdAndNavigate={saveUserIdAndNavigate}
            showErrorAlert={showErrorAlert}
          />
          <NaverLoginButton
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            saveUserIdAndNavigate={saveUserIdAndNavigate}
            showErrorAlert={showErrorAlert}
          />
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
