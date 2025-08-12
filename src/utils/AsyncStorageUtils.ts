// 📂RecipeScreen/utils/AsyncStorageUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../screens/RecipeScreen/RecipeNavigator';

// AsyncStorage 키 상수
export const STORAGE_KEYS = {
  PERSONAL_RECIPES: 'personal_recipes',
  FAVORITE_RECIPE_IDS: 'favorite_recipe_ids',
  SEARCH_HISTORY: 'search_history',
  SHARED_RECIPES: 'shared_recipes',
} as const;

// 🔧 개인 레시피 관련 함수들
export const RecipeStorage = {
  // 개인 레시피 저장
  async savePersonalRecipes(recipes: Recipe[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PERSONAL_RECIPES,
        JSON.stringify(recipes),
      );
    } catch (error) {
      console.error('개인 레시피 저장 실패:', error);
      throw error;
    }
  },

  // 개인 레시피 불러오기
  async getPersonalRecipes(): Promise<Recipe[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PERSONAL_RECIPES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('개인 레시피 불러오기 실패:', error);
      return [];
    }
  },

  // 개인 레시피 추가
  async addPersonalRecipe(recipe: Recipe): Promise<void> {
    try {
      const currentRecipes = await this.getPersonalRecipes();
      const updatedRecipes = [recipe, ...currentRecipes];
      await this.savePersonalRecipes(updatedRecipes);
    } catch (error) {
      console.error('개인 레시피 추가 실패:', error);
      throw error;
    }
  },

  // 개인 레시피 업데이트
  async updatePersonalRecipe(updatedRecipe: Recipe): Promise<void> {
    try {
      const currentRecipes = await this.getPersonalRecipes();
      const updatedRecipes = currentRecipes.map(recipe =>
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe,
      );
      await this.savePersonalRecipes(updatedRecipes);
    } catch (error) {
      console.error('개인 레시피 업데이트 실패:', error);
      throw error;
    }
  },

  // 개인 레시피 삭제
  async deletePersonalRecipe(recipeId: string): Promise<void> {
    try {
      const currentRecipes = await this.getPersonalRecipes();
      const updatedRecipes = currentRecipes.filter(
        recipe => recipe.id !== recipeId,
      );
      await this.savePersonalRecipes(updatedRecipes);
    } catch (error) {
      console.error('개인 레시피 삭제 실패:', error);
      throw error;
    }
  },
};

// 🔧 즐겨찾기 관련 함수들
export const FavoriteStorage = {
  // 즐겨찾기 목록 저장
  async saveFavoriteIds(favoriteIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITE_RECIPE_IDS,
        JSON.stringify(favoriteIds),
      );
    } catch (error) {
      console.error('즐겨찾기 저장 실패:', error);
      throw error;
    }
  },

  // 즐겨찾기 목록 불러오기
  async getFavoriteIds(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(
        STORAGE_KEYS.FAVORITE_RECIPE_IDS,
      );
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('즐겨찾기 불러오기 실패:', error);
      return [];
    }
  },

  // 즐겨찾기 추가
  async addFavorite(recipeId: string): Promise<void> {
    try {
      const currentFavorites = await this.getFavoriteIds();
      if (!currentFavorites.includes(recipeId)) {
        const updatedFavorites = [...currentFavorites, recipeId];
        await this.saveFavoriteIds(updatedFavorites);
      }
    } catch (error) {
      console.error('즐겨찾기 추가 실패:', error);
      throw error;
    }
  },

  // 즐겨찾기 제거
  async removeFavorite(recipeId: string): Promise<void> {
    try {
      const currentFavorites = await this.getFavoriteIds();
      const updatedFavorites = currentFavorites.filter(id => id !== recipeId);
      await this.saveFavoriteIds(updatedFavorites);
    } catch (error) {
      console.error('즐겨찾기 제거 실패:', error);
      throw error;
    }
  },

  // 즐겨찾기 토글
  async toggleFavorite(recipeId: string): Promise<boolean> {
    try {
      const currentFavorites = await this.getFavoriteIds();
      const isFavorite = currentFavorites.includes(recipeId);

      if (isFavorite) {
        await this.removeFavorite(recipeId);
        return false;
      } else {
        await this.addFavorite(recipeId);
        return true;
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      throw error;
    }
  },
};

