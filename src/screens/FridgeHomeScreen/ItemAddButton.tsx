import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { itemAddButtonStyles as styles } from './listStyles';

interface ItemAddButtonProps {
  onPress: () => void;
  visible?: boolean;
}

const ItemAddButton: React.FC<ItemAddButtonProps> = ({
  onPress,
  visible = true,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.addButton}
      onPress={onPress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel="식재료 추가"
      accessibilityRole="button"
    >
      <FontAwesome6 name="plus" size={24} color="#f8f8f8" />
    </TouchableOpacity>
  );
};

export default ItemAddButton;
