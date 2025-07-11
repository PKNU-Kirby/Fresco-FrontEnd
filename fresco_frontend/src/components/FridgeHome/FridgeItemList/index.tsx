import React from 'react';
import {View, FlatList, TouchableOpacity} from 'react-native';
import FridgeItemCard from '../FridgeItemCard';
import {styles} from './styles';

type FridgeItem = {
  id: number;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  storageType: string;
  itemCategory: string;
  fridgeId: number;
};

type FridgeItemListProps = {
  items: FridgeItem[];
  isEditMode: boolean;
  onAddItem: () => void;
  onItemPress?: (item: FridgeItem) => void;
};

const FridgeItemList: React.FC<FridgeItemListProps> = ({
  items,
  isEditMode,
  onAddItem,
  onItemPress,
}) => {
  const renderItem = ({item}: {item: FridgeItem}) => (
    <FridgeItemCard
      item={item}
      isEditMode={isEditMode}
      onPress={() => onItemPress?.(item)}
    />
  );

  return (
    <View style={styles.content}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* 플러스 버튼 */}
      <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
        <View style={styles.addButtonIcon}>
          <View style={styles.addButtonHorizontal} />
          <View style={styles.addButtonVertical} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FridgeItemList;
