// hooks/Recipe/useIngredientMatching.ts 향상된 버전
import { useState, useCallback, useEffect } from 'react';
import {
  getFridgeItemsByFridgeId,
  FridgeItem,
} from '../../utils/fridgeStorage';
import {
  Recipe,
  RecipeIngredient,
} from '../../screens/RecipeScreen/RecipeNavigator';
import { MatchedIngredientSeparate } from '../../types';

// 대체재 매핑 데이터
const ALTERNATIVE_MAPPING: {
  [key: string]: Array<{ name: string }>;
} = {
  소시지: [{ name: '부어스트 소시지' }, { name: '다짐육' }],
  양파: [{ name: '적양파' }, { name: '대파' }],
  적양파: [{ name: '양파' }],
  당근: [{ name: '미니 당근' }, { name: '노랑 파프리카' }],
  '미니 당근': [{ name: '당근' }, { name: '노랑 파프리카' }],
  파프리카: [{ name: '노랑 파프리카' }, { name: '미니 당근' }],
  '노랑 파프리카': [{ name: '파프리카' }, { name: '미니 당근' }],
  양배추: [{ name: '배추' }],
  배추: [{ name: '양배추' }],
  양상추: [{ name: '양배추' }],
};

// EnhancedIngredient 타입
export interface EnhancedIngredient extends RecipeIngredient {
  isAvailable: boolean;
  exactMatches: FridgeItem[];
  alternatives: Array<{
    fridgeItem: FridgeItem;
    reason: string;
  }>;
  selectedFridgeItem?: FridgeItem;
  isAlternativeSelected?: boolean;
}

// ConfirmModal 상태 타입
export interface IngredientMatchingModalState {
  errorModalVisible: boolean;
  errorMessage: string;
  setErrorModalVisible: (visible: boolean) => void;
}

interface UseIngredientMatchingProps {
  recipe?: Recipe;
  ingredients?: RecipeIngredient[];
  fridgeId?: number;
  isEditMode?: boolean;
  onEnhancedIngredientsChange?: (ingredients: EnhancedIngredient[]) => void;
}

interface UseIngredientMatchingReturn {
  // 기존 반환값들
  matchedIngredients: MatchedIngredientSeparate[];
  setMatchedIngredients: React.Dispatch<
    React.SetStateAction<MatchedIngredientSeparate[]>
  >;
  isLoading: boolean;
  updateUserQuantity: (index: number, quantity: number) => void;
  updateMaxUserQuantity: (index: number, maxQuantity: number) => void;
  loadIngredients: () => void;
  loadFromEnhancedIngredients: (
    enhancedIngredients: EnhancedIngredient[],
  ) => void;

  // IngredientsSection용 반환값들
  enhancedIngredients: EnhancedIngredient[];
  handleFridgeItemSelection: (
    ingredientId: number,
    fridgeItem: FridgeItem,
    isAlternative: boolean,
  ) => void;

  // 모달 상태
  modalState: IngredientMatchingModalState;
}

