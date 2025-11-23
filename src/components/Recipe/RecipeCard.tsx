import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import IconA from 'react-native-vector-icons/MaterialIcons';
import { Recipe } from '../../screens/RecipeScreen/RecipeNavigator';
import { recipeCardStyles as styles } from './styles';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onPress: () => void;
  onLongPress?: () => void;
  isDragEnabled?: boolean;
  isBeingDragged?: boolean;
  isFavorite?: boolean;
  availableIngredientsCount?: number;
  totalIngredientsCount?: number;
  canMakeWithFridge?: boolean;
  canDelete?: boolean; // 👈 추가
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onDelete,
  onToggleFavorite,
  onPress,
  onLongPress,
  isBeingDragged = false,
  isFavorite,
  availableIngredientsCount = 0,
  totalIngredientsCount = 0,
  canMakeWithFridge = false,
  canDelete = true, // 👈 추가 (기본값 true)
}) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);

  const renderRightActions = () => (
    <View style={styles.rightActionsContainer}>
      {/* Delete Button */}
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteActionButton]}
        onPress={onDelete}
      >
        <IconA name="delete" size={28} color="#f8f8f8" />
      </TouchableOpacity>
    </View>
  );

  // 재료 가능 상태 표시 컴포넌트
  const renderIngredientStatus = () => {
    return (
      <View style={styles.ingredientStatus}>
        <View
          style={[
            styles.statusIndicator,
            canMakeWithFridge
              ? styles.canMakeIndicator
              : styles.cannotMakeIndicator,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              canMakeWithFridge ? styles.canMakeText : styles.cannotMakeText,
            ]}
          >
            {availableIngredientsCount} / {totalIngredientsCount}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScaleDecorator>
      {/* 👇 canDelete가 false면 Swipeable 비활성화 */}
      <Swipeable
        renderRightActions={canDelete ? renderRightActions : undefined} // 👈 수정
        onSwipeableWillOpen={() => setIsSwipeOpen(true)}
        onSwipeableWillClose={() => setIsSwipeOpen(false)}
        onSwipeableClose={() => setIsSwipeOpen(false)}
        onSwipeableOpen={() => setIsSwipeOpen(true)}
        rightThreshold={10}
        enabled={canDelete} // 👈 추가
      >
        <TouchableOpacity
          style={[
            styles.recipeCard,
            isBeingDragged && styles.draggingCard,
            isSwipeOpen && styles.swipeOpenCard,
            canMakeWithFridge && styles.canMakeCard,
          ]}
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
          delayLongPress={400}
        >
          <View style={styles.recipeCardContent}>
            <Image
              source={require('../../assets/icons/chef_hat_96dp.png')}
              style={styles.recipeIcon}
              resizeMode="contain"
            />
            <View style={styles.recipeInfo}>
              <Text
                style={[
                  styles.recipeTitle,
                  isSwipeOpen && styles.swipeOpenTitle,
                ]}
              >
                {recipe.title}
              </Text>
              {renderIngredientStatus()}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={e => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
              >
                <IconA
                  name={isFavorite ? 'star' : 'star-outline'}
                  size={28}
                  color={isFavorite ? '#ffd000' : '#999'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </ScaleDecorator>
  );
};

export default RecipeCard;
