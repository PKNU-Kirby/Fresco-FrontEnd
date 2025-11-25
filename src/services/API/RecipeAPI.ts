import { ApiService } from '../apiServices';
import { Recipe } from '../../utils/AsyncStorageUtils';
import { AsyncStorageService } from '../AsyncStorageService';

interface RecipeIngredient {
  id: string;
  ingredientId?: number;
  name: string;
  quantity: number;
  unit: string;
}

// API 응답의 Recipe 타입

interface ApiRecipe {
  recipeId: number;
  title: string;
  favorite: boolean;
  ingredients?: Array<{
    ingredientId?: number;
    name: string;
    quantity: number;
    unit: string;
    instead?: string; // ✅ 대체재 필드 추가
  }>;
  steps?: string[];
  referenceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 레시피 생성 요청 타입
interface CreateRecipeRequest {
  title: string;
  ingredients: Array<{
    ingredientName: string;
    quantity: number;
    unit: string;
  }>;
  steps: string | string[];
  url?: string;
}

// 레시피 수정 요청 타입
interface UpdateRecipeRequest {
  title?: string;
  ingredients?: Array<{
    ingredientName: string;
    quantity: number;
    unit: string;
  }>;
  steps?: string | string[];
  url?: string;
}

// 레시피 공유 요청 타입
interface ShareRecipeRequest {
  refrigeratorId: number;
  recipeId: number;
}

// 재료 사용 요청 타입
interface UseIngredientsRequest {
  ingredients: Array<{
    ingredientId: number;
    usedQuantity: number;
  }>;
}
// RecipeAPI.ts 상단에 타입 추가
interface AIRecipeResponse {
  title: string;
  ingredients: Array<{
    ingredientName: string;
    quantity: number;
    unit: string;
  }>;
  steps: string[];
  substitutions?: Array<{
    original: string;
    substitute: string;
  }>;
}

interface SaveAIRecipeResponse {
  code: string;
  message: string;
  result: {
    recipeId: number;
    title: string;
    steps: string;
    url: string | null;
    ingredients: Array<{
      recipeIngredientId: number;
      name: string;
      quantity: number;
      unit: string;
      instead: string | null;
    }>;
  };
}

// ============ 타입 변환 유틸리티 ============

class RecipeTypeConverter {
  static apiToFrontend(apiRecipe: any): Recipe {
    // console.log('🔥 API 원본 데이터:', apiRecipe);

    const converted = {
      id: apiRecipe.recipeId,
      title: apiRecipe.title,
      ingredients:
        apiRecipe.ingredients?.map((ing: any) => ({
          id: ing.recipeIngredientId || Date.now(),
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })) || [],
      // ✅ steps 처리 - 문자열을 배열로 변환
      steps:
        typeof apiRecipe.steps === 'string'
          ? apiRecipe.steps
              .split('\n')
              .filter((step: string) => step.trim().length > 0)
          : Array.isArray(apiRecipe.steps)
          ? apiRecipe.steps
          : [],
      // ✅ url 필드명 수정
      referenceUrl: apiRecipe.url || apiRecipe.referenceUrl || '',
      createdAt: apiRecipe.createdAt || new Date().toISOString(),
    };
    return converted;
  }
}

// ============ RecipeAPI 서비스 ============

export class RecipeAPI {
  // 레시피 목록 조회
  static async getRecipeList(): Promise<Recipe[]> {
    try {
      const apiRecipes = await ApiService.apiCall<ApiRecipe[]>('/recipe/list');
      return apiRecipes.map(RecipeTypeConverter.apiToFrontend);
    } catch (error: any) {
      // console.error('레시피 목록 조회 실패:', error);

      // 권한 에러 -> 빈 배열 반환
      if (
        error.message?.includes('권한') ||
        error.message?.includes('Permission')
      ) {
        // console.warn('⚠️ 레시피 목록 접근 권한 없음 - 빈 배열 반환');
        return [];
      }

      throw error;
    }
  }

  // 즐겨찾기 레시피 목록 조회
  static async getFavoriteRecipes(): Promise<Recipe[]> {
    try {
      const apiRecipes = await ApiService.apiCall<ApiRecipe[]>(
        '/recipe/favorites',
      );
      return apiRecipes.map(RecipeTypeConverter.apiToFrontend);
    } catch (error: any) {
      // console.error('즐겨찾기 레시피 조회 실패:', error);

      if (
        error.message?.includes('권한') ||
        error.message?.includes('Permission')
      ) {
        // console.warn('⚠️ 즐겨찾기 접근 권한 없음 - 빈 배열 반환');
        return [];
      }

      throw error;
    }
  }

