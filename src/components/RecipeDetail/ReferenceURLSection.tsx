import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from './styles';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

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
  if (!url && !isEditMode) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>참고 URL</Text>
      <View style={styles.urlContainer}>
        <FontAwesome6
          name="link"
          size={16}
          color="#444"
          style={styles.urlIcon}
        />
        {isEditMode ? (
          <View style={styles.urlInputContainer}>
            <TextInput
              style={styles.urlInput}
              value={url}
              onChangeText={onUrlChange}
              placeholder="참고 사이트, 영상 등의 ,URL을 입력하세요"
              placeholderTextColor="#999"
            />
          </View>
        ) : (
          <Text style={styles.url}>{url || '없음'}</Text>
        )}
      </View>
    </View>
  );
};
