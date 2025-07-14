import React from 'react';
import {TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
      <CustomText style={[styles.backButtonText, textStyle]}>
        <MaterialIcons name="arrow-back-ios-new" size={24} color="#666" />
      </CustomText>
    </TouchableOpacity>
  );
};

export default BackButton;
