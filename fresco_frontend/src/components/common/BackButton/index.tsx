import React from 'react';
import {TouchableOpacity} from 'react-native';
import CustomText from '../CustomText';
import {styles} from './styles';

type BackButtonProps = {
  onPress: () => void;
  style?: any;
  textStyle?: any;
  icon?: string;
};

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  style,
  textStyle,
  icon = '‹',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.backButton, style]}
      activeOpacity={0.6}>
      <CustomText style={[styles.backButtonText, textStyle]}>{icon}</CustomText>
    </TouchableOpacity>
  );
};

export default BackButton;
