// hooks/Recipe/useIngredientMatching.ts 향상된 버전
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  getFridgeItemsByFridgeId,
  FridgeItem,
} from '../../utils/fridgeStorage';
import { Recipe } from '../../screens/RecipeScreen/RecipeNavigator';
import { MatchedIngredientSeparate } from '../../types';

// EnhancedIngredient 타입 (IngredientsSection에서 가져옴)
interface EnhancedIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  isAvailable: boolean;
  exactMatches: FridgeItem[];
  alternatives: Array<{
    fridgeItem: FridgeItem;
    reason: string;
  }>;
  selectedFridgeItem?: FridgeItem;
  isAlternativeSelected?: boolean;
}

interface UseIngredientMatchingReturn {
  matchedIngredients: MatchedIngredientSeparate[];
  setMatchedIngredients: React.Dispatch<
    React.SetStateAction<MatchedIngredientSeparate[]>
  >;
  isLoading: boolean;
  updateUserQuantity: (index: number, quantity: string) => void;
  updateMaxUserQuantity: (index: number, maxQuantity: number) => void;
  loadIngredients: () => void;
  // 새로 추가: 향상된 재료 데이터로 매칭하는 함수
  loadFromEnhancedIngredients: (
    enhancedIngredients: EnhancedIngredient[],
  ) => void;
}

export const useIngredientMatching = (
  recipe: Recipe,
  fridgeId: number,
): UseIngredientMatchingReturn => {
  const [matchedIngredients, setMatchedIngredients] = useState<
    MatchedIngredientSeparate[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // 고급 문자열 매칭 함수들 (기존과 동일)
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^\w가-힣]/g, '');
  };

  const findAllMatches = (
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

  // 기존 로드 함수 (기존 로직 유지)
  const loadIngredients = useCallback(async () => {
    try {
      setIsLoading(true);
      const stringFridgeId = fridgeId.toString();
      const fridgeIngredients = await getFridgeItemsByFridgeId(stringFridgeId);

      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        setMatchedIngredients([]);
        return;
      }

      const matched: MatchedIngredientSeparate[] = [];

      recipe.ingredients.forEach(recipeIng => {
        const fridgeOptions = findAllMatches(recipeIng.name, fridgeIngredients);

        if (fridgeOptions.length === 0) {
          matched.push({
            recipeIngredient: recipeIng,
            fridgeIngredient: null,
            isAvailable: false,
            userInputQuantity: '0',
            maxUserQuantity: 0,
            isDeducted: false,
          });
        } else {
          fridgeOptions.forEach((option, index) => {
            const availableQuantity = parseFloat(option.quantity) || 1;

            matched.push({
              recipeIngredient: recipeIng,
              fridgeIngredient: option,
              isAvailable: true,
              userInputQuantity: '0',
              maxUserQuantity: availableQuantity,
              isDeducted: false,
              isMultipleOption: fridgeOptions.length > 1,
              optionIndex: index + 1,
            });
          });
        }
      });

      setMatchedIngredients(matched);
    } catch (error) {
      console.error('냉장고 재료 로드 실패:', error);
      Alert.alert('오류', '냉장고 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [recipe, fridgeId]);

  // 새로운 함수: 향상된 재료 데이터를 기반으로 매칭 데이터 생성
  const loadFromEnhancedIngredients = useCallback(
    (enhancedIngredients: EnhancedIngredient[]) => {
      try {
        setIsLoading(true);
        const matched: MatchedIngredientSeparate[] = [];

        enhancedIngredients.forEach(ingredient => {
          // 선택된 냉장고 재료가 있는 경우 (초록/주황 상태)
          if (ingredient.selectedFridgeItem) {
            const availableQuantity =
              parseFloat(ingredient.selectedFridgeItem.quantity) || 1;

            matched.push({
              recipeIngredient: {
                name: ingredient.selectedFridgeItem.name, // 실제 냉장고 재료명 사용
                quantity: ingredient.quantity, // 레시피에서 필요한 양
              },
              fridgeIngredient: ingredient.selectedFridgeItem,
              isAvailable: true,
              userInputQuantity: '0',
              maxUserQuantity: availableQuantity,
              isDeducted: false,
              // 대체재로 선택된 경우 표시
              isAlternativeUsed: ingredient.isAlternativeSelected,
              originalRecipeName: ingredient.isAlternativeSelected
                ? ingredient.name
                : undefined,
            });
          } else {
            // 냉장고에 없는 재료 (빨간색 상태) - 장바구니 담기용
            matched.push({
              recipeIngredient: {
                name: ingredient.name,
                quantity: ingredient.quantity,
              },
              fridgeIngredient: null,
              isAvailable: false,
              userInputQuantity: '0',
              maxUserQuantity: 0,
              isDeducted: false,
            });
          }
        });

        setMatchedIngredients(matched);
      } catch (error) {
        console.error('향상된 재료 데이터 로드 실패:', error);
        Alert.alert('오류', '재료 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateUserQuantity = useCallback((index: number, quantity: string) => {
    setMatchedIngredients(prev => {
      const updated = [...prev];
      updated[index].userInputQuantity = quantity;
      return updated;
    });
  }, []);

  const updateMaxUserQuantity = useCallback(
    (index: number, newMaxQuantity: number) => {
      setMatchedIngredients(prev => {
        const updated = [...prev];
        updated[index].maxUserQuantity = newMaxQuantity;
        return updated;
      });
    },
    [],
  );

  return {
    matchedIngredients,
    setMatchedIngredients,
    isLoading,
    updateUserQuantity,
    updateMaxUserQuantity,
    loadIngredients,
    loadFromEnhancedIngredients, // 새로운 함수 추가
  };
};
