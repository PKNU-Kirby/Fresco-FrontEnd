// utils/recipeAvailabilityUtils.ts
import { getFridgeItemsByFridgeId, FridgeItem } from '../utils/fridgeStorage';
import { Recipe } from '../screens/RecipeScreen/RecipeNavigator';

// 대체재 매핑 (useIngredientMatching에서 가져옴)
const ALTERNATIVE_MAPPING: { [key: string]: Array<{ name: string }> } = {
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

// 문자열 정규화 (useIngredientMatching에서 가져옴)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^\w가-힣]/g, '');
};

// 매칭 찾기 (useIngredientMatching에서 가져옴)
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

// 대체재 찾기
const findAlternatives = (
  recipeName: string,
  fridgeItems: FridgeItem[],
): FridgeItem[] => {
  const alternatives = [];
  const alternativeOptions = ALTERNATIVE_MAPPING[recipeName] || [];

  for (const alt of alternativeOptions) {
    const matches = findAllMatches(alt.name, fridgeItems);
    alternatives.push(...matches);
  }

  return alternatives;
};

// 레시피 조리 가능 여부 계산
export interface RecipeAvailabilityInfo {
  availableIngredientsCount: number;
  totalIngredientsCount: number;
  canMakeWithFridge: boolean;
  missingIngredients: string[];
  availableIngredients: Array<{
    name: string;
    isAlternative: boolean;
    fridgeItemName?: string;
  }>;
}

export const calculateRecipeAvailability = async (
  recipe: Recipe,
  fridgeId: string,
): Promise<RecipeAvailabilityInfo> => {
  try {
    const fridgeItems = await getFridgeItemsByFridgeId(fridgeId);

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return {
        availableIngredientsCount: 0,
        totalIngredientsCount: 0,
        canMakeWithFridge: false,
        missingIngredients: [],
        availableIngredients: [],
      };
    }

    let availableCount = 0;
    const missingIngredients: string[] = [];
    const availableIngredients: Array<{
      name: string;
      isAlternative: boolean;
      fridgeItemName?: string;
    }> = [];

    for (const ingredient of recipe.ingredients) {
      // 1. 정확한 매칭 찾기
      const exactMatches = findAllMatches(ingredient.name, fridgeItems);

      if (exactMatches.length > 0) {
        availableCount++;
        availableIngredients.push({
          name: ingredient.name,
          isAlternative: false,
          fridgeItemName: exactMatches[0].name,
        });
      } else {
        // 2. 대체재 찾기
        const alternatives = findAlternatives(ingredient.name, fridgeItems);

        if (alternatives.length > 0) {
          availableCount++;
          availableIngredients.push({
            name: ingredient.name,
            isAlternative: true,
            fridgeItemName: alternatives[0].name,
          });
        } else {
          missingIngredients.push(ingredient.name);
        }
      }
    }

    const totalCount = recipe.ingredients.length;
    const canMake = availableCount === totalCount;

    return {
      availableIngredientsCount: availableCount,
      totalIngredientsCount: totalCount,
      canMakeWithFridge: canMake,
      missingIngredients,
      availableIngredients,
    };
  } catch (error) {
    console.error('레시피 가용성 계산 실패:', error);
    return {
      availableIngredientsCount: 0,
      totalIngredientsCount: recipe.ingredients?.length || 0,
      canMakeWithFridge: false,
      missingIngredients: recipe.ingredients?.map(ing => ing.name) || [],
      availableIngredients: [],
    };
  }
};

// 여러 레시피의 가용성을 한번에 계산
export const calculateMultipleRecipeAvailability = async (
  recipes: Recipe[],
  fridgeId: string,
): Promise<Map<string, RecipeAvailabilityInfo>> => {
  const results = new Map<string, RecipeAvailabilityInfo>();

  // 냉장고 아이템은 한번만 불러오기
  const fridgeItems = await getFridgeItemsByFridgeId(fridgeId);

  for (const recipe of recipes) {
    try {
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        results.set(recipe.id, {
          availableIngredientsCount: 0,
          totalIngredientsCount: 0,
          canMakeWithFridge: false,
          missingIngredients: [],
          availableIngredients: [],
        });
        continue;
      }

      let availableCount = 0;
      const missingIngredients: string[] = [];
      const availableIngredients: Array<{
        name: string;
        isAlternative: boolean;
        fridgeItemName?: string;
      }> = [];

      for (const ingredient of recipe.ingredients) {
        const exactMatches = findAllMatches(ingredient.name, fridgeItems);

        if (exactMatches.length > 0) {
          availableCount++;
          availableIngredients.push({
            name: ingredient.name,
            isAlternative: false,
            fridgeItemName: exactMatches[0].name,
          });
        } else {
          const alternatives = findAlternatives(ingredient.name, fridgeItems);

          if (alternatives.length > 0) {
            availableCount++;
            availableIngredients.push({
              name: ingredient.name,
              isAlternative: true,
              fridgeItemName: alternatives[0].name,
            });
          } else {
            missingIngredients.push(ingredient.name);
          }
        }
      }

      const totalCount = recipe.ingredients.length;
      const canMake = availableCount === totalCount;

      results.set(recipe.id, {
        availableIngredientsCount: availableCount,
        totalIngredientsCount: totalCount,
        canMakeWithFridge: canMake,
        missingIngredients,
        availableIngredients,
      });
    } catch (error) {
      console.error(`레시피 ${recipe.id} 가용성 계산 실패:`, error);
      results.set(recipe.id, {
        availableIngredientsCount: 0,
        totalIngredientsCount: recipe.ingredients?.length || 0,
        canMakeWithFridge: false,
        missingIngredients: recipe.ingredients?.map(ing => ing.name) || [],
        availableIngredients: [],
      });
    }
  }

  return results;
};
