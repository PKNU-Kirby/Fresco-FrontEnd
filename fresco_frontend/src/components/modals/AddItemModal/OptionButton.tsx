import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import CustomText from '../../common/CustomText';
import {optionStyles as styles} from './styles';

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
  iconColor = '#666',
  iconSize = 24,
}) => {
  return (
    <TouchableOpacity
      style={styles.optionButton}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={`${text} 옵션`}
      accessibilityRole="button"
      activeOpacity={0.7}>
      <View style={styles.optionIcon}>
        <FontAwesome6 name={iconName} size={iconSize} color={iconColor} />
      </View>
      <CustomText style={styles.optionText}>{text}</CustomText>
    </TouchableOpacity>
  );
};

export default OptionButton;
