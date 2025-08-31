import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
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
        <Image
          source={require('../../assets/icons/chef_hat_20dp.png')}
          resizeMode="contain"
        />
        <Text style={styles.buttonText}>조리하기</Text>
      </TouchableOpacity>

      {!isSharedRecipe && (
        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Icon name="group" size={20} color="#666" />
          <Text style={styles.shareButtonText}>레시피 공유하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
