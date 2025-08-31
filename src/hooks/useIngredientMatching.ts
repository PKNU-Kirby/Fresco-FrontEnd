import { useEffect, useState } from 'react';
import { RecipeIngredient } from '../../screens/RecipeScreen/RecipeNavigator';
import {
  getFridgeItemsByFridgeId,
  FridgeItem,
} from '../../utils/fridgeStorage';
import { EnhancedIngredient } from './IngredientsSection';

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

interface UseIngredientMatchingProps {
  ingredients: RecipeIngredient[];
  fridgeId?: number;
  isEditMode: boolean;
  onEnhancedIngredientsChange?: (ingredients: EnhancedIngredient[]) => void;
}

export const useIngredientMatching = ({
  ingredients,
  fridgeId,
  isEditMode,
  onEnhancedIngredientsChange,
}: UseIngredientMatchingProps) => {
  const [enhancedIngredients, setEnhancedIngredients] = useState<
    EnhancedIngredient[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // 냉장고 재료 선택 변경
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
        onEnhancedIngredientsChange?.(basicIngredients);
        return;
      }

      setIsLoading(true);

      try {
        const fridgeItems = await getFridgeItemsByFridgeId(fridgeId.toString());

        const enhanced = ingredients.map(ingredient => {
          const exactMatches = findMatches(ingredient.name, fridgeItems);
          const alternatives =
            exactMatches.length === 0
              ? findAlternatives(ingredient.name, fridgeItems)
              : [];

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
        onEnhancedIngredientsChange?.(errorIngredients);
      } finally {
        setIsLoading(false);
      }
    };

    loadIngredientInfo();
  }, [ingredients, fridgeId, isEditMode, onEnhancedIngredientsChange]);

  return {
    enhancedIngredients,
    isLoading,
    handleFridgeItemSelection,
  };
};
