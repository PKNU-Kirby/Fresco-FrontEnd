import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { optionStyles as styles } from './styles';

interface OptionButtonProps {
  iconName: string;
  text: string;
  onPress: () => void;
  iconColor?: string;
  iconSize?: number;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  iconName,
  text,
  onPress,
  iconColor = '#333',
  iconSize = 24,
}) => {
  return (
    <TouchableOpacity
      style={styles.optionButton}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={`${text} 옵션`}
      accessibilityRole="button"
      activeOpacity={0.6}
    >
      <View style={styles.optionIcon}>
        <FontAwesome6 name={iconName} size={iconSize} color={iconColor} />
      </View>
      <Text style={styles.optionText}>{text}</Text>
    </TouchableOpacity>
  );
};

export default OptionButton;
