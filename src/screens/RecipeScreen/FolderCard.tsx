import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
          color={folder.isShared ? 'limegreen' : '#666'}
        />
      </View>

      <View style={folderCardStyles.info}>
        <Text style={folderCardStyles.name}>{folder.name}</Text>
        <Text style={folderCardStyles.count}>
          {folder.recipes.length}개의 레시피
        </Text>
      </View>

      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );
};
export default FolderCard;
