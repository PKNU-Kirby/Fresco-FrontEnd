import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

const SplashScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');

        const [, _result] = await Promise.allSettled([
          new Promise(resolve => setTimeout(resolve, 1000)),
          Promise.resolve(userId),
        ]);

        if (userId) {
          navigation.replace('FridgeSelect');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
        navigation.replace('Login');
      }
    };

    checkLoginStatus();
  }, [navigation]);

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
