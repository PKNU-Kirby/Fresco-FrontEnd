import React from 'react';
import { TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NewItemCard from './NewItemCard';
import { addItemStyles } from './styles';

interface ShoppingListFooterProps {
  isSyncing: boolean;
  isEditMode: boolean;
  isAddingNewItem: boolean;
  onStartAddItem: () => void;
  onCancelAddItem: () => void;
  onAddNewItem: (name: string, quantity: number, unit: string) => void;
}

const ShoppingListFooter: React.FC<ShoppingListFooterProps> = ({
  isSyncing,
  isEditMode,
  isAddingNewItem,
  onStartAddItem,
  onCancelAddItem,
  onAddNewItem,
}) => {
  if (isEditMode) {
    return null;
  }

  return (
    <>
      {isAddingNewItem ? (
        <NewItemCard onSave={onAddNewItem} onCancel={onCancelAddItem} />
      ) : (
        <TouchableOpacity
          style={addItemStyles.addButton}
          onPress={onStartAddItem}
          disabled={isSyncing}
        >
          <MaterialIcons name="add" size={32} color="#666" />
        </TouchableOpacity>
      )}
    </>
  );
};

export default ShoppingListFooter;