export const useIngredientMatching = (
  props: UseIngredientMatchingProps,
): UseIngredientMatchingReturn => {
  const {
    recipe,
    ingredients,
    fridgeId,
    isEditMode,
    onEnhancedIngredientsChange,
  } = props;

  // 기존 상태들
  const [matchedIngredients, setMatchedIngredients] = useState<
    MatchedIngredientSeparate[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // IngredientsSection용 상태들
  const [enhancedIngredients, setEnhancedIngredients] = useState<
    EnhancedIngredient[]
  >([]);

  // ConfirmModal 상태들
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  // 대체재 찾기 함수
  const findAlternatives = (
    recipeName: string,
    fridgeItems: FridgeItem[],
  ): Array<{ fridgeItem: FridgeItem; reason: string }> => {
    const alternatives = [];
    const alternativeOptions = ALTERNATIVE_MAPPING[recipeName] || [];

    for (const alt of alternativeOptions) {
      const matches = findAllMatches(alt.name, fridgeItems);
      for (const match of matches) {
        alternatives.push({
          fridgeItem: match,
          reason: alt.reason,
        });
      }
    }

    return alternatives;
  };

  // 기존 로드 함수 (Recipe 타입용)
  const loadIngredients = useCallback(async () => {
    if (!recipe || !fridgeId) return;

    try {
      setIsLoading(true);
      const fridgeIngredients = await getFridgeItemsByFridgeId(fridgeId);

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
            userInputQuantity: 0,
            maxUserQuantity: 0,
            isDeducted: false,
          });
        } else {
          fridgeOptions.forEach((option, index) => {
            const availableQuantity = option.quantity || 1;

            matched.push({
              recipeIngredient: recipeIng,
              fridgeIngredient: option,
              isAvailable: true,
              userInputQuantity: 0,
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
      // console.error('냉장고 재료 로드 실패:', error);
      setErrorMessage('냉장고 정보를 불러올 수 없습니다.');
      setErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [recipe, fridgeId]);

  // IngredientsSection용 enhanced ingredients 로드 함수
  const loadEnhancedIngredients = useCallback(async () => {
    if (!fridgeId || !ingredients || ingredients.length === 0 || isEditMode) {
      const basicIngredients = (ingredients || []).map(ing => ({
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
      const fridgeItems = await getFridgeItemsByFridgeId(fridgeId);

      const enhanced = ingredients.map(ingredient => {
        const exactMatches = findAllMatches(ingredient.name, fridgeItems);
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
      onEnhancedIngredientsChange?.(enhanced);
    } catch (error) {
      // console.error('에러 발생:', error);
      const errorIngredients = (ingredients || []).map(ing => ({
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
  }, [ingredients, fridgeId, isEditMode, onEnhancedIngredientsChange]);

  // 냉장고 재료 선택 변경 함수
  const handleFridgeItemSelection = useCallback(
    (ingredientId: number, fridgeItem: FridgeItem, isAlternative: boolean) => {
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
    },
    [enhancedIngredients, onEnhancedIngredientsChange],
  );

  // ingredients 배열이 변경될 때 enhanced ingredients 로드
  useEffect(() => {
    if (ingredients) {
      loadEnhancedIngredients();
    }
  }, [loadEnhancedIngredients]);

  // 향상된 재료 데이터를 기반으로 매칭 데이터 생성
  const loadFromEnhancedIngredients = useCallback(
    (enhancedIngredients: EnhancedIngredient[]) => {
      try {
        setIsLoading(true);
        const matched: MatchedIngredientSeparate[] = [];

        enhancedIngredients.forEach(ingredient => {
          // 선택된 냉장고 재료가 있는 경우 (초록/주황 상태)
          // 선택된 냉장고 재료가 있는 경우 (초록/주황 상태)
          if (ingredient.selectedFridgeItem) {
            const availableQuantity =
              ingredient.selectedFridgeItem.quantity || 1;

            matched.push({
              recipeIngredient: {
                name: ingredient.selectedFridgeItem.name,
                quantity: ingredient.quantity,
                unit:
                  ingredient.unit || ingredient.selectedFridgeItem.unit || '개', // ✅ unit 추가
              },
              fridgeIngredient: ingredient.selectedFridgeItem,
              isAvailable: true,
              userInputQuantity: 0,
              maxUserQuantity: availableQuantity,
              isDeducted: false,
              isAlternativeUsed: ingredient.isAlternativeSelected,
              originalRecipeName: ingredient.isAlternativeSelected
                ? ingredient.name
                : undefined,
            });
          } else {
            // 냉장고에 없는 재료 (빨간색 상태)
            matched.push({
              recipeIngredient: {
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit || '개', // ✅ unit 추가
              },
              fridgeIngredient: null,
              isAvailable: false,
              userInputQuantity: 0,
              maxUserQuantity: 0,
              isDeducted: false,
            });
          }
        });

        setMatchedIngredients(matched);
      } catch (error) {
        // console.error('향상된 재료 데이터 로드 실패:', error);
        setErrorMessage('재료 정보를 불러올 수 없습니다.');
        setErrorModalVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateUserQuantity = useCallback((index: number, quantity: number) => {
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

  const modalState: IngredientMatchingModalState = {
    errorModalVisible,
    errorMessage,
    setErrorModalVisible,
  };

  return {
    // 기존 반환값들
    matchedIngredients,
    setMatchedIngredients,
    isLoading,
    updateUserQuantity,
    updateMaxUserQuantity,
    loadIngredients,
    loadFromEnhancedIngredients,

    // IngredientsSection용 반환값들
    enhancedIngredients,
    handleFridgeItemSelection,

    // 모달 상태
    modalState,
  };
};
