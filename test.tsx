import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RecipeIngredient } from '../../screens/RecipeScreen/RecipeNavigator';
import {
  getFridgeItemsByFridgeId,
  FridgeItem,
} from '../../utils/fridgeStorage';
import { styles } from './styles';

// 대체재 매핑 데이터
const ALTERNATIVE_MAPPING: {
  [key: string]: Array<{ name: string; reason: string }>;
} = {
  소시지: [
    { name: '부어스트 소시지', reason: '같은 소시지류로 대체 가능해요' },
    { name: '다짐육', reason: '육류 단백질로 대체할 수 있어요' },
  ],
  양파: [
    { name: '적양파', reason: '같은 양파류로 대체 가능해요' },
    { name: '대파', reason: '매운맛과 단맛을 동시에 낼 수 있어요' },
  ],
  적양파: [{ name: '양파', reason: '같은 양파류로 대체 가능해요' }],
  당근: [
    { name: '미니 당근', reason: '같은 당근이에요' },
    { name: '노랑 파프리카', reason: '단맛과 색감이 비슷해요' },
  ],
  '미니 당근': [
    { name: '당근', reason: '같은 당근이에요' },
    { name: '노랑 파프리카', reason: '단맛과 아삭한 식감이 비슷해요' },
  ],
  파프리카: [
    { name: '노랑 파프리카', reason: '같은 파프리카예요' },
    { name: '미니 당근', reason: '단맛과 아삭한 식감이 비슷해요' },
  ],
  '노랑 파프리카': [
    { name: '파프리카', reason: '같은 파프리카예요' },
    { name: '미니 당근', reason: '단맛과 아삭한 식감이 비슷해요' },
  ],
  양배추: [{ name: '배추', reason: '잎채소로 용도가 비슷해요' }],
  배추: [{ name: '양배추', reason: '잎채소로 용도가 비슷해요' }],
  양상추: [{ name: '양배추', reason: '잎채소로 식감이 비슷해요' }],
};

// 향상된 재료 정보 타입 (UseRecipe에서 사용할 수 있도록 export)
export interface EnhancedIngredient extends RecipeIngredient {
  isAvailable: boolean;
  exactMatches: FridgeItem[];
  alternatives: Array<{
    fridgeItem: FridgeItem;
    reason: string;
  }>;
  // UseRecipe에서 사용할 선택된 냉장고 재료 정보
  selectedFridgeItem?: FridgeItem;
  isAlternativeSelected?: boolean;
}

