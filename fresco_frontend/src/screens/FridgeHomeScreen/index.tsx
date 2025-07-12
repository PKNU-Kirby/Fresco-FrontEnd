import React from 'react';
import {SafeAreaView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';
import {styles} from './styles';

// Components
import FridgeHeader from '../../components/FridgeHome/FridgeHeader';
import FilterBar from '../../components/FridgeHome/FilterBar';
import FridgeItemList from '../../components/FridgeHome/FridgeItemList';
import StorageTypeModal from '../../components/modals/StorageTypeModal';
import ItemCategoryModal from '../../components/modals/ItemCategoryModal';

// Hooks
import {useFridgeData, FridgeItem} from '../../hooks/useFridgeData';
import {useFilterState} from '../../hooks/useFilterState';
import {useModalState} from '../../hooks/useModalState';

type Props = {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
    };
  };
};

const FridgeHomeScreen = ({route}: Props) => {
  const {fridgeId, fridgeName} = route.params;
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

  // Event handlers
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAccountPress = () => {
    // 구성원 관리 화면
    console.log('구성원 관리 화면으로 이동');
  };

  const handleAddItem = () => {
    // 식재료 추가 화면
    console.log('식재료 추가 화면으로 이동');
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
        onAccountPress={handleAccountPress}
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
    </SafeAreaView>
  );
};

export default FridgeHomeScreen;
