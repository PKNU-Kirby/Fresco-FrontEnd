import React from 'react';
import { View } from 'react-native';
import { Recipe } from '../../screens/RecipeScreen/RecipeNavigator';
import RecipeCard from './RecipeCard';
import { renderRecipeItemStyles as styles } from './styles';

interface RenderRecipeItemProps {
  item: Recipe;
  drag: () => void;
  isActive: boolean;
  isDragEnabled: boolean;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onPress: (recipe: Recipe) => void;
  isFavorite: boolean;
  // 조리 가능성 props 추가
  availableIngredientsCount?: number;
  totalIngredientsCount?: number;
  canMakeWithFridge?: boolean;
}

const RenderRecipeItem: React.FC<RenderRecipeItemProps> = ({
  item,
  drag,
  isActive,
  isDragEnabled,
  onDelete,
  onToggleFavorite,
  onPress,
  isFavorite,
  availableIngredientsCount = 0,
  totalIngredientsCount = 0,
  canMakeWithFridge = false,
}) => (
  <View style={[isActive && styles.draggingItem]}>
    <RecipeCard
      recipe={item}
      onDelete={() => onDelete(item.id)}
      onToggleFavorite={() => onToggleFavorite(item.id)}
      onPress={() => !isActive && onPress(item)}
      onLongPress={isDragEnabled ? drag : undefined}
      isDragEnabled={isDragEnabled}
      isBeingDragged={isActive}
      isFavorite={isFavorite}
      availableIngredientsCount={availableIngredientsCount}
      totalIngredientsCount={totalIngredientsCount}
      canMakeWithFridge={canMakeWithFridge}
    />
  </View>
);

export default RenderRecipeItem;
