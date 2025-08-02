import React from 'react';
import {TouchableOpacity, ViewStyle, TextStyle} from 'react-native';
import CustomText from '../CustomText';
import {styles} from './styles';

// Action Button Component : Edit Toggle Button
interface ActionToggleButtonProps {
  isActive: boolean;
  onPress: () => void;
  activeText: string;
  inactiveText: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeStyle?: ViewStyle;
  activeTextStyle?: TextStyle;
  disabled?: boolean;
}

const ActionToggleButton: React.FC<ActionToggleButtonProps> = ({
  isActive,
  onPress,
  activeText,
  inactiveText,
  style,
  textStyle,
  activeStyle,
  activeTextStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        isActive && styles.actionButtonActive,
        isActive && activeStyle,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <CustomText
        style={[
          styles.actionButtonText,
          isActive && styles.actionButtonTextActive,
          isActive && activeTextStyle,
          textStyle,
        ]}>
        {isActive ? activeText : inactiveText}
      </CustomText>
    </TouchableOpacity>
  );
};

export default ActionToggleButton;
