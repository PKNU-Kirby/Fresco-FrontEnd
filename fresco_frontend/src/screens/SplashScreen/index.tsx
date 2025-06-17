import React, {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';

const SplashScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          navigation.replace('FridgeSelect');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.warn('로그인 상태 확인 실패:', error);
        navigation.replace('Login');
      }
    };

    checkLoginStatus();
  }, [navigation]);

  return (
    <View>
      <ActivityIndicator size="large" color="#aaa" />
    </View>
  );
};

export default SplashScreen;
