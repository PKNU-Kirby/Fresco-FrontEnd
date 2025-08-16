import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import FridgeItemCard from '../FridgeItemCard';
import AddButton from './ItemAddButton';
import { listStyles as styles } from './styles';
import { getFridgeItemsByFridgeId } from '../../../utils/fridgeStorage';

type FridgeItem = {
  id: number;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  itemCategory: string;
  fridgeId: number;
  unit?: string;
};

type FridgeItemListProps = {
  items: FridgeItem[];
  isEditMode: boolean;
  onAddItem: () => void;
  onItemPress?: (item: FridgeItem) => void;
  onQuantityChange?: (itemId: number, newQuantity: string) => void;
  onUnitChange?: (itemId: number, newUnit: string) => void;
  onExpiryDateChange?: (itemId: number, newDate: string) => void;
  onDeleteItem?: (itemId: number) => void;
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
      const loadedItems = await getFridgeItemsByFridgeId(1);
      // console.log('테스트 로드된 아이템들:', loadedItems);
      setTestItems(loadedItems);
    };
    loadTestData();
  }, []);

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
