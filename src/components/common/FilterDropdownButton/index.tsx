import React from 'react';
import {TouchableOpacity, ViewStyle, TextStyle} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomText from '../CustomText';
import {styles} from './styles';

// Filter Button Component : Dropdown
interface FilterDropdownButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
}

const FilterDropdownButton: React.FC<FilterDropdownButtonProps> = ({
  label,
  onPress,
  style,
  textStyle,
  iconName = 'caret-down',
  iconSize = 15,
  iconColor = 'white',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.filterButton, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <CustomText style={[styles.filterButtonText, textStyle]}>
        <FontAwesome5
          name={iconName}
          size={iconSize}
          color={disabled ? '#ccc' : iconColor}
        />
        {'  '}
        {label}
      </CustomText>
    </TouchableOpacity>
  );
};

export default FilterDropdownButton;
