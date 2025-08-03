import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import { RecipeFolder } from './index';
import { folderCardStyles } from './styles';

interface FolderCardProps {
  folder: RecipeFolder;
  onPress: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onPress }) => {
  return (
    <TouchableOpacity style={folderCardStyles.container} onPress={onPress}>
      <View style={folderCardStyles.iconContainer}>
        <MaterialIcons
          name={folder.isShared ? 'folder-shared' : 'folder'}
          size={24}
          color={folder.isShared ? '#FF6B35' : '#007AFF'}
        />
        {folder.isShared && (
          <View style={folderCardStyles.sharedBadge}>
            <MaterialIcons name="people" size={12} color="#FFF" />
          </View>
        )}
      </View>

      <View style={folderCardStyles.info}>
        <CustomText
          weight="bold"
          size={16}
          color="#333"
          style={{ marginBottom: 2 }}
        >
          {folder.name}
        </CustomText>
        <CustomText size={12} color="#666">
          {folder.recipes.length}개의 레시피
        </CustomText>
      </View>

      <MaterialIcons name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );
};
export default FolderCard;
