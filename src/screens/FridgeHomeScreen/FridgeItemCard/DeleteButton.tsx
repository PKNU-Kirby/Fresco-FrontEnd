import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { deleteButtonStyles as styles } from './styles';

interface DeleteButtonProps {
  onPress: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.deleteItemButton}
      activeOpacity={1}
      onPress={onPress}
    >
      <FontAwesome6 name="circle-xmark" size={24} color="#666" solid />
    </TouchableOpacity>
  );
};

export default DeleteButton;
