// FridgeHome -> FridgeItemCard -> DeleteButton
import React from 'react';
import { TouchableOpacity } from 'react-native';
//
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
//
import { deleteButtonStyles as styles } from './styles';

interface DeleteButtonProps {
  onPress: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.deleteItemButtonContainer}
      onPress={onPress}
    >
      <TouchableOpacity style={styles.deleteItemButton} onPress={onPress}>
        <FontAwesome6 name={'xmark'} size={16} color={'#f8f8f8'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default DeleteButton;
