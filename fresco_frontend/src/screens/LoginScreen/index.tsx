import React from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
import CustomText from '../../components/common/CustomText';
import styles from './styles';

const LoginScreen = (): React.JSX.Element => {
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
            onPress={() => console.log('카카오 로그인')}
            style={styles.loginButton}>
            <Image
              source={require('../../assets/img/btn_login_kakao.png')}
              style={styles.image}
            />
          </TouchableOpacity>

          {/* 네이버 */}
          <TouchableOpacity
            onPress={() => console.log('네이버 로그인')}
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
