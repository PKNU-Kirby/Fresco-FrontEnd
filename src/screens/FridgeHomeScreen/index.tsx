import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

type Props = {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
    };
  };
};

const FridgeHomeScreen = ({ route }: Props) => {
  const { fridgeId, fridgeName } = route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Custom hooks
  const {
    fridgeItems,
    storageTypes,
    setStorageTypes,
    itemCategories,
    setItemCategories,
    deleteItem,
    updateItemQuantity,
    updateItemUnit,
    updateItemExpiryDate,
  } = useFridgeData(fridgeId);

  const {
    activeStorageType,
    setActiveStorageType,
    activeItemCategory,
    setActiveItemCategory,
    isListEditMode,
    toggleEditMode,
    filteredItems,
  } = useFilterState(fridgeItems);

  const {
    isStorageModalVisible,
    isItemCategoryModalVisible,
    openStorageModal,
    closeStorageModal,
    openItemCategoryModal,
    closeItemCategoryModal,
  } = useModalState();

  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);

  // Event handlers
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSettingsPress = () => {
    navigation.navigate('FridgeSettings', {
      fridgeId,
      fridgeName,
      // userRole: 'owner',
      userRole: 'member',
    });
  };

  const handleAddItem = () => {
    // + 버튼 클릭 시 모달 열기
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

  const handleQuantityChange = (itemId: number, newQuantity: string) => {
    updateItemQuantity(itemId, newQuantity);
  };

  const handleUnitChange = (itemId: number, newUnit: string) => {
    updateItemUnit(itemId, newUnit);
  };

  const handleExpiryDateChange = (itemId: number, newDate: string) => {
    updateItemExpiryDate(itemId, newDate);
  };

  const handleDeleteItem = (itemId: number) => {
    deleteItem(itemId);
  };

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
