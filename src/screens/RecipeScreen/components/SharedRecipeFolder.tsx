import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { sharedRecipeFolderStyles as styles } from './styles';

interface SharedRecipeFolderProps {
  recipeCount: number;
  onPress: () => void;
}

const SharedRecipeFolder: React.FC<SharedRecipeFolderProps> = ({
  recipeCount,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.sharedFolderCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.folderContent}>
      <View style={styles.folderInfo}>
        <Text style={styles.folderTitle}>공동 레시피</Text>
        <Text style={styles.folderDescription}>
          냉장고 구성원들이 함께 공유하는 레시피
        </Text>
        <Text style={styles.folderSubInfo}>{recipeCount}개의 공동 레시피</Text>
      </View>

      <Icon name="folder-shared" size={32} color="limegreen" />
      <View style={styles.folderBadge}>
        <Text style={styles.folderBadgeText}>{recipeCount}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default SharedRecipeFolder;
