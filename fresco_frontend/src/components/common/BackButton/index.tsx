/**
 * 기본 사용법 (기존과 동일)
 <BackButton onPress={goBack} />
 * 
 * 커스터마이징 사용법
<BackButton 
  onPress={goBack}
  icon="arrow-back"
  iconSize={20}
  iconColor="#007AFF"
  activeOpacity={0.8}
  disabled={isLoading}
/>
*/

import React from 'react';
import {TouchableOpacity, ViewStyle, TextStyle} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {styles} from './styles';

interface BackButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  activeOpacity?: number;
  disabled?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  style,
  icon = 'arrow-back-ios-new',
  iconSize = 24,
  iconColor = '#666',
  activeOpacity = 0.6,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.backButton, style]}
      activeOpacity={activeOpacity}
      disabled={disabled}>
      <MaterialIcons
        name={icon}
        size={iconSize}
        color={disabled ? '#ccc' : iconColor}
      />
    </TouchableOpacity>
  );
};

export default BackButton;
