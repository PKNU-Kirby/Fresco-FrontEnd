import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';

// import axios from 'axios';

import CustomText from '../../components/common/CustomText';
import styles from './styles';
import FridgeTile, {Fridge} from '../../components/Fridge/FridgeTile';

const FridgeSelectScreen = () => {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleEditToggle = () => {
    setIsEditMode(prev => !prev);
  };
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    navigation.replace('Login');
  };

  // 냉장고 목록 불러오기
  // const fetchFridgeList = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem('accessToken');
  //     const res = await axios.get(
  //       'https://your-domain.com/api/v1/refrigerator',
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       },
  //     );
  //     const visibleFridges = res.data.data.filter((f: Fridge) => !f.isHidden);
  //     setFridges(visibleFridges);
  //   } catch (error) {
  //     console.error('냉장고 목록 불러오기 실패:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchFridgeList();
  // }, []);

  // Mock data 지정
  useEffect(() => {
    const mockData: Fridge[] = [
      {id: 1, name: '본가', isHidden: false},
      {id: 2, name: '자취방', isHidden: false},
      {id: 3, name: '냉동고', isHidden: true},
    ];
    const visible = mockData.filter(f => !f.isHidden);
    setFridges(visible);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerStyle}>
        <TouchableOpacity onPress={handleLogout}>
          <CustomText style={styles.logoutButton}>뒤로가기</CustomText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleEditToggle}>
          <CustomText style={styles.editButton}>
            {isEditMode ? '완료' : '편집'}
          </CustomText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={fridges}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <FridgeTile fridge={item} isEditMode={isEditMode} />
        )}
      />
    </SafeAreaView>
  );
};

export default FridgeSelectScreen;
