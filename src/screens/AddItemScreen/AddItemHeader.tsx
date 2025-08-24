import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import BackButton from '../../components/common/BackButton';
import { addItemStyles as styles } from './styles';

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
      <View style={styles.backbutton}>
        <BackButton onPress={onGoBack} />
      </View>
      <Text style={styles.headerTitle}>식재료 추가</Text>
      <TouchableOpacity
        style={[
          styles.headerButton,
          isHeaderButtonDisabled && styles.headerButtonDisabled,
        ]}
        onPress={onHeaderButtonPress}
        disabled={isHeaderButtonDisabled}
        accessibilityLabel={headerButtonText}
        accessibilityRole="button"
      >
        <Text style={styles.headerButtonText}>{headerButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
};
