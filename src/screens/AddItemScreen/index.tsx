// screens/AddItemScreen/index.tsx
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import BackButton from '../../components/common/BackButton';
import AddItemCard from './AddItemCard';
import { RootStackParamList } from '../../../App';
import { addItemStyles as styles } from './styles';
import {
  addItemsToFridge,
  getDefaultExpiryDate,
} from '../../utils/fridgeStorage';

// Types
type AddItemScreenRouteProp = RouteProp<RootStackParamList, 'AddItemScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface ItemFormData {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expirationDate: string;
  storageType: string;
  itemCategory: string;
  photo?: string;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const AddItemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddItemScreenRouteProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { fridgeId, recognizedData } = route.params;

  // State
  const [isEditMode, setIsEditMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ItemFormData[]>([
    {
      id: '1',
      name: recognizedData?.name || '',
      quantity: recognizedData?.quantity || '1',
      unit: recognizedData?.unit || '개',
      expirationDate: recognizedData?.expiryDate || '',
      storageType: recognizedData?.storageType || '냉장',
      itemCategory: recognizedData?.itemCategory || '야채',
      photo: recognizedData?.photo,
    },
  ]);

  // Generate unique ID
  const generateId = useCallback((): string => {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  // Create new item
  const createNewItem = useCallback(
    (): ItemFormData => ({
      id: generateId(),
      name: '',
      quantity: '1',
      unit: '개',
      expirationDate: '',
      storageType: '냉장',
      itemCategory: '야채',
    }),
    [generateId],
  );

  // Add new item
  const addNewItem = useCallback(() => {
    const newItem = createNewItem();
    setItems(prev => [newItem, ...prev]);
    setFocusedItemId(newItem.id);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 50);
  }, [createNewItem]);

  // Remove item
  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Update item
  const updateItem = useCallback(
    (itemId: string, field: keyof ItemFormData, value: string) => {
      setItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, [field]: value } : item,
        ),
      );
    },
    [],
  );

  // Validation
  const validateItem = useCallback((item: ItemFormData): ValidationResult => {
    if (!item.name.trim()) {
      return { isValid: false, message: '식재료 이름을 입력해주세요.' };
    }

    if (!item.quantity.trim()) {
      return { isValid: false, message: '수량을 입력해주세요.' };
    }

    const quantity = parseInt(item.quantity, 10);

    if (isNaN(quantity) || quantity < 1) {
      return { isValid: false, message: '올바른 수량을 입력해주세요.' };
    }

    if (quantity > 9999) {
      return { isValid: false, message: '수량은 9999개를 초과할 수 없습니다.' };
    }

    return { isValid: true };
  }, []);

  const validateAllItems = useCallback((): ValidationResult => {
    for (const item of items) {
      const result = validateItem(item);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  }, [items, validateItem]);

  const handleSaveItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const itemsToSave = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || '개',
        expiryDate:
          item.expirationDate || getDefaultExpiryDate(item.itemCategory),
        storageType: item.storageType,
        itemCategory: item.itemCategory,
        imageUri: item.photo,
        fridgeId: fridgeId,
      }));

      const savedItems = await addItemsToFridge(fridgeId, itemsToSave);

      console.log('저장된 아이템들:', savedItems);

      Alert.alert(
        `${savedItems.length}개의 식재료가 냉장고에 추가되었습니다.`,
        ``,
        [
          {
            text: '확인',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'MainTabs',
                    params: {
                      fridgeId: fridgeId,
                      fridgeName: '내 냉장고',
                    },
                  },
                ],
              });
            },
          },
        ],
      );
    } catch (error) {
      console.error('저장 실패:', error);
      Alert.alert('저장 실패', '식재료 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [items, fridgeId, navigation]);

  const handleFinalConfirm = useCallback(() => {
    const validation = validateAllItems();
    if (!validation.isValid) {
      Alert.alert('입력 오류', validation.message);
      return;
    }

    const itemCount = items.length;
    const itemText = itemCount === 1 ? '식재료' : `식재료 ${itemCount}개`;
    Alert.alert(`${itemText}를 냉장고에 추가합니다.`, ``, [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: handleSaveItems },
    ]);
  }, [validateAllItems, items.length, handleSaveItems]);

  // Edit mode handlers
  const handleEditComplete = useCallback(() => {
    const validation = validateAllItems();
    if (!validation.isValid) {
      Alert.alert('입력 오류', validation.message);
      return;
    }
    setIsEditMode(false);
  }, [validateAllItems]);

  const handleBackToEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    if (isEditMode) {
      Alert.alert('', '작성 중인 내용이 삭제됩니다.', [
        { text: '계속 작성', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      handleBackToEdit();
    }
  }, [isEditMode, navigation, handleBackToEdit]);

  // Computed values
  const headerButtonText = useMemo(() => {
    if (isLoading) return '저장 중...';
    if (isEditMode) return '완료';
    return '확인';
  }, [isLoading, isEditMode]);

  const isHeaderButtonDisabled = useMemo(() => {
    return isLoading || items.some(item => !item.name.trim());
  }, [isLoading, items]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backbutton}>
            <BackButton onPress={handleGoBack} />
          </View>
          <CustomText style={styles.headerTitle}>식재료 추가</CustomText>
          <TouchableOpacity
            style={[
              styles.headerButton,
              isHeaderButtonDisabled && styles.headerButtonDisabled,
            ]}
            onPress={isEditMode ? handleEditComplete : handleFinalConfirm}
            disabled={isHeaderButtonDisabled}
            accessibilityLabel={headerButtonText}
            accessibilityRole="button"
          >
            <CustomText style={styles.headerButtonText}>
              {headerButtonText}
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content Area */}
        <View style={styles.contentContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              !isEditMode && styles.scrollContentWithOverlay,
              isEditMode && styles.scrollContentWithOverlayEditMode,
            ]}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
          >
            {/* Item Cards */}
            {items.map((item, index) => (
              <AddItemCard
                key={item.id}
                item={item}
                index={index}
                isEditMode={isEditMode}
                showDeleteButton={true}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                focusedItemId={focusedItemId}
                onFocusComplete={() => setFocusedItemId(null)}
              />
            ))}

            {/* 하단 여백 */}
            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Add Item Button (Edit Mode Only) */}
          {isEditMode && (
            <>
              <View style={styles.addButtonContainer}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addNewItem}
                  accessibilityLabel="새 식재료 추가"
                  accessibilityRole="button"
                >
                  <MaterialIcons name="add" size={24} color="#f8f8f8" />
                  <CustomText style={styles.addButtonText}>
                    식재료 추가
                  </CustomText>
                </TouchableOpacity>
              </View>
            </>
          )}
          {/* Edit Button (Confirmation Mode Only) */}
          {!isEditMode && (
            <>
              <View style={styles.editModeContainer}>
                <TouchableOpacity
                  style={styles.backToEditButton}
                  onPress={handleBackToEdit}
                  accessibilityLabel="수정하기"
                  accessibilityRole="button"
                >
                  <MaterialIcons name="edit" size={20} color="#f8f8f8" />
                  <CustomText style={styles.backToEditButtonText}>
                    수정하기
                  </CustomText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.fixedBottomSection}>
          {/* Summary (Confirmation Mode Only) */}
          {!isEditMode && (
            <>
              <View style={styles.summaryContainer}>
                <CustomText style={styles.summaryTitle}>
                  추가할 식재료 요약
                </CustomText>
                <CustomText style={styles.summaryText}>
                  총 {items.length}개의 식재료가 추가됩니다.
                </CustomText>
              </View>
              <View style={styles.bottomBlurSection}>
                <></>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddItemScreen;
