import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Recipe } from '../RecipeNavigator';
import { recipeCardStyles as styles } from './styles';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onPress: () => void;
  onLongPress?: () => void;
  isDragEnabled?: boolean;
  isBeingDragged?: boolean;
  isFavorite: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onDelete,
  onToggleFavorite,
  onPress,
  onLongPress,
  isBeingDragged = false,
  isFavorite,
}) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);

  const renderRightActions = () => (
    <View style={styles.rightActionsContainer}>
      {/* Delete Button */}
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteActionButton]}
        onPress={onDelete}
      >
        <Icon name="delete" size={28} color="#f8f8f8" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScaleDecorator>
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => setIsSwipeOpen(true)}
        onSwipeableWillClose={() => setIsSwipeOpen(false)}
        onSwipeableClose={() => setIsSwipeOpen(false)}
        onSwipeableOpen={() => setIsSwipeOpen(true)}
        rightThreshold={10}
      >
        <TouchableOpacity
          style={[
            styles.recipeCard,
            isBeingDragged && styles.draggingCard,
            isSwipeOpen && styles.swipeOpenCard,
          ]}
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
          delayLongPress={400}
        >
          <View style={styles.recipeCardContent}>
            <View style={styles.recipeInfo}>
              <Text
                style={[
                  styles.recipeTitle,
                  isSwipeOpen && styles.swipeOpenTitle,
                ]}
              >
                {recipe.title}
              </Text>
              <Text
                style={[
                  styles.recipeDescription,
                  isSwipeOpen && styles.swipeOpenDescription,
                ]}
              >
                {recipe.description}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={e => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
              >
                <Icon
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