interface IngredientsSectionProps {
  ingredients: RecipeIngredient[];
  isEditMode: boolean;
  fridgeId?: number;
  onAddIngredient: () => void;
  onRemoveIngredient: (id: string) => void;
  onUpdateIngredient: (
    id: string,
    field: keyof RecipeIngredient,
    value: string,
  ) => void;
  // UseRecipe로 전달할 데이터를 위한 콜백
  onEnhancedIngredientsChange?: (ingredients: EnhancedIngredient[]) => void;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  ingredients,
  isEditMode,
  fridgeId,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
  onEnhancedIngredientsChange,
}) => {
  const [enhancedIngredients, setEnhancedIngredients] = useState<
    EnhancedIngredient[]
  >([]);
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // 문자열 정규화 함수
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^\w가-힣]/g, '');
  };

  // 재료 매칭 함수
  const findMatches = (
    recipeName: string,
    fridgeItems: FridgeItem[],
  ): FridgeItem[] => {
    const normalizedRecipeName = normalizeString(recipeName);
    const matches: FridgeItem[] = [];

    // 1차: 정확 매칭
    for (const item of fridgeItems) {
      const normalizedFridgeName = normalizeString(item.name);
      if (normalizedFridgeName === normalizedRecipeName) {
        matches.push(item);
      }
    }

    // 2차: 부분 매칭
    if (matches.length === 0) {
      for (const item of fridgeItems) {
        const normalizedFridgeName = normalizeString(item.name);
        if (
          normalizedFridgeName.includes(normalizedRecipeName) ||
          normalizedRecipeName.includes(normalizedFridgeName)
        ) {
          matches.push(item);
        }
      }
    }

    // 3차: 키워드 매칭
    if (matches.length === 0) {
      const recipeKeywords = recipeName.toLowerCase().split(/[\s,]+/);
      for (const item of fridgeItems) {
        const fridgeKeywords = item.name.toLowerCase().split(/[\s,]+/);

        for (const recipeKeyword of recipeKeywords) {
          for (const fridgeKeyword of fridgeKeywords) {
            if (
              recipeKeyword.length > 1 &&
              fridgeKeyword.length > 1 &&
              (recipeKeyword.includes(fridgeKeyword) ||
                fridgeKeyword.includes(recipeKeyword))
            ) {
              if (!matches.find(m => m.id === item.id)) {
                matches.push(item);
              }
            }
          }
        }
      }
    }

    return matches;
  };

  // 대체재 찾기 함수
  const findAlternatives = (
    recipeName: string,
    fridgeItems: FridgeItem[],
  ): Array<{ fridgeItem: FridgeItem; reason: string }> => {
    const alternatives = [];
    const alternativeOptions = ALTERNATIVE_MAPPING[recipeName] || [];

    for (const alt of alternativeOptions) {
      const matches = findMatches(alt.name, fridgeItems);
      for (const match of matches) {
        alternatives.push({
          fridgeItem: match,
          reason: alt.reason,
        });
      }
    }

    return alternatives;
  };

  // 냉장고 재료와 매칭
  useEffect(() => {
    const loadIngredientInfo = async () => {
      if (!fridgeId || ingredients.length === 0 || isEditMode) {
        const basicIngredients = ingredients.map(ing => ({
          ...ing,
          isAvailable: false,
          exactMatches: [],
          alternatives: [],
        }));
        setEnhancedIngredients(basicIngredients);
        setDebugInfo(
          `냉장고 ID: ${fridgeId || 'none'}, 편집모드: ${isEditMode}`,
        );
        onEnhancedIngredientsChange?.(basicIngredients);
        return;
      }

      setIsLoading(true);
      setDebugInfo('실제 냉장고 데이터 로딩 중...');

      try {
        const fridgeItems = await getFridgeItemsByFridgeId(fridgeId.toString());

        const enhanced = ingredients.map(ingredient => {
          const exactMatches = findMatches(ingredient.name, fridgeItems);
          const alternatives =
            exactMatches.length === 0
              ? findAlternatives(ingredient.name, fridgeItems)
              : [];

          // 기본 선택: 정확한 매칭이 있으면 첫 번째, 없으면 첫 번째 대체재
          let selectedFridgeItem: FridgeItem | undefined;
          let isAlternativeSelected = false;

          if (exactMatches.length > 0) {
            selectedFridgeItem = exactMatches[0];
            isAlternativeSelected = false;
          } else if (alternatives.length > 0) {
            selectedFridgeItem = alternatives[0].fridgeItem;
            isAlternativeSelected = true;
          }

          return {
            ...ingredient,
            isAvailable: exactMatches.length > 0,
            exactMatches,
            alternatives,
            selectedFridgeItem,
            isAlternativeSelected,
          };
        });

        setEnhancedIngredients(enhanced);
        setDebugInfo(`실제 냉장고 재료 ${fridgeItems.length}개 매칭 완료`);

        // 부모 컴포넌트에 전달
        onEnhancedIngredientsChange?.(enhanced);
      } catch (error) {
        console.error('에러 발생:', error);
        const errorIngredients = ingredients.map(ing => ({
          ...ing,
          isAvailable: false,
          exactMatches: [],
          alternatives: [],
        }));
        setEnhancedIngredients(errorIngredients);
        setDebugInfo(`에러: ${error.message}`);
        onEnhancedIngredientsChange?.(errorIngredients);
      } finally {
        setIsLoading(false);
      }
    };

    loadIngredientInfo();
  }, [ingredients, fridgeId, isEditMode, onEnhancedIngredientsChange]);

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

  // 냉장고 재료 선택 변경 (UseRecipe에서 사용할 재료 선택)
  const handleFridgeItemSelection = (
    ingredientId: string,
    fridgeItem: FridgeItem,
    isAlternative: boolean,
  ) => {
    const updatedIngredients = enhancedIngredients.map(ingredient => {
      if (ingredient.id === ingredientId) {
        return {
          ...ingredient,
          selectedFridgeItem: fridgeItem,
          isAlternativeSelected: isAlternative,
        };
      }
      return ingredient;
    });

    setEnhancedIngredients(updatedIngredients);
    onEnhancedIngredientsChange?.(updatedIngredients);
  };

  // 재료 상태 동그라미
  const getStatusCircle = (ingredient: EnhancedIngredient) => {
    if (ingredient.isAvailable) {
      return <Icon name={'check-circle'} size={24} color={'limegreen'} />; // 초록
    } else if (ingredient.alternatives.length > 0) {
      return <Icon name={'check-circle'} size={24} color={'#fdaa26'} />; // 주황
    }
    return <Icon name={'cancel'} size={24} color={'tomato'} />; // 빨강
  };

  // 대체재 섹션 렌더링
  const renderAlternatives = (ingredient: EnhancedIngredient) => {
    if (!expandedIngredients.has(ingredient.id)) {
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
                onPress={() =>
                  handleFridgeItemSelection(ingredient.id, item, false)
                }
              >
                <View style={styles.alternativeInfo}>
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
                    {ingredient.selectedFridgeItem?.id === item.id &&
                      !ingredient.isAlternativeSelected && (
                        <Icon name="check-circle" size={20} color="#4CAF50" />
                      )}
                  </Text>
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
                  handleFridgeItemSelection(
                    ingredient.id,
                    alternative.fridgeItem,
                    true,
                  )
                }
              >
                <View style={styles.alternativeInfo}>
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
                    {ingredient.selectedFridgeItem?.id ===
                      alternative.fridgeItem.id &&
                      ingredient.isAlternativeSelected && (
                        <Icon name="check-circle" size={20} color="#FF9800" />
                      )}
                  </Text>
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

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>재료</Text>
        {isEditMode && (
          <TouchableOpacity style={styles.addButton} onPress={onAddIngredient}>
            <Icon name="add" size={20} color="#29a448ff" />
            <Text style={styles.addButtonText}>재료 추가</Text>
          </TouchableOpacity>
        )}
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#666"
            style={{ marginLeft: 8 }}
          />
        )}
      </View>

      {enhancedIngredients.map((ingredient, _index) => (
        <View key={ingredient.id} style={styles.ingredientItem}>
          {isEditMode ? (
            // 편집 모드
            <View style={styles.ingredientEditRow}>
              <TextInput
                style={[styles.ingredientInput, styles.ingredientName]}
                value={ingredient.name}
                onChangeText={text =>
                  onUpdateIngredient(ingredient.id, 'name', text)
                }
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
                onChangeText={text =>
                  onUpdateIngredient(ingredient.id, 'unit', text)
                }
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
          ) : (
            // 조회 모드
            <>
              <TouchableOpacity
                style={styles.ingredientRow}
                onPress={() => toggleIngredientExpansion(ingredient.id)}
                disabled={
                  ingredient.exactMatches.length === 0 &&
                  ingredient.alternatives.length === 0
                }
              >
                <View style={styles.ingredientMainInfo}>
                  {fridgeId && !isLoading && <>{getStatusCircle(ingredient)}</>}
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
                    name={
                      expandedIngredients.has(ingredient.id)
                        ? 'expand-less'
                        : 'expand-more'
                    }
                    size={24}
                    color="#666"
                  />
                )}
              </TouchableOpacity>
              {renderAlternatives(ingredient)}
            </>
          )}
        </View>
      ))}

      {/* 아이콘 안내 */}
      {!isEditMode && fridgeId && !isLoading && (
        <View style={styles.ingredientLegend}>
          <View style={styles.legendItem}>
            <Icon name={'check-circle'} size={24} color={'limegreen'} />
            <Text style={styles.legendText}> 식재료 보유 중</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name={'check-circle'} size={24} color={'#fdb526'} />
            <Text style={styles.legendText}> 대체 가능 식재료 보유 중</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name={'cancel'} size={24} color={'tomato'} />
            <Text style={styles.legendText}> 보유하지 않은 식재료</Text>
          </View>
        </View>
      )}
    </View>
  );
};
