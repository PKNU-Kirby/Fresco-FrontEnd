import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FridgeItem } from '../../utils/fridgeStorage';
import { EnhancedIngredient } from './IngredientsSection';
import { styles } from './styles';

interface AlternativesListProps {
  ingredient: EnhancedIngredient;
  isExpanded: boolean;
  onFridgeItemSelection: (
    ingredientId: string,
    fridgeItem: FridgeItem,
    isAlternative: boolean,
  ) => void;
}

export const AlternativesList: React.FC<AlternativesListProps> = ({
  ingredient,
  isExpanded,
  onFridgeItemSelection,
}) => {
  if (!isExpanded) {
    return null;
  }

  const hasExactMatches = ingredient.exactMatches.length > 0;
  const hasAlternatives = ingredient.alternatives.length > 0;

  if (!hasExactMatches && !hasAlternatives) {
    return null;
  }

  return (
    <View style={styles.alternativesContainer}>
      {hasExactMatches && (
        <>
          <Text style={styles.alternativesTitle}>보유 재료 정보</Text>
          {ingredient.exactMatches.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                ingredient.selectedFridgeItem?.id === item.id &&
                  !ingredient.isAlternativeSelected &&
                  styles.selectedAlternativeItem,
              ]}
              onPress={() => onFridgeItemSelection(ingredient.id, item, false)}
            >
              <View style={styles.alternativeInfo}>
                <View style={styles.alternativeTitleContainer}>
                  <Text
                    style={[
                      styles.alternativeName,
                      ingredient.selectedFridgeItem?.id === item.id &&
                        !ingredient.isAlternativeSelected &&
                        styles.selectedAlternativeText,
                    ]}
                  >
                    {item.name} {item.quantity}
                    {item.unit || '개'}
                  </Text>
                  {ingredient.selectedFridgeItem?.id === item.id &&
                    !ingredient.isAlternativeSelected && (
                      <View style={styles.selectedIcon}>
                        <Icon name="check-circle" size={20} color="limegreen" />
                      </View>
                    )}
                </View>
                <Text style={styles.alternativeReason}>
                  유통기한:{' '}
                  <Text style={styles.alternativeReasonExpiaryDate}>
                    {item.expiryDate}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {hasAlternatives && (
        <>
          <Text style={styles.alternativesTitle}>
            {hasExactMatches ? '대체 식재료' : '대체 가능 식재료'}
          </Text>
          {ingredient.alternatives.map((alternative, index) => (
            <TouchableOpacity
              key={index}
              style={[
                ingredient.selectedFridgeItem?.id ===
                  alternative.fridgeItem.id &&
                  ingredient.isAlternativeSelected &&
                  styles.selectedAlternativeItem,
              ]}
              onPress={() =>
                onFridgeItemSelection(
                  ingredient.id,
                  alternative.fridgeItem,
                  true,
                )
              }
            >
              <View style={styles.alternativeInfo}>
                <View style={styles.alternativeTitleContainer}>
                  <Text
                    style={[
                      styles.alternativeName,
                      ingredient.selectedFridgeItem?.id ===
                        alternative.fridgeItem.id &&
                        ingredient.isAlternativeSelected &&
                        styles.selectedAlternativeText,
                    ]}
                  >
                    {alternative.fridgeItem.name}{' '}
                    {alternative.fridgeItem.quantity}
                    {alternative.fridgeItem.unit || '개'}
                  </Text>
                  {ingredient.selectedFridgeItem?.id ===
                    alternative.fridgeItem.id &&
                    ingredient.isAlternativeSelected && (
                      <View style={styles.selectedIcon}>
                        <Icon name="check-circle" size={20} color="#FF9800" />
                      </View>
                    )}
                </View>
                <Text style={styles.alternativeReason}>
                  {alternative.reason}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
};
