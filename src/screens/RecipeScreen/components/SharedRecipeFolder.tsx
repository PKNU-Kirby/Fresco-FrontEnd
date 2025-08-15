import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { sharedRecipeFolderStyles as styles } from './styles';

interface SharedRecipeFolderProps {
  onPress: () => void;
}

const SharedRecipeFolder: React.FC<SharedRecipeFolderProps> = ({ onPress }) => (
  <>
    <TouchableOpacity
      style={styles.sharedFolderCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.folderIcon}>
        <Icon name="group" size={32} color="#333333d6" />
      </View>
      <View style={styles.folderInfo}>
        <Text style={styles.folderName}>공동 레시피 폴더</Text>
        <Text style={styles.folderSubInfo}>구성원들과 공유하는 레시피</Text>
      </View>
      <Icon name="chevron-right" size={32} color="#333333d6" />
    </TouchableOpacity>

    <View style={styles.contour} />
  </>
);

export default SharedRecipeFolder;
