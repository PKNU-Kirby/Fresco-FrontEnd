import { useState } from 'react';
import { Alert } from 'react-native';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../services/AsyncStorageService';
import { User } from '../types/auth';

export const useFridgeSelect = (navigation: any) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fridges, setFridges] = useState<FridgeWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const initializeData = async () => {
    try {
      setLoading(true);

      const userId = await AsyncStorageService.getCurrentUserId();
      if (!userId) {
        navigation.replace('Login');
        return;
      }

      const user = await AsyncStorageService.getUserById(userId);
      if (!user) {
        navigation.replace('Login');
        return;
      }

      setCurrentUser(user);

      const userFridges = await AsyncStorageService.getUserRefrigerators(
        parseInt(userId, 10),
      );
      setFridges(userFridges);
    } catch (error) {
      console.error('Initialize data error:', error);
      Alert.alert('오류', '데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserFridges = async () => {
    if (!currentUser) return;

    try {
      const userFridges = await AsyncStorageService.getUserRefrigerators(
        parseInt(currentUser.id, 10),
      );
      setFridges(userFridges);
    } catch (error) {
      console.error('Load user fridges error:', error);
    }
  };

  return {
    currentUser,
    fridges,
    loading,
    initializeData,
    loadUserFridges,
  };
};
