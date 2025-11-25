import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { AsyncStorageService } from '../../services/AsyncStorageService';

const SplashScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const splashTimer = new Promise(resolve => setTimeout(resolve, 1500));

      const currentUserId = await AsyncStorageService.getCurrentUserId();

      await splashTimer;

      if (currentUserId) {
        const user = await AsyncStorageService.getUserById(currentUserId);

        if (user) {
          // console.log(`기존 사용자 로그인: ${user.name} (ID: ${user.id})`);

          await AsyncStorageService.initializeDefaultFridgeForUser(
            currentUserId,
          );

          navigation.replace('FridgeSelect');
        } else {
          // console.log('사용자 정보가 없습니다. 로그인 화면으로 이동');
          await AsyncStorageService.clearCurrentUser();
          navigation.replace('Login');
        }
      } else {
        // console.log('로그인된 사용자가 없습니다. 로그인 화면으로 이동');
        navigation.replace('Login');
      }
    } catch (error) {
      // console.error('인증 상태 확인 실패:', error);
      navigation.replace('Login');
    }
  };
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/img/Fresby-ver1.png')}
        style={styles.fresby}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#444" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
  },
  fresby: {
    width: 135,
    height: 135,
  },
  loader: {
    paddingTop: 60,
  },
});

export default SplashScreen;
