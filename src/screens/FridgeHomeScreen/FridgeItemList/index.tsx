import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import FridgeItemCard from '../FridgeItemCard';
import AddButton from './ItemAddButton';
import { listStyles as styles } from './styles';
import { getFridgeItemsByFridgeId } from '../../../utils/fridgeStorage';

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
      const fridgeId = items[0].fridgeId;
      const loadedItems = await getFridgeItemsByFridgeId(fridgeId);
      setTestItems(loadedItems);
    };
    loadTestData();
  }, [items]);

  return (
    <View style={styles.content}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <AddButton onPress={onAddItem} visible={!isEditMode} />
    </View>
  );
};

export default FridgeItemList;
