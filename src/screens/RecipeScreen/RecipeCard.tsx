import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import { Recipe } from './index';
import { recipeCardStyles } from './styles';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '쉬움';
      case 'medium':
        return '보통';
      case 'hard':
        return '어려움';
      default:
        return '보통';
    }
  };

  return (
    <TouchableOpacity style={recipeCardStyles.container} onPress={onPress}>
      {/* 레시피 이미지 */}
      <View style={recipeCardStyles.imageContainer}>
        {recipe.image ? (
          <Image
            source={{ uri: recipe.image }}
            style={recipeCardStyles.image}
          />
        ) : (
          <View style={recipeCardStyles.imagePlaceholder}>
            <MaterialIcons name="restaurant" size={32} color="#CCC" />
          </View>
        )}
        {recipe.isAIGenerated && (
          <View style={recipeCardStyles.aiTag}>
            <MaterialIcons name="auto-awesome" size={12} color="#FFF" />
            <CustomText
              size={10}
              color="#FFFFFF"
              weight="bold"
              style={{ marginLeft: 2 }}
            >
              AI
            </CustomText>
          </View>
        )}
      </View>

      {/* 레시피 정보 */}
      <View style={recipeCardStyles.info}>
        <CustomText weight="bold" size={16} color="#333" numberOfLines={2}>
          {recipe.title}
        </CustomText>

        <View style={recipeCardStyles.details}>
          <View style={recipeCardStyles.detailItem}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <CustomText size={12} color="#666" style={{ marginLeft: 4 }}>
              {recipe.cookingTime}분
            </CustomText>
          </View>

          <View style={recipeCardStyles.detailItem}>
            <MaterialIcons
              name="signal-cellular-4-bar"
              size={16}
              color={getDifficultyColor(recipe.difficulty)}
            />
            <CustomText size={12} color="#666" style={{ marginLeft: 4 }}>
              {getDifficultyText(recipe.difficulty)}
            </CustomText>
          </View>
        </View>

        <CustomText size={12} color="#999" numberOfLines={2}>
          재료:{' '}
          {recipe.ingredients
            .slice(0, 3)
            .map(ing => ing.name)
            .join(', ')}
          {recipe.ingredients.length > 3 && '...'}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};
export default RecipeCard;
