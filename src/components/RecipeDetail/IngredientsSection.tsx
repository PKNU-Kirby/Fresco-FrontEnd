import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RecipeIngredient } from '../../screens/RecipeScreen/RecipeNavigator';
import { IngredientInfoModal } from './IngredientInfoModal';
import { IngredientItemRendering } from './IngredientItemRendering';
import {
  useIngredientMatching,
  EnhancedIngredient,
} from '../../hooks/Recipe/useIngredientMatching';
import { styles } from './styles';

interface IngredientsSectionProps {
  ingredients: RecipeIngredient[];
  isEditMode: boolean;
  isNewRecipe?: boolean;
  fridgeId?: number;
  onAddIngredient: () => void;
  onRemoveIngredient: (id: string) => void;
  onUpdateIngredient: (
    id: number,
    field: keyof RecipeIngredient,
    value: string,
  ) => void;
  onEnhancedIngredientsChange?: (ingredients: EnhancedIngredient[]) => void;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  ingredients,
  isEditMode,
  isNewRecipe = false,
  fridgeId,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
  onEnhancedIngredientsChange,
}) => {
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(
    new Set(),
  );
  const [showInfoModal, setShowInfoModal] = useState(false);

  // 커스텀 훅 사용 - 새로운 방식으로 호출
  const { enhancedIngredients, isLoading, handleFridgeItemSelection } =
    useIngredientMatching({
      ingredients,
      fridgeId,
      isEditMode,
      onEnhancedIngredientsChange,
    });

  // 재료 확장/축소 토글
  const toggleIngredientExpansion = (ingredientId: string) => {
    const newExpanded = new Set(expandedIngredients);
    if (newExpanded.has(ingredientId)) {
      newExpanded.delete(ingredientId);
    } else {
      newExpanded.add(ingredientId);
    }
    setExpandedIngredients(newExpanded);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>재료</Text>
        {!isNewRecipe && (
          <TouchableOpacity
            style={styles.ingredientInfo}
            onPress={() => setShowInfoModal(true)}
          >
            <Icon name={'info-outline'} size={24} color={'#444'} />
          </TouchableOpacity>
        )}
      </View>

      {enhancedIngredients.map((ingredient, _index) => (
        <View key={ingredient.id} style={styles.ingredientItem}>
          <IngredientItemRendering
            ingredient={ingredient}
            isEditMode={isEditMode}
            isExpanded={expandedIngredients.has(ingredient.id)}
            fridgeId={fridgeId}
            isLoading={isLoading}
            onToggleExpansion={toggleIngredientExpansion}
            onRemoveIngredient={onRemoveIngredient}
            onUpdateIngredient={onUpdateIngredient}
            onFridgeItemSelection={handleFridgeItemSelection}
          />
        </View>
      ))}
      {isEditMode && (
        <TouchableOpacity style={styles.addButton} onPress={onAddIngredient}>
          <Icon name="add" size={22} color="#2F4858" />
          <Text style={styles.addButtonText}>재료 추가</Text>
        </TouchableOpacity>
      )}
      <IngredientInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </View>
  );
};
