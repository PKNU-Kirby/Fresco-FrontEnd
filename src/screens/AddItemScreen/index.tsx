import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import BackButton from '../../components/common/BackButton';
import AddItemCard from './AddItemCard';
import { RootStackParamList } from '../../../App';
import { styles } from './styles';

type AddItemScreenRouteProp = RouteProp<RootStackParamList, 'AddItemScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface ItemFormData {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiryDate: string;
  storageType: string;
  itemCategory: string;
  photo?: string;
}

const AddItemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddItemScreenRouteProp>();

  const { fridgeId, recognizedData } = route.params;

  // 편집 모드 상태
  const [isEditMode, setIsEditMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 아이템 목록 상태
  const [items, setItems] = useState<ItemFormData[]>([
    {
      id: '1',
      name: recognizedData?.name || '',
      quantity: recognizedData?.quantity || '1',
      unit: recognizedData?.unit || '개',
      expiryDate: recognizedData?.expiryDate || '',
      storageType: recognizedData?.storageType || '냉장',
      itemCategory: recognizedData?.itemCategory || '야채',
      photo: recognizedData?.photo,
    },
  ]);

  // 새 아이템 추가
  const addNewItem = () => {
    const newItem: ItemFormData = {
      id: Date.now().toString(),
      name: '',
      quantity: '1',
      unit: '개',
      expiryDate: '',
      storageType: '냉장',
      itemCategory: '야채',
    };
    setItems(prev => [...prev, newItem]);
  };

  // 아이템 삭제
  const removeItem = (itemId: string) => {
    if (items.length === 1) {
      Alert.alert('알림', '최소 하나의 식재료는 있어야 합니다.');
      return;
    }
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // 아이템 정보 업데이트
  const updateItem = (
    itemId: string,
    field: keyof ItemFormData,
    value: string,
  ) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  };

  // 유효성 검사
  const validateItems = (): boolean => {
    for (const item of items) {
      if (!item.name.trim()) {
        Alert.alert('오류', '모든 식재료의 이름을 입력해주세요.');
        return false;
      }
      if (!item.quantity.trim() || parseInt(item.quantity) < 1) {
        Alert.alert('오류', '모든 식재료의 수량을 올바르게 입력해주세요.');
        return false;
      }
    }
    return true;
  };

  // 편집 완료 버튼
  const handleEditComplete = () => {
    if (!validateItems()) return;
    setIsEditMode(false);
  };

  // 최종 확인 및 저장
  const handleFinalConfirm = () => {
    Alert.alert('확인', '식재료를 냉장고에 추가합니다.', [
      {
        text: '다시 확인하기',
        style: 'cancel',
      },
      {
        text: '확인',
        onPress: handleSaveItems,
      },
    ]);
  };

  // 백엔드로 데이터 전송
  const handleSaveItems = async () => {
    setIsLoading(true);

    try {
      // TODO: 백엔드 API 호출
      console.log('저장할 아이템들:', items);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // AsyncStorage에서 냉장고 이름 가져오기
      const fridgeName =
        (await AsyncStorage.getItem('currentFridgeName')) || '내 냉장고';

      // FridgeHome으로 직접 이동 (MainTabs의 첫 번째 탭)
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: {
              fridgeId,
              fridgeName,
            },
          },
        ],
      });
    } catch (error) {
      console.error('식재료 저장 실패:', error);
      Alert.alert('오류', '식재료 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 편집 모드로 돌아가기
  const handleBackToEdit = () => {
    setIsEditMode(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <CustomText style={styles.backbutton}>
          <BackButton onPress={() => navigation.goBack()} />
        </CustomText>
        <CustomText style={styles.headerTitle}>식재료 추가</CustomText>

        <TouchableOpacity
          style={[
            styles.headerButton,
            isLoading && styles.headerButtonDisabled,
          ]}
          onPress={isEditMode ? handleEditComplete : handleFinalConfirm}
          disabled={isLoading}
        >
          <CustomText style={styles.headerButtonText}>
            {isLoading
              ? '저장 중...'
              : isEditMode
              ? '식재료 추가하기'
              : '확인 완료'}
          </CustomText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 아이템 카드 목록 */}
        {items.map((item, index) => (
          <AddItemCard
            key={item.id}
            item={item}
            isEditMode={isEditMode}
            showDeleteButton={items.length > 1}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        ))}

        {/* 아이템 추가 버튼 (편집 모드일 때만) */}
        {isEditMode && (
          <View style={styles.addButtonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={addNewItem}>
              <MaterialIcons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* 확인 모드일 때 편집 버튼 */}
        {!isEditMode && (
          <View style={styles.editModeContainer}>
            <TouchableOpacity
              style={styles.backToEditButton}
              onPress={handleBackToEdit}
            >
              <CustomText style={styles.backToEditButtonText}>
                수정하기
              </CustomText>
            </TouchableOpacity>
          </View>
        )}

        {/* 하단 여백 */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddItemScreen;