  // 공유된 레시피 목록 조회
  static async getSharedRecipes(refrigeratorId: number): Promise<Recipe[]> {
    try {
      const token = await AsyncStorageService.getAuthToken();
      /* console.log('-> 공유 레시피 조회 시작:', {
        refrigeratorId,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
      });
      */

      const apiRecipes = await ApiService.apiCall<ApiRecipe[]>(
        `/recipe/share/${refrigeratorId}`,
      );

      // console.log('O 공유 레시피 조회 성공:', apiRecipes.length);
      return apiRecipes.map(RecipeTypeConverter.apiToFrontend);
    } catch (error: any) {
      /*
      console.error('X 공유 레시피 조회 실패:', {
        error: error.message,
        refrigeratorId,
      });
      */

      if (
        error.message?.includes('권한') ||
        error.message?.includes('Permission')
      ) {
        // console.warn('!! 공유 레시피 접근 권한 없음 - 빈 배열 반환');
        return [];
      }

      throw error;
    }
  }

  // 레시피 상세 조회
  static async getRecipeDetail(recipeId: number): Promise<
    Recipe & {
      ingredients?: Array<RecipeIngredient & { instead?: string }>;
    }
  > {
    try {
      // console.log('🔍 레시피 상세 조회:', recipeId);
      const apiRecipe = await ApiService.apiCall<ApiRecipe>(
        `/recipe/detail/${recipeId}`,
      );
      const recipe = RecipeTypeConverter.apiToFrontend(apiRecipe);
      return {
        ...recipe,
        ingredients: apiRecipe.ingredients?.map((ing, index) => ({
          id: String(ing.ingredientId || `temp_${recipeId}_${index}`),
          ingredientId: ing.ingredientId,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          instead: ing.instead,
        })),
      };
    } catch (error) {
      // console.error('레시피 상세 조회 실패:', error);
      throw error;
    }
  }