// 🔧 검색 히스토리 관련 함수들
export const SearchHistoryStorage = {
  // 검색 히스토리 저장
  async saveSearchHistory(history: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SEARCH_HISTORY,
        JSON.stringify(history),
      );
    } catch (error) {
      console.error('검색 히스토리 저장 실패:', error);
      throw error;
    }
  },

  // 검색 히스토리 불러오기
  async getSearchHistory(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('검색 히스토리 불러오기 실패:', error);
      return [];
    }
  },

  // 검색어 추가
  async addSearchQuery(
    query: string,
    maxHistory: number = 6,
  ): Promise<string[]> {
    try {
      const currentHistory = await this.getSearchHistory();
      const newHistory = [
        query,
        ...currentHistory.filter(item => item !== query),
      ].slice(0, maxHistory);

      await this.saveSearchHistory(newHistory);
      return newHistory;
    } catch (error) {
      console.error('검색어 추가 실패:', error);
      return [];
    }
  },

  // 검색 히스토리 항목 삭제
  async removeSearchQuery(query: string): Promise<string[]> {
    try {
      const currentHistory = await this.getSearchHistory();
      const updatedHistory = currentHistory.filter(item => item !== query);
      await this.saveSearchHistory(updatedHistory);
      return updatedHistory;
    } catch (error) {
      console.error('검색 히스토리 항목 삭제 실패:', error);
      return [];
    }
  },

  // 검색 히스토리 전체 삭제
  async clearSearchHistory(): Promise<void> {
    try {
      await this.saveSearchHistory([]);
    } catch (error) {
      console.error('검색 히스토리 전체 삭제 실패:', error);
      throw error;
    }
  },
};

// 🔧 공유 레시피 관련 함수들
export const SharedRecipeStorage = {
  // 공유 레시피 저장
  async saveSharedRecipes(recipes: Recipe[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SHARED_RECIPES,
        JSON.stringify(recipes),
      );
    } catch (error) {
      console.error('공유 레시피 저장 실패:', error);
      throw error;
    }
  },

  // 공유 레시피 불러오기
  async getSharedRecipes(): Promise<Recipe[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED_RECIPES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('공유 레시피 불러오기 실패:', error);
      return [];
    }
  },

  // 🔧 공유 레시피 업데이트 (새로 추가)
  async updateSharedRecipe(updatedRecipe: Recipe): Promise<void> {
    try {
      const currentRecipes = await this.getSharedRecipes();
      const updatedRecipes = currentRecipes.map(recipe =>
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe,
      );
      await this.saveSharedRecipes(updatedRecipes);
    } catch (error) {
      console.error('공유 레시피 업데이트 실패:', error);
      throw error;
    }
  },

  // 공유 레시피 삭제
  async deleteSharedRecipe(recipeId: string): Promise<void> {
    try {
      const currentRecipes = await this.getSharedRecipes();
      const updatedRecipes = currentRecipes.filter(
        recipe => recipe.id !== recipeId,
      );
      await this.saveSharedRecipes(updatedRecipes);
    } catch (error) {
      console.error('공유 레시피 삭제 실패:', error);
      throw error;
    }
  },
};

// 🔧 전체 데이터 초기화 (개발/테스트용)
export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PERSONAL_RECIPES,
      STORAGE_KEYS.FAVORITE_RECIPE_IDS,
      STORAGE_KEYS.SEARCH_HISTORY,
      STORAGE_KEYS.SHARED_RECIPES,
    ]);
    console.log('모든 저장 데이터 삭제 완료');
  } catch (error) {
    console.error('전체 데이터 삭제 실패:', error);
    throw error;
  }
};
