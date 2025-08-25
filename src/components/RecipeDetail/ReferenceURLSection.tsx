import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from './styles';

interface ReferenceUrlSectionProps {
  url?: string;
  isEditMode: boolean;
  onUrlChange: (text: string) => void;
}

export const ReferenceUrlSection: React.FC<ReferenceUrlSectionProps> = ({
  url,
  isEditMode,
  onUrlChange,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>참고 URL</Text>
      {isEditMode ? (
        <TextInput
          style={styles.urlInput}
          value={url}
          onChangeText={onUrlChange}
          placeholder="참고 URL을 입력하세요"
          placeholderTextColor="#999"
        />
      ) : (
        <Text style={styles.url}>{url || '없음'}</Text>
      )}
    </View>
  );
};
