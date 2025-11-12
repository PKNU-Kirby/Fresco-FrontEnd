import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

interface SharedRecipeIndicatorProps {
  sharedBy?: string;
}

export const SharedRecipeIndicator: React.FC<SharedRecipeIndicatorProps> = ({
  sharedBy,
}) => {
  return (
    <View style={styles.sharedIndicator}>
      <Icon name="group" size={20} color="#2F4858" />
      <Text style={styles.sharedText}>
        <Text style={styles.sharedByText}>{sharedBy}</Text>의 공유 레시피입니다
      </Text>
    </View>
  );
};
