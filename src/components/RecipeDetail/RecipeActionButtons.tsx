import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

interface RecipeActionButtonsProps {
  isSharedRecipe: boolean;
  onUseRecipe: () => void;
  onShare: () => void;
}

export const RecipeActionButtons: React.FC<RecipeActionButtonsProps> = ({
  isSharedRecipe,
  onUseRecipe,
  onShare,
}) => {
  return (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity style={styles.useRecipeButton} onPress={onUseRecipe}>
        <Icon name="restaurant" size={20} color="#f8f8f8" />
        <Text style={styles.buttonText}>조리하기</Text>
      </TouchableOpacity>

      {!isSharedRecipe && (
        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Icon name="group" size={20} color="#f8f8f8" />
          <Text style={styles.buttonText}>구성원과 공유하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
