import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { addItemStyles as styles } from './styles';

interface AddItemActionsProps {
  isEditMode: boolean;
  onAddNewItem: () => void;
  onBackToEdit: () => void;
}

export const AddItemActions: React.FC<AddItemActionsProps> = ({
  isEditMode,
  onAddNewItem,
  onBackToEdit,
}) => {
  if (isEditMode) {
    return (
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddNewItem}
          accessibilityLabel="새 식재료 추가"
          accessibilityRole="button"
        >
          <MaterialIcons name="add" size={24} color="#444" />
          <Text style={styles.addButtonText}>식재료 카드 추가</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.editModeContainer}>
      <TouchableOpacity
        style={styles.backToEditButton}
        onPress={onBackToEdit}
        accessibilityLabel="수정하기"
        accessibilityRole="button"
      >
        <MaterialIcons name="edit" size={24} color="#f8f8f8" />
        <Text style={styles.backToEditButtonText}>수정하기</Text>
      </TouchableOpacity>
    </View>
  );
};
