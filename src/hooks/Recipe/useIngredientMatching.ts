import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  getFridgeItemsByFridgeId,
  FridgeItem,
} from '../../utils/fridgeStorage';
import { Recipe } from '../../screens/RecipeScreen/RecipeNavigator';
import { MatchedIngredientSeparate } from '../../types';

export const useIngredientMatching = (recipe: Recipe, fridgeId: number) => {
  const [matchedIngredients, setMatchedIngredients] = useState<
    MatchedIngredientSeparate[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // 고급 문자열 매칭 함수들
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
  };
};
