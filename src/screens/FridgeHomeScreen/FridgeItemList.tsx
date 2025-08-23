import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { KeyboardAvoidingView, Platform } from 'react-native';
import FridgeItemCard from './FridgeItemCard';
import AddButton from './ItemAddButton';
import FilterBar from './FilterBar';
import { getFridgeItemsByFridgeId } from '../../utils/fridgeStorage';
import { listStyles as styles } from './listStyles';

type FridgeItem = {
  id: string;
  fridgeId: string;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  itemCategory: string;
  unit?: string;
};

type FridgeItemListProps = {
  items: FridgeItem[];
  isEditMode: boolean;
  onAddItem: () => void;
  onItemPress?: (item: FridgeItem) => void;
  onQuantityChange?: (itemId: string, newQuantity: string) => void;
  onUnitChange?: (itemId: string, newUnit: string) => void;
  onExpiryDateChange?: (itemId: string, newDate: string) => void;
  onDeleteItem?: (itemId: string) => void;
  // FilterBar props
  activeItemCategory: string;
  onItemCategoryPress: () => void;
  onEditModeToggle: () => void;
};

const FridgeItemList: React.FC<FridgeItemListProps> = ({
  items,
  isEditMode,
  onAddItem,
  onItemPress,
  onQuantityChange,
  onUnitChange,
  onExpiryDateChange,
  onDeleteItem,
  // FilterBar props
  activeItemCategory,
  onItemCategoryPress,
  onEditModeToggle,
}) => {
  const renderItem = ({ item }: { item: FridgeItem }) => (
    <FridgeItemCard
      item={item}
      isEditMode={isEditMode}
      onPress={() => onItemPress?.(item)}
      onQuantityChange={onQuantityChange}
      onUnitChange={onUnitChange}
      onExpiryDateChange={onExpiryDateChange}
      onDeleteItem={onDeleteItem}
    />
  );

  const [_testItems, setTestItems] = useState<FridgeItem[]>([]);

  useEffect(() => {
    const loadTestData = async () => {
      if (items.length > 0) {
        const fridgeId = items[0].fridgeId;
        const loadedItems = await getFridgeItemsByFridgeId(fridgeId);
        setTestItems(loadedItems);
      }
    };
    loadTestData();
  }, [items]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* FilterBar */}
        <>
          <FilterBar
            activeItemCategory={activeItemCategory}
            isListEditMode={isEditMode}
            onItemCategoryPress={onItemCategoryPress}
            onEditModeToggle={onEditModeToggle}
          />
        </>
        <DraggableFlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        <AddButton onPress={onAddItem} visible={!isEditMode} />
      </KeyboardAvoidingView>
    </View>
  );
};

export default FridgeItemList;