  // 레시피 생성
  // RecipeAPI.ts의 createRecipe 함수 (195-207번째 줄 근처)
  static async createRecipe(recipe: any): Promise<Recipe> {
    try {
      const requestData = {
        title: recipe.title,
        ingredients:
          recipe.ingredients?.map((ing: any) => ({
            ingredientName: ing.ingredientName || ing.name,
            quantity: ing.quantity || 0,
            unit: ing.unit || '',
          })) || [],
        steps: Array.isArray(recipe.steps)
          ? recipe.steps.join('\n')
          : recipe.steps || '',
        url: recipe.url || recipe.referenceUrl || '',
      };

      /*
      console.log(
        '🔥 RecipeAPI - 보낼 데이터:',
        JSON.stringify(requestData, null, 2),
      );
      */

      const apiRecipe = await ApiService.apiCall<ApiRecipe>('/recipe/create', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      return RecipeTypeConverter.apiToFrontend(apiRecipe);
    } catch (error) {
      // console.error('레시피 생성 실패:', error);
      throw error;
    }
  }
  // 레시피 수정
  static async updateRecipe(
    recipeId: number, // ← string으로 변경
    updates: Partial<Recipe>,
  ): Promise<Recipe> {
    try {
      // console.log('🔥 RecipeAPI.updateRecipe 시작:', { recipeId, updates });

      const requestData: UpdateRecipeRequest = {
        title: updates.title,
        ingredients: updates.ingredients?.map(ing => ({
          ingredientName: ing.name || ing.ingredientName || '',
          quantity: ing.quantity || 0,
          unit: ing.unit || '',
        })),
        steps: Array.isArray(updates.steps)
          ? updates.steps.join('\n')
          : updates.steps || '',
        url: updates.referenceUrl,
      };

      // console.log('🔥 요청 데이터:', requestData);

      const apiRecipe = await ApiService.apiCall<ApiRecipe>(
        `/recipe/replace/${recipeId}`,
        {
          method: 'PUT',
          body: JSON.stringify(requestData),
        },
      );

      // console.log('🔥 API 응답:', apiRecipe);
      const convertedRecipe = RecipeTypeConverter.apiToFrontend(apiRecipe);
      // console.log('🔥 변환된 레시피:', convertedRecipe);

      return convertedRecipe;
    } catch (error) {
      // console.error('레시피 수정 실패:', error);
      throw error;
    }
  }
  // 레시피 삭제
  static async deleteRecipe(recipeId: number): Promise<void> {
    try {
      await ApiService.apiCall<void>(`/recipe/delete/${recipeId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // console.error('레시피 삭제 실패:', error);
      throw error;
    }
  }

  // 즐겨찾기 토글
  static async toggleFavorite(
    recipeId: number,
  ): Promise<{ favorite: boolean }> {
    try {
      const result = await ApiService.apiCall<{ favorite: boolean }>(
        `/recipe/favorite/toggle/${recipeId}`,
        {
          method: 'POST',
        },
      );

      return result;
    } catch (error) {
      // console.error('즐겨찾기 토글 실패:', error);
      throw error;
    }
  }

  // 레시피 공유 (특정 냉장고에)
  static async shareRecipe(
    recipeId: number,
    refrigeratorId: number,
  ): Promise<void> {
    try {
      const requestData: ShareRecipeRequest = {
        refrigeratorId: refrigeratorId,
        recipeId: recipeId,
      };

      await ApiService.apiCall<void>(
        `/recipe/share/toggle/${refrigeratorId}/${recipeId}`,
        {
          method: 'POST',
          body: JSON.stringify(requestData),
        },
      );
    } catch (error) {
      // console.error('레시피 공유 실패:', error);
      throw error;
    }
  }

  // 레시피 검색
  // RecipeAPI.ts

  // 레시피 검색
  static async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      const apiRecipes = await ApiService.apiCall<ApiRecipe[]>(
        `/recipe/search?word=${encodeURIComponent(query)}`, // ✅ query → word
      );

      return apiRecipes.map(RecipeTypeConverter.apiToFrontend);
    } catch (error) {
      // console.error('레시피 검색 실패:', error);
      throw error;
    }
  }

  // 소비기한 임박 재료 기반 레시피 조회
  static async getExpiryRecipes(refrigeratorId: number): Promise<{
    refrigeratorId: number;
    day1: string[];
    day2: string[];
    day3: string[];
  }> {
    try {
      return await ApiService.apiCall(`/recipe/expiry/${refrigeratorId}`);
    } catch (error) {
      // console.error('소비기한 레시피 조회 실패:', error);
      throw error;
    }
  }

  // 재료 사용 (조리 시)
  static async useIngredients(
    ingredients: Array<{ ingredientId: number; usedQuantity: number }>,
  ): Promise<void> {
    try {
      const requestData: UseIngredientsRequest = { ingredients };

      await ApiService.apiCall<void>('/recipe/cook/use-ingredients', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
    } catch (error) {
      // console.error('재료 사용 처리 실패:', error);
      throw error;
    }
  }

  // 조리 단계별 재고 조회 (특정 냉장고)
  static async getCookStocks(refrigeratorId: number): Promise<any> {
    try {
      return await ApiService.apiCall(`/recipe/cook/stocks/${refrigeratorId}`);
    } catch (error) {
      // console.error('조리 재고 조회 실패:', error);
      throw error;
    }
  }

  /**
   * AI 레시피 추천
   */
  static async getAIRecipe(prompt: string): Promise<AIRecipeResponse> {
    try {
      // console.log('📤 AI 레시피 요청:', prompt);
      const result = await ApiService.apiCall<AIRecipeResponse>(
        `/recipe/ai?prompt=${encodeURIComponent(prompt)}`,
        { method: 'GET' },
      );
      // console.log('✅ AI 레시피 추천 성공:', result);
      return result;
    } catch (error: any) {
      // console.error('❌ AI 레시피 추천 실패:', error);
      throw new Error(error.message || 'AI 레시피 생성에 실패했습니다.');
    }
  }

  /**
   * AI 추천 레시피 저장
   */
  static async saveAIRecipe(recipeData: any) {
    try {
      // console.log('📤 AI 레시피 저장 요청:', recipeData);

      const result = await ApiService.apiCall('/recipe/ai/save', {
        method: 'POST',
        body: JSON.stringify(recipeData),
      });

      // console.log('✅ AI 레시피 저장 성공:', result);
      return result;
    } catch (error: any) {
      // console.error('❌ AI 레시피 저장 실패:', error);
      throw new Error(error.message || 'AI 레시피 저장에 실패했습니다.');
    }
  }
}

export default RecipeAPI;
