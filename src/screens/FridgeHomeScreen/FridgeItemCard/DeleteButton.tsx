import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { deleteButtonStyles as styles } from './styles';

interface DeleteButtonProps {
  onPress: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.deleteItemButton} onPress={onPress}>
      <FontAwesome6 name={'xmark'} size={16} color={'#e8e8e8'} />
    </TouchableOpacity>
  );
};

export default DeleteButton;
