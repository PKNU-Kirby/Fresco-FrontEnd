/**
 * 기본 사용법 (기존과 동일)
 <BackButton onPress={goBack} />
 *
 * 커스터마이징 사용법
<BackButton
  onPress={goBack}
  icon="arrow-back"
  iconSize={20}
  iconColor="limegreen"
  activeOpacity={0.8}
  disabled={isLoading}
/>
*/

import React from 'react';
import {
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
      disabled={disabled}
    >
      <MaterialIcons
        name={icon}
        size={iconSize}
        color={disabled ? '#ccc' : iconColor}
      />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  // 비활성화 상태 스타일
  backButtonDisabled: {
    opacity: 0.5,
  },
});
