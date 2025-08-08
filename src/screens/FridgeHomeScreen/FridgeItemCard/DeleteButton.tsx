import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

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

const styles = StyleSheet.create({
  deleteItemButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    opacity: 0.5,
  },
});

export default DeleteButton;
