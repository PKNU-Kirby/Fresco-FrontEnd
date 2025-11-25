// utils/RecipeFridgeUtils.ts
import {
  getFridgeItemsByFridgeId,
  updateFridgeItem,
  FridgeItem,
} from './AsyncStorageUtils';

// 레시피 재료와 냉장고 재료 매칭 결과
export interface IngredientMatchResult {
  recipeName: string;
  recipeQuantity: number;
  fridgeItem?: FridgeItem;
  isAvailable: boolean;
  matchScore: number; // 0-1, 매칭 정확도
}

export class RecipeFridgeUtils {
  // 레시피 재료와 냉장고 재료 매칭
  static async matchRecipeWithFridge(
    recipeIngredients: Array<{ name: string; quantity: number }>,
    fridgeId: string,
  ): Promise<IngredientMatchResult[]> {
    try {
      const fridgeItems = await getFridgeItemsByFridgeId(fridgeId);

      return recipeIngredients.map(recipeIng => {
        const matchResult = this.findBestMatch(recipeIng.name, fridgeItems);

        return {
          recipeName: recipeIng.name,
          recipeQuantity: recipeIng.quantity,
          fridgeItem: matchResult.item,
          isAvailable: matchResult.item ? matchResult.item.quantity > 0 : false,
          matchScore: matchResult.score,
        };
      });
    } catch (error) {
      // console.error('레시피-냉장고 매칭 실패:', error);
      return [];
    }
  }

  // 가장 적합한 냉장고 재료 찾기
  private static findBestMatch(
    recipeName: string,
    fridgeItems: FridgeItem[],
  ): { item?: FridgeItem; score: number } {
    let bestMatch: FridgeItem | undefined;
    let bestScore = 0;

    const normalizedRecipeName = this.normalizeString(recipeName);

    for (const fridgeItem of fridgeItems) {
      const normalizedFridgeName = this.normalizeString(fridgeItem.name);
      const score = this.calculateSimilarity(
        normalizedRecipeName,
        normalizedFridgeName,
      );

      // 정확히 일치하는 경우 즉시 반환
      if (score === 1) {
        return { item: fridgeItem, score: 1 };
      }

      // 더 높은 점수의 아이템 발견
      if (score > bestScore && score > 0.7) {
        // 70% 이상 유사한 경우만
        bestScore = score;
        bestMatch = fridgeItem;
      }
    }

    return { item: bestMatch, score: bestScore };
  }

  // 문자열 정규화 (공백, 특수문자 제거, 소문자 변환)
  private static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, '') // 모든 공백 제거
      .replace(/[^\w가-힣]/g, '') // 특수문자 제거 (한글, 영문, 숫자만 남김)
      .trim();
  }

  // 문자열 유사도 계산 (레벤슈타인 거리 기반)
  private static calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;

    // 부분 문자열 포함 확인
    if (str1.includes(str2) || str2.includes(str1)) {
      const minLength = Math.min(str1.length, str2.length);
      const maxLength = Math.max(str1.length, str2.length);
      return minLength / maxLength;
    }

    // 레벤슈타인 거리 계산
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    return 1 - distance / maxLength;
  }

  // 레벤슈타인 거리 계산
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // 삽입
          matrix[j - 1][i] + 1, // 삭제
          matrix[j - 1][i - 1] + indicator, // 대체
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // 냉장고 재료 차감
  static async deductIngredient(
    fridgeItemId: string,
    deductAmount: number,
  ): Promise<{ success: boolean; newQuantity: number; message: string }> {
    try {
      // 모든 냉장고에서 해당 아이템 찾기 (비효율적이지만 현재 구조상 필요)
      const allFridgeIds = ['1', '2', '3']; // TODO: 실제 냉장고 ID들을 가져오는 로직 필요
      let targetItem: FridgeItem | undefined;

      for (const fId of allFridgeIds) {
        const fridgeItems = await getFridgeItemsByFridgeId(fId);
        targetItem = fridgeItems.find(item => item.id === fridgeItemId);
        if (targetItem) break;
      }

      if (!targetItem) {
        return {
          success: false,
          newQuantity: 0,
          message: '재료를 찾을 수 없습니다.',
        };
      }

      const currentQuantity = targetItem.quantity;

      if (currentQuantity < deductAmount) {
        return {
          success: false,
          newQuantity: currentQuantity,
          message: `수량이 부족합니다. (보유: ${currentQuantity})`,
        };
      }

      const newQuantity = currentQuantity - deductAmount;

      await updateFridgeItem(fridgeItemId, {
        quantity: newQuantity,
      });

      return {
        success: true,
        newQuantity,
        message: `${deductAmount}만큼 차감되었습니다.`,
      };
    } catch (error) {
      // console.error('재료 차감 실패:', error);
      return {
        success: false,
        newQuantity: 0,
        message: '차감 중 오류가 발생했습니다.',
      };
    }
  }

  // 재료 이름 추천 (냉장고에 있는 비슷한 재료들)
  static async getSimilarIngredients(
    recipeName: string,
    fridgeId: string,
    minScore: number = 0.5,
  ): Promise<Array<{ item: FridgeItem; score: number }>> {
    try {
      const fridgeItems = await getFridgeItemsByFridgeId(fridgeId);
      const normalizedRecipeName = this.normalizeString(recipeName);

      const similarItems = fridgeItems
        .map(item => ({
          item,
          score: this.calculateSimilarity(
            normalizedRecipeName,
            this.normalizeString(item.name),
          ),
        }))
        .filter(result => result.score >= minScore && result.item.quantity > 0)
        .sort((a, b) => b.score - a.score);

      return similarItems;
    } catch (error) {
      // console.error('유사 재료 검색 실패:', error);
      return [];
    }
  }

  // 조리 기록 저장 (향후 기능)
  static async saveCookingHistory(
    recipeId: string,
    fridgeId: string,
    usedIngredients: Array<{
      fridgeItemId: string;
      usedAmount: number;
      originalAmount: number;
    }>,
    completedSteps: number,
    totalSteps: number,
  ): Promise<boolean> {
    try {
      // TODO: 조리 기록을 AsyncStorage에 저장
      const cookingRecord = {
        id: Date.now().toString(),
        recipeId,
        fridgeId,
        usedIngredients,
        completedSteps,
        totalSteps,
        completionRate: (completedSteps / totalSteps) * 100,
        cookedAt: new Date().toISOString(),
      };

      console.log('조리 기록 저장:', cookingRecord);
      // await AsyncStorage.setItem(`cooking_history_${cookingRecord.id}`, JSON.stringify(cookingRecord));

      return true;
    } catch (error) {
      // console.error('조리 기록 저장 실패:', error);
      return false;
    }
  }
}
