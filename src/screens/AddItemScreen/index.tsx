import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // 추가
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import { RootStackParamList } from '../../../App';
import { styles } from './styles';

type AddItemScreenRouteProp = RouteProp<RootStackParamList, 'AddItemScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>; // 추가

interface ItemFormData {
  name: string;
  quantity: string;
  unit: string;
  expiryDate: string;
  storageType: string;
  itemCategory: string;
  photo?: string;
}

const AddItemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>(); // 타입 지정
  const route = useRoute<AddItemScreenRouteProp>();

  // 네비게이션 파라미터에서 데이터 가져오기
  const { fridgeId, recognizedData } = route.params;

  // 폼 상태
  const [formData, setFormData] = useState<ItemFormData>({
    name: recognizedData?.name || '',
    quantity: recognizedData?.quantity || '1',
    unit: recognizedData?.unit || '개',
    expiryDate: recognizedData?.expiryDate || '',
    storageType: recognizedData?.storageType || '냉장',
    itemCategory: recognizedData?.itemCategory || '야채',
    photo: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);

  // 단위 옵션
  const units = ['개', 'kg', 'g', 'L', 'ml', '봉지', '포', '상자', '병'];
  const storageTypes = ['냉장', '냉동', '실온'];
  const categories = [
    '야채',
    '과일',
    '육류',
    '해산물',
    '유제품',
    '조미료',
    '기타',
  ];

  // 폼 업데이트
  const updateFormData = (field: keyof ItemFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 카메라로 재촬영
  const retakePhoto = () => {
    navigation.navigate('CameraScreen', { fridgeId });
  };

  // 식재료 등록
  const handleSaveItem = async () => {
    // 필수 필드 검증
    if (!formData.name.trim()) {
      Alert.alert('오류', '식재료 이름을 입력해주세요.');
      return;
    }
    if (!formData.quantity.trim()) {
      Alert.alert('오류', '수량을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: 백엔드 API 호출
      // const response = await api.addFridgeItem({
      //   fridgeId,
      //   ...formData,
      //   quantity: parseFloat(formData.quantity),
      // });

      // 임시 성공 처리
      await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션

      Alert.alert('성공', '식재료가 등록되었습니다!', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('식재료 등록 실패:', error);
      Alert.alert('오류', '식재료 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>

        <CustomText style={styles.headerTitle}>식재료 등록</CustomText>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveItem}
          disabled={isLoading}
        >
          <CustomText style={styles.saveButtonText}>
            {isLoading ? '등록 중...' : '등록'}
          </CustomText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 사진 미리보기 */}
        {recognizedData?.photo && (
          <View style={styles.photoSection}>
            <Image
              source={{ uri: recognizedData.photo }}
              style={styles.photoPreview}
            />
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <MaterialIcons name="camera-alt" size={16} color="#666" />
              <CustomText style={styles.retakeButtonText}>다시 촬영</CustomText>
            </TouchableOpacity>
          </View>
        )}

        {/* 식재료 이름 */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>식재료 이름 *</CustomText>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={text => updateFormData('name', text)}
            placeholder="예: 양배추, 당근, 우유"
            placeholderTextColor="#999"
          />
        </View>

        {/* 수량 및 단위 */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>수량 및 단위 *</CustomText>
          <View style={styles.quantityContainer}>
            <TextInput
              style={styles.quantityInput}
              value={formData.quantity}
              onChangeText={text => updateFormData('quantity', text)}
              placeholder="수량"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.unitScrollView}
            >
              {units.map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitOption,
                    formData.unit === unit && styles.unitOptionSelected,
                  ]}
                  onPress={() => updateFormData('unit', unit)}
                >
                  <CustomText
                    style={[
                      styles.unitOptionText,
                      formData.unit === unit && styles.unitOptionTextSelected,
                    ]}
                  >
                    {unit}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* 유통기한 */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>유통기한</CustomText>
          <TextInput
            style={styles.textInput}
            value={formData.expiryDate}
            onChangeText={text => updateFormData('expiryDate', text)}
            placeholder="예: 2025-12-31 또는 12월 31일"
            placeholderTextColor="#999"
          />
        </View>

        {/* 보관 방법 */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>보관 방법</CustomText>
          <View style={styles.optionRow}>
            {storageTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  formData.storageType === type && styles.optionButtonSelected,
                ]}
                onPress={() => updateFormData('storageType', type)}
              >
                <CustomText
                  style={[
                    styles.optionButtonText,
                    formData.storageType === type &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  {type}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 카테고리 */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>카테고리</CustomText>
          <View style={styles.categoryGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryOption,
                  formData.itemCategory === category &&
                    styles.categoryOptionSelected,
                ]}
                onPress={() => updateFormData('itemCategory', category)}
              >
                <CustomText
                  style={[
                    styles.categoryOptionText,
                    formData.itemCategory === category &&
                      styles.categoryOptionTextSelected,
                  ]}
                >
                  {category}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddItemScreen;
