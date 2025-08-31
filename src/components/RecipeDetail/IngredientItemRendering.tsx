import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RecipeIngredient } from '../../screens/RecipeScreen/RecipeNavigator';
import { FridgeItem } from '../../utils/fridgeStorage';
import { EnhancedIngredient } from '../../hooks/Recipe/useIngredientMatching';
import { styles } from './styles';

interface IngredientItemProps {
  ingredient: EnhancedIngredient;
  isEditMode: boolean;
  isExpanded: boolean;
  fridgeId?: number;
  isLoading: boolean;
  onToggleExpansion: (ingredientId: string) => void;
  onRemoveIngredient: (id: string) => void;
  onUpdateIngredient: (
    id: string,
    field: keyof RecipeIngredient,
    value: string,
  ) => void;
  onFridgeItemSelection: (
    ingredientId: string,
    fridgeItem: FridgeItem,
    isAlternative: boolean,
  ) => void;
}

export const IngredientItemRendering: React.FC<IngredientItemProps> = ({
  ingredient,
  isEditMode,
  isExpanded,
  fridgeId,
  isLoading,
  onToggleExpansion,
  onRemoveIngredient,
  onUpdateIngredient,
  onFridgeItemSelection,
}) => {
  // 재료 상태 동그라미
  const getStatusCircle = () => {
    if (ingredient.isAvailable) {
      return <Icon name={'check-circle'} size={24} color={'limegreen'} />;
    } else if (ingredient.alternatives.length > 0) {
      return <Icon name={'check-circle'} size={24} color={'#fdaa26'} />;
    }
    return <Icon name={'cancel'} size={24} color={'tomato'} />;
  };

  // 유통기한으로 정렬하는 함수
  const sortByExpiryDate = (items: FridgeItem[]) => {
    return items.sort((a, b) => {
      // 날짜 문자열을 Date 객체로 변환해서 비교
      const dateA = new Date(a.expiryDate);
      const dateB = new Date(b.expiryDate);
      return dateA.getTime() - dateB.getTime(); // 오름차순 (임박한 순)
    });
  };

  // 대체재 섹션 렌더링
  const renderAlternatives = () => {
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
            {sortByExpiryDate([...ingredient.exactMatches]).map(
              (item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    ingredient.selectedFridgeItem?.id === item.id &&
                      !ingredient.isAlternativeSelected &&
                      styles.selectedAlternativeItem,
                  ]}
                  onPress={() =>
                    onFridgeItemSelection(ingredient.id, item, false)
                  }
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
                            <Icon
                              name="check-circle"
                              size={20}
                              color="limegreen"
                            />
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
              ),
            )}
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
                    유통기한:{' '}
                    <Text style={styles.alternativeReasonExpiaryDate}>
                      {alternative.fridgeItem.expiryDate}
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    );
  };

  if (isEditMode) {
    // 편집 모드
    return (
      <View style={styles.ingredientEditRow}>
        <TextInput
          style={[styles.ingredientInput, styles.ingredientName]}
          value={ingredient.name}
          onChangeText={text => onUpdateIngredient(ingredient.id, 'name', text)}
          placeholder="재료명"
          placeholderTextColor="#999"
        />
        <TextInput
          style={[styles.ingredientInput, styles.ingredientQuantity]}
          value={ingredient.quantity}
          onChangeText={text =>
            onUpdateIngredient(ingredient.id, 'quantity', text)
          }
          placeholder="양"
          placeholderTextColor="#999"
        />
        <TextInput
          style={[styles.ingredientInput, styles.ingredientUnit]}
          value={ingredient.unit}
          onChangeText={text => onUpdateIngredient(ingredient.id, 'unit', text)}
          placeholder="단위"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemoveIngredient(ingredient.id)}
        >
          <Icon name="remove" size={20} color="tomato" />
        </TouchableOpacity>
      </View>
    );
  }

  // 조회 모드
  return (
    <>
      <TouchableOpacity
        style={styles.ingredientRow}
        onPress={() => onToggleExpansion(ingredient.id)}
        disabled={
          ingredient.exactMatches.length === 0 &&
          ingredient.alternatives.length === 0
        }
      >
        <View style={styles.ingredientMainInfo}>
          {fridgeId && !isLoading && <>{getStatusCircle()}</>}
          <Text
            style={[
              styles.ingredientText,
              ingredient.isAvailable && styles.availableIngredient,
            ]}
          >
            {ingredient.name} {ingredient.quantity}
            {ingredient.unit}
          </Text>
        </View>
        {(ingredient.exactMatches.length > 0 ||
          ingredient.alternatives.length > 0) && (
          <Icon
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#666"
          />
        )}
      </TouchableOpacity>
      {renderAlternatives()}
    </>
  );
};
