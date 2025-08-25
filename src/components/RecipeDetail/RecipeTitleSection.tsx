import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from './styles';

interface RecipeTitleSectionProps {
  title: string;
  isEditMode: boolean;
  onTitleChange: (text: string) => void;
}

export const RecipeTitleSection: React.FC<RecipeTitleSectionProps> = ({
  title,
  isEditMode,
  onTitleChange,
}) => {
  return (
    <View style={styles.section}>
      {isEditMode ? (
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={onTitleChange}
          placeholder="레시피 제목을 입력하세요"
          placeholderTextColor="#999"
        />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </View>
  );
};
