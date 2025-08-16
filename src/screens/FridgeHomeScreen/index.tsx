import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { styles } from './styles';

// Components
import FridgeHeader from './FridgeHeader';
import FilterBar from './FilterBar';
import FridgeItemList from './FridgeItemList';
import StorageTypeModal from '../../components/modals/StorageTypeModal';
import ItemCategoryModal from '../../components/modals/ItemCategoryModal';
import AddItemModal from '../../components/modals/AddItemModal';

// Hooks
import { useFridgeData } from '../../hooks/useFridgeData';
import { useFilterState } from '../../hooks/useFilterState';
import { useModalState } from '../../hooks/useModalState';

// Storage utilities
import {
  getFridgeItemsByFridgeId,
  deleteItemFromFridge,
  updateFridgeItem,
  type FridgeItem,
} from '../../utils/fridgeStorage';

type Props = {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
      shouldRefresh?: boolean;
    };
  };
};

const FridgeHomeScreen = ({ route }: Props) => {
  const { fridgeId, fridgeName, shouldRefresh } = route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Local state for actual fridge items
  const [actualFridgeItems, setActualFridgeItems] = useState<FridgeItem[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  // hooks
  const {
    // fridgeItems,
    storageTypes,
    setStorageTypes,
    itemCategories,
    setItemCategories,
    // deleteItem,
    // updateItemQuantity,
    // updateItemUnit,
    // updateItemExpiryDate,
    // refreshData,
  } = useFridgeData(fridgeId);

  const {
    activeStorageType,
    setActiveStorageType,
    activeItemCategory,
    setActiveItemCategory,
    isListEditMode,
    toggleEditMode,
    filteredItems,
  } = useFilterState(actualFridgeItems);

  const {
    isStorageModalVisible,
    isItemCategoryModalVisible,
    openStorageModal,
    closeStorageModal,
    openItemCategoryModal,
    closeItemCategoryModal,
  } = useModalState();

  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);

  // 실제 냉장고 아이템 로드
  const loadActualFridgeItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await getFridgeItemsByFridgeId(fridgeId);
      setActualFridgeItems(items);
      console.log(`냉장고 ${fridgeId}의 실제 아이템들:`, items);
    } catch (error) {
      console.error('냉장고 아이템 로드 실패:', error);
      Alert.alert('오류', '냉장고 아이템을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [fridgeId]);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      loadActualFridgeItems();
    }, [loadActualFridgeItems]),
  );

  // shouldRefresh 파라미터가 있을 때 추가 새로고침
  useEffect(() => {
    if (shouldRefresh) {
      loadActualFridgeItems();
      // 파라미터 초기화 (무한 새로고침 방지)
      navigation.setParams({ shouldRefresh: false });
    }
  }, [shouldRefresh, loadActualFridgeItems, navigation]);

  // Event handlers
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSettingsPress = () => {
    navigation.navigate('FridgeSettings', {
      fridgeId,
      fridgeName,
      userRole: 'member',
    });
  };

  const handleAddItem = () => {
    setIsAddItemModalVisible(true);
  };

  const handleDirectAdd = () => {
    setIsAddItemModalVisible(false);
    navigation.navigate('AddItemScreen', {
      fridgeId,
    });
  };

  const handleCameraAdd = () => {
    setIsAddItemModalVisible(false);
    navigation.navigate('CameraScreen', {
      fridgeId,
    });
  };

  // 실제 데이터 업데이트 핸들러들
  const handleQuantityChange = useCallback(
    async (itemId: number, newQuantity: string) => {
      try {
        await updateFridgeItem(itemId, { quantity: newQuantity });
        await loadActualFridgeItems(); // 업데이트 후 새로고침
      } catch (error) {
        console.error('수량 업데이트 실패:', error);
        Alert.alert('오류', '수량 변경에 실패했습니다.');
      }
    },
    [loadActualFridgeItems],
  );

  const handleUnitChange = useCallback(
    async (itemId: number, newUnit: string) => {
      try {
        await updateFridgeItem(itemId, { unit: newUnit });
        await loadActualFridgeItems();
      } catch (error) {
        console.error('단위 업데이트 실패:', error);
        Alert.alert('오류', '단위 변경에 실패했습니다.');
      }
    },
    [loadActualFridgeItems],
  );

  const handleExpiryDateChange = useCallback(
    async (itemId: number, newDate: string) => {
      try {
        await updateFridgeItem(itemId, { expiryDate: newDate });
        await loadActualFridgeItems();
      } catch (error) {
        console.error('만료일 업데이트 실패:', error);
        Alert.alert('오류', '만료일 변경에 실패했습니다.');
      }
    },
    [loadActualFridgeItems],
  );

  const handleDeleteItem = useCallback(
    async (itemId: number) => {
      try {
        await deleteItemFromFridge(itemId);
        await loadActualFridgeItems(); // 삭제 후 새로고침
        Alert.alert('완료', '아이템이 삭제되었습니다.');
      } catch (error) {
        console.error('아이템 삭제 실패:', error);
        Alert.alert('오류', '아이템 삭제에 실패했습니다.');
      }
    },
    [loadActualFridgeItems],
  );

  const handleStorageTypeSelect = (storageType: string) => {
    setActiveStorageType(storageType);
  };

  const handleItemCategorySelect = (category: string) => {
    setActiveItemCategory(category);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <FridgeHeader
        fridgeName={fridgeName}
        onBackPress={handleBackPress}
        onSettingsPress={handleSettingsPress}
      />

      {/* 필터 바 */}
      <FilterBar
        activeStorageType={activeStorageType}
        activeItemCategory={activeItemCategory}
        isListEditMode={isListEditMode}
        onStorageTypePress={openStorageModal}
        onItemCategoryPress={openItemCategoryModal}
        onEditModeToggle={toggleEditMode}
      />

      {/* 메인 콘텐츠 영역 */}
      <View style={styles.mainContent}>
        <FridgeItemList
          items={filteredItems}
          isEditMode={isListEditMode}
          onAddItem={handleAddItem}
          onQuantityChange={handleQuantityChange}
          onUnitChange={handleUnitChange}
          onExpiryDateChange={handleExpiryDateChange}
          onDeleteItem={handleDeleteItem}
        />
      </View>

      {/* 보관 분류 선택 모달 */}
      <StorageTypeModal
        visible={isStorageModalVisible}
        storageTypes={storageTypes}
        activeStorageType={activeStorageType}
        onClose={closeStorageModal}
        onSelect={handleStorageTypeSelect}
        onUpdateStorageTypes={setStorageTypes}
      />

      {/* 식재료 유형 선택 모달 */}
      <ItemCategoryModal
        visible={isItemCategoryModalVisible}
        itemCategories={itemCategories}
        activeItemCategory={activeItemCategory}
        onClose={closeItemCategoryModal}
        onSelect={handleItemCategorySelect}
        onUpdateCategories={setItemCategories}
      />

      {/* 식재료 추가 방법 선택 모달 */}
      <AddItemModal
        visible={isAddItemModalVisible}
        onClose={() => setIsAddItemModalVisible(false)}
        onDirectAdd={handleDirectAdd}
        onCameraAdd={handleCameraAdd}
      />
    </SafeAreaView>
  );
};

export default FridgeHomeScreen;
