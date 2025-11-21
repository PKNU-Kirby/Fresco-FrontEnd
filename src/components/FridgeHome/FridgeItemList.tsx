import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import FilterBar from './FilterBar';
import ItemAddButton from './ItemAddButton';
import FridgeItemCard from './FridgeItemCard';
import { getFridgeItemsByFridgeId } from '../../utils/fridgeStorage';
import { listStyles as styles } from './styles';

type FridgeItem = {
  id: number;
  ingredientId: number;
  categoryId: number;
  ingredientName: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  //
  fridgeId: number;
  itemCategory: string;
};

type FridgeItemListProps = {
  items: FridgeItem[];
  isEditMode: boolean;
  onAddItem: () => void;
  onItemPress?: (item: FridgeItem) => void;
  onQuantityChange?: (itemId: number, newQuantity: number) => void;
  onUnitChange?: (itemId: number, newUnit: string) => void;
  onExpiryDateChange?: (itemId: number, newDate: string) => void;
  onDeleteItem?: (itemId: number) => void;
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
        setTestItems(
          loadedItems.map(item => ({
            ...item,
            fridgeId: Number(item.fridgeId),
          })),
        );
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
        {/* Filter Bar */}
        <FilterBar
          activeItemCategory={activeItemCategory}
          isListEditMode={isEditMode}
          onItemCategoryPress={onItemCategoryPress}
          onEditModeToggle={onEditModeToggle}
        />
        <DraggableFlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        <ItemAddButton onPress={onAddItem} visible={!isEditMode} />
      </KeyboardAvoidingView>
    </View>
  );
};

export default FridgeItemList;
