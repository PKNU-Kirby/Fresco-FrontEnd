import React from 'react';
import {View, TouchableOpacity, Image, Alert} from 'react-native';
import {login, getProfile} from '@react-native-seoul/kakao-login';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../../App';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import axios from 'axios';
import CustomText from '../../components/common/CustomText';
import styles from './styles';

const LoginScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // const API_BASE_URL = 'https://your-api-server.com';

  const handleKakaoLogin = async () => {
    try {
      const token = await login();
      console.log('로그인 성공:', token.accessToken);

      const profile = await getProfile();
      console.log('사용자 정보:', profile);

      /* 백엔드 호출
      const response = await axios.post(`${API_BASE_URL}/auth/kakao`, {
        provider: 'KAKAO',
        providerId: profile.id,
        name: profile.nickname,
        fcmToken: '',
      });

      console.log('로그인 성공, 백엔드 응답:', response.data);
      
      */
      // ->  성공했다 치고??

      // 로그인 성공 -> 다음 화면 이동
      console.log('로그인 성공', `환영합니다, ${profile.nickname}님!`);

      navigation.replace('FridgeSelect');
    } catch (error: any) {
      console.warn('카카오 로그인 실패:', error);
      console.log('로그인 실패', '카카오 로그인 중 문제가 발생했습니다.');
    }
  };

  const handleNaverLogin = async () => {
    try {
      // 추후 구현 예정
    } catch (error) {
      console.warn('네이버 로그인 실패: ', error);
    }
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
          {/* 카카오 */}
          <TouchableOpacity
            onPress={handleKakaoLogin}
            style={styles.loginButton}>
            <Image
              source={require('../../assets/img/btn_login_kakao.png')}
              style={styles.image}
            />
          </TouchableOpacity>

          {/* 네이버 */}
          <TouchableOpacity
            onPress={handleNaverLogin}
            style={styles.loginButton}>
            <Image
              source={require('../../assets/img/btn_login_naver.png')}
              style={styles.image}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
