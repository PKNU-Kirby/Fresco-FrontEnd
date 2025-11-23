import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NewItemCard from './NewItemCard';
import { styles, addItemStyles } from './styles';

interface ShoppingListEmptyProps {
  isSyncing: boolean;
  isAddingNewItem: boolean;
  onStartAddItem: () => void;
  onCancelAddItem: () => void;
  onAddNewItem: (name: string, quantity: number, unit: string) => void;
}

const ShoppingListEmpty: React.FC<ShoppingListEmptyProps> = ({
  isSyncing,
  isAddingNewItem,
  onStartAddItem,
  onCancelAddItem,
  onAddNewItem,
}) => {
  return (
    <>
      {isAddingNewItem && (
        <View style={styles.topInputContainer}>
          <NewItemCard onSave={onAddNewItem} onCancel={onCancelAddItem} />
        </View>
      )}

      <View style={styles.emptyContainer}>
        {!isAddingNewItem && (
          <>
            <MaterialIcons name="shopping-cart" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>장바구니가 비어있어요</Text>
            <Text style={styles.emptySubtitle}>식재료를 추가해 보세요!</Text>
          </>
        )}
      </View>

      {!isAddingNewItem && (
        <View style={styles.emptyButtonContainer}>
          <TouchableOpacity
            style={addItemStyles.addButton}
            onPress={onStartAddItem}
            disabled={isSyncing}
          >
            <MaterialIcons name="add" size={32} color="#666" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default ShoppingListEmpty;
