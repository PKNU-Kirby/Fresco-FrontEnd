//
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
//
import BackButton from '../_common/BackButton';
//
import { addItemHeaderStyles as styles } from './styles';

interface AddItemHeaderProps {
  onGoBack: () => void;
  onHeaderButtonPress: () => void;
  headerButtonText: string;
  isHeaderButtonDisabled: boolean;
}

export const AddItemHeader: React.FC<AddItemHeaderProps> = ({
  onGoBack,
  onHeaderButtonPress,
  headerButtonText,
  isHeaderButtonDisabled,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <BackButton onPress={onGoBack} />
      </View>
      <View style={styles.centerSection}>
        <Text style={styles.headerTitle}>식재료 추가</Text>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={onHeaderButtonPress}
          disabled={isHeaderButtonDisabled}
          accessibilityLabel={headerButtonText}
          accessibilityRole="button"
        >
          {isHeaderButtonDisabled ? (
            <Text style={[styles.headerButton, styles.headerButtonDisabled]}>
              {headerButtonText}
            </Text>
          ) : (
            <Text style={styles.headerButton}>{headerButtonText}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
