import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { paginationButtonStyles as styles } from './styles';

interface PaginationButtonProps {
  type: 'loadMore' | 'scrollToTop';
  onPress: () => void;
  text?: string;
  visible?: boolean;
  style?: ViewStyle;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({
  type,
  onPress,
  text = '더보기',
  visible = true,
  style,
}) => {
  if (!visible) {
    return null;
  }

  if (type === 'scrollToTop') {
    return (
      <TouchableOpacity
        style={[styles.scrollToTopButton, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Icon name="keyboard-arrow-up" size={24} color="white" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.loadMoreButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.loadMoreText}>{text}</Text>
      <Icon name="keyboard-arrow-down" size={24} color="#666" />
    </TouchableOpacity>
  );
};

export default PaginationButton;
