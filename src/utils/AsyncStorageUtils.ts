import AsyncStorage from '@react-native-async-storage/async-storage';
import { FridgeItem } from '../hooks/useFridgeData';

// Recipe 타입 정의
export interface Recipe {
  id: number;
  title: string;
  createdAt: string;
  updatedAt?: string;
  ingredients?: RecipeIngredient[];
  steps?: string[];
  referenceUrl?: string;
  isShared?: boolean;
  sharedBy?: string;
  sharedById?: number; // 공유한 사용자의 실제 ID
  originalRecipeId?: number; // 원본 개인 레시피 ID
  fridgeIds?: number[]; // 공유된 냉장고 ID 목록
}

export interface RecipeIngredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

// AsyncStorage 키 상수
export const STORAGE_KEYS = {
  FRIDGE_ITEMS: 'fridge_items',
  ITEM_CATEGORIES: 'item_categories',
  PERSONAL_RECIPES: 'personal_recipes',
  FAVORITE_RECIPE_IDS: 'favorite_recipe_ids',
  SEARCH_HISTORY: 'search_history',
  SHARED_RECIPES: 'shared_recipes',
} as const;

// 🔧 냉장고 아이템 관련 함수들
export const FridgeStorage = {
  // 모든 냉장고 아이템 저장
  async saveFridgeItems(items: FridgeItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.FRIDGE_ITEMS,
        JSON.stringify(items),
      );
    } catch (error) {
      // console.error('냉장고 아이템 저장 실패:', error);
      throw error;
    }
  },

  // 모든 냉장고 아이템 불러오기
  async getAllFridgeItems(): Promise<FridgeItem[]> {
    try {
      const itemsJson = await AsyncStorage.getItem(STORAGE_KEYS.FRIDGE_ITEMS);
      return itemsJson ? JSON.parse(itemsJson) : [];
    } catch (error) {
      // console.error('냉장고 아이템 조회 실패:', error);
      return [];
    }
  },

  // 특정 냉장고의 아이템들만 가져오기
  async getFridgeItemsByFridgeId(fridgeId: number): Promise<FridgeItem[]> {
    try {
      const allItems = await this.getAllFridgeItems();
      return allItems.filter(item => item.fridgeId === fridgeId);
    } catch (error) {
      // console.error('특정 냉장고 아이템 조회 실패:', error);
      return [];
    }
  },

  // 새 아이템 추가
  async addFridgeItem(newItem: Omit<FridgeItem, 'id'>): Promise<FridgeItem> {
    try {
      const allItems = await this.getAllFridgeItems();

      // 새 ID 생성 (기존 ID 중 최대값 + 1)
      const maxId = allItems.reduce((max, item) => Math.max(max, item.id), 0);
      const itemWithId: FridgeItem = {
        ...newItem,
        id: maxId + 1,
      };

      const updatedItems = [...allItems, itemWithId];
      await this.saveFridgeItems(updatedItems);

      return itemWithId;
    } catch (error) {
      // console.error('냉장고 아이템 추가 실패:', error);
      throw error;
    }
  },

  // 아이템 업데이트
  async updateFridgeItem(updatedItem: FridgeItem): Promise<void> {
    try {
      const allItems = await this.getAllFridgeItems();
      const updatedItems = allItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item,
      );
      await this.saveFridgeItems(updatedItems);
    } catch (error) {
      // console.error('냉장고 아이템 업데이트 실패:', error);
      throw error;
    }
  },

  // 아이템 삭제
  async deleteFridgeItem(itemId: number): Promise<void> {
    try {
      const allItems = await this.getAllFridgeItems();
      const filteredItems = allItems.filter(item => item.id !== itemId);
      await this.saveFridgeItems(filteredItems);
    } catch (error) {
      // console.error('냉장고 아이템 삭제 실패:', error);
      throw error;
    }
  },

  // 특정 냉장고의 모든 아이템 삭제
  async deleteFridgeItemsByFridgeId(fridgeId: number): Promise<void> {
    try {
      const allItems = await this.getAllFridgeItems();
      const filteredItems = allItems.filter(item => item.fridgeId !== fridgeId);
      await this.saveFridgeItems(filteredItems);
    } catch (error) {
      // console.error('냉장고별 아이템 삭제 실패:', error);
      throw error;
    }
  },

  // 아이템 수량 업데이트
  async updateItemQuantity(itemId: number, newQuantity: number): Promise<void> {
    try {
      const allItems = await this.getAllFridgeItems();
      const updatedItems = allItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      );
      await this.saveFridgeItems(updatedItems);
    } catch (error) {
      // console.error('아이템 수량 업데이트 실패:', error);
      throw error;
    }
  },

  // 아이템 단위 업데이트
  async updateItemUnit(itemId: number, newUnit: string): Promise<void> {
    try {
      const allItems = await this.getAllFridgeItems();
      const updatedItems = allItems.map(item =>
        item.id === itemId ? { ...item, unit: newUnit } : item,
      );
      await this.saveFridgeItems(updatedItems);
    } catch (error) {
      // console.error('아이템 단위 업데이트 실패:', error);
      throw error;
    }
  },

  // 아이템 소비기한 업데이트
  async updateItemExpiryDate(itemId: number, newDate: string): Promise<void> {
    try {
      const allItems = await this.getAllFridgeItems();
      const updatedItems = allItems.map(item =>
        item.id === itemId ? { ...item, expiryDate: newDate } : item,
      );
      await this.saveFridgeItems(updatedItems);
    } catch (error) {
      // console.error('아이템 소비기한 업데이트 실패:', error);
      throw error;
    }
  },
};

// 🔧 아이템 카테고리 관련 함수들
export const ItemCategoryStorage = {
  // 카테고리 목록 저장
  async saveItemCategories(categories: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ITEM_CATEGORIES,
        JSON.stringify(categories),
      );
    } catch (error) {
      // console.error('카테고리 저장 실패:', error);
      throw error;
    }
  },

  // 카테고리 목록 가져오기
  async getItemCategories(): Promise<string[]> {
    try {
      const categoriesJson = await AsyncStorage.getItem(
        STORAGE_KEYS.ITEM_CATEGORIES,
      );
      return categoriesJson
        ? JSON.parse(categoriesJson)
        : [
            '전체',
            '베이커리',
            '채소 / 과일',
            '정육 / 계란',
            '가공식품',
            '수산 / 건어물',
            '쌀 / 잡곡',
            '주류 / 음료',
            '우유 / 유제품',
            '건강식품',
            '장 / 양념 / 소스',
            '기타',
          ];
    } catch (error) {
      // console.error('카테고리 조회 실패:', error);
      return [];
    }
  },

  // 새 카테고리 추가
  async addItemCategory(newCategory: string): Promise<void> {
    try {
      const categories = await this.getItemCategories();
      if (!categories.includes(newCategory)) {
        const updatedCategories = [...categories, newCategory];
        await this.saveItemCategories(updatedCategories);
      }
    } catch (error) {
      // console.error('카테고리 추가 실패:', error);
      throw error;
    }
  },

  // 카테고리 삭제
  async deleteItemCategory(categoryToDelete: string): Promise<void> {
    try {
      const categories = await this.getItemCategories();
      const filteredCategories = categories.filter(
        cat => cat !== categoryToDelete,
      );
      await this.saveItemCategories(filteredCategories);
    } catch (error) {
      // console.error('카테고리 삭제 실패:', error);
      throw error;
    }
  },
};

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
      // console.error('개인 레시피 저장 실패:', error);
      throw error;
    }
  },

  // 개인 레시피 불러오기
  async getPersonalRecipes(): Promise<Recipe[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PERSONAL_RECIPES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      // console.error('개인 레시피 불러오기 실패:', error);
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
      // console.error('개인 레시피 추가 실패:', error);
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
      // console.error('개인 레시피 업데이트 실패:', error);
      throw error;
    }
  },

  // 개인 레시피 삭제 (공유된 레시피도 함께 삭제)
  async deletePersonalRecipe(
    recipeId: number,
    currentUserId?: number,
  ): Promise<void> {
    try {
      // 1. 개인 레시피 삭제
      const currentRecipes = await this.getPersonalRecipes();
      const updatedRecipes = currentRecipes.filter(
        recipe => recipe.id !== recipeId,
      );
      await this.savePersonalRecipes(updatedRecipes);

      // 2. 해당 레시피가 공유된 경우 공동 폴더에서도 삭제
      if (currentUserId) {
        await SharedRecipeStorage.deleteSharedRecipesByOriginalId(
          recipeId,
          currentUserId,
        );
      }

      console.log(`개인 레시피 및 관련 공유 레시피 삭제 완료: ${recipeId}`);
    } catch (error) {
      // console.error('개인 레시피 삭제 실패:', error);
      throw error;
    }
  },
};

// 🔧 즐겨찾기 관련 함수들
export const FavoriteStorage = {
  // 즐겨찾기 목록 저장
  async saveFavoriteIds(favoriteIds: (number | string)[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITE_RECIPE_IDS,
        JSON.stringify(favoriteIds),
      );
    } catch (error) {
      // console.error('즐겨찾기 저장 실패:', error);
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
      // console.error('즐겨찾기 불러오기 실패:', error);
      return [];
    }
  },

  // 즐겨찾기 추가
  async addFavorite(recipeId: number): Promise<void> {
    try {
      const currentFavorites = await this.getFavoriteIds();
      if (!currentFavorites.includes(recipeId.toString())) {
        const updatedFavorites = [...currentFavorites, recipeId];
        await this.saveFavoriteIds(updatedFavorites);
      }
    } catch (error) {
      // console.error('즐겨찾기 추가 실패:', error);
      throw error;
    }
  },

  // 즐겨찾기 제거
  async removeFavorite(recipeId: number | string): Promise<void> {
    try {
      const currentFavorites = await this.getFavoriteIds();
      const updatedFavorites = currentFavorites.filter(id => id !== recipeId);
      await this.saveFavoriteIds(updatedFavorites);
    } catch (error) {
      // console.error('즐겨찾기 제거 실패:', error);
      throw error;
    }
  },

  // 즐겨찾기 토글
  async toggleFavorite(recipeId: number): Promise<boolean> {
    try {
      const currentFavorites = await this.getFavoriteIds();
      const isFavorite = currentFavorites.includes(recipeId.toString());
      if (isFavorite) {
        await this.removeFavorite(recipeId);
        return false;
      } else {
        await this.addFavorite(recipeId);
        return true;
      }
    } catch (error) {
      // console.error('즐겨찾기 토글 실패:', error);
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
      // console.error('공유 레시피 저장 실패:', error);
      throw error;
    }
  },

  // 공유 레시피 불러오기
  async getSharedRecipes(): Promise<Recipe[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED_RECIPES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      // console.error('공유 레시피 불러오기 실패:', error);
      return [];
    }
  },

  // 공유 레시피 업데이트
  async updateSharedRecipe(updatedRecipe: Recipe): Promise<void> {
    try {
      const currentRecipes = await this.getSharedRecipes();
      const updatedRecipes = currentRecipes.map(recipe =>
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe,
      );
      await this.saveSharedRecipes(updatedRecipes);
    } catch (error) {
      // console.error('공유 레시피 업데이트 실패:', error);
      throw error;
    }
  },

  // 공유 레시피 삭제 (권한 확인)
  async deleteSharedRecipe(
    recipeId: number,
    currentUserId: number,
  ): Promise<boolean> {
    try {
      const currentRecipes = await this.getSharedRecipes();
      const recipeToDelete = currentRecipes.find(
        recipe => recipe.id === recipeId,
      );

      // 권한 확인: 본인이 공유한 레시피만 삭제 가능
      if (!recipeToDelete) {
        // console.warn('삭제하려는 레시피를 찾을 수 없습니다.');
        return false;
      }

      if (recipeToDelete.sharedById !== currentUserId) {
        // console.warn('본인이 공유한 레시피만 삭제할 수 있습니다.');
        return false;
      }

      const updatedRecipes = currentRecipes.filter(
        recipe => recipe.id !== recipeId,
      );
      await this.saveSharedRecipes(updatedRecipes);

      console.log(`공유 레시피 삭제 완료: ${recipeId}`);
      return true;
    } catch (error) {
      // console.error('공유 레시피 삭제 실패:', error);
      throw error;
    }
  },

  // 원본 레시피 ID로 공유된 모든 레시피 삭제 (개인 레시피 삭제 시 사용)
  async deleteSharedRecipesByOriginalId(
    originalRecipeId: number,
    userId: number,
  ): Promise<void> {
    try {
      const currentRecipes = await this.getSharedRecipes();
      const updatedRecipes = currentRecipes.filter(recipe => {
        // 본인이 공유한 레시피 중에서 원본 ID가 일치하는 것들만 삭제
        return !(
          recipe.originalRecipeId === originalRecipeId &&
          recipe.sharedById === userId
        );
      });

      await this.saveSharedRecipes(updatedRecipes);
      console.log(
        `원본 레시피 ${originalRecipeId}에 연결된 공유 레시피들 삭제 완료`,
      );
    } catch (error) {
      // console.error('연관된 공유 레시피 삭제 실패:', error);
      throw error;
    }
  },

  // 특정 사용자가 공유한 레시피 목록 조회
  async getSharedRecipesByUser(userId: number): Promise<Recipe[]> {
    try {
      const allSharedRecipes = await this.getSharedRecipes();
      return allSharedRecipes.filter(recipe => recipe.sharedById === userId);
    } catch (error) {
      // console.error('사용자별 공유 레시피 조회 실패:', error);
      return [];
    }
  },

  // 공유 권한 확인
  async canDeleteSharedRecipe(
    recipeId: number,
    currentUserId: number,
  ): Promise<boolean> {
    try {
      const currentRecipes = await this.getSharedRecipes();
      const recipe = currentRecipes.find(r => r.id === recipeId);
      return recipe?.sharedById === currentUserId;
    } catch (error) {
      // console.error('공유 레시피 삭제 권한 확인 실패:', error);
      return false;
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
      // console.error('검색 히스토리 저장 실패:', error);
      throw error;
    }
  },

  // 검색 히스토리 불러오기
  async getSearchHistory(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      // console.error('검색 히스토리 불러오기 실패:', error);
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
      // console.error('검색어 추가 실패:', error);
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
      // console.error('검색 히스토리 항목 삭제 실패:', error);
      return [];
    }
  },

  // 검색 히스토리 전체 삭제
  async clearSearchHistory(): Promise<void> {
    try {
      await this.saveSearchHistory([]);
    } catch (error) {
      // console.error('검색 히스토리 전체 삭제 실패:', error);
      throw error;
    }
  },
};
// 🔧 초기 데이터 설정 및 전체 데이터 관리
export const FridgeInitializer = {
  // 초기 데이터 설정 (앱 최초 실행 시)
  async initializeDefaultData(): Promise<void> {
    try {
      // 기존 데이터가 있는지 확인
      const existingItems = await FridgeStorage.getAllFridgeItems();
      // const existingCategories = await ItemCategoryStorage.getItemCategories();

      // 아이템이 없다면 초기 데이터 설정
      if (existingItems.length === 0) {
        const defaultItems: FridgeItem[] = [
          {
            id: '1',
            name: '양배추',
            quantity: 1,
            unit: 'kg',
            expiryDate: '2025.07.20',
            itemCategory: '채소 / 과일',
            fridgeId: '1',
          },
          {
            id: '2',
            name: '우유',
            quantity: 1,
            unit: 'L',
            expiryDate: '2025.07.25',
            itemCategory: '우유 / 유제품',
            fridgeId: '1',
          },
        ];
        await FridgeStorage.saveFridgeItems(defaultItems);
      }

      // 카테고리 초기화는 getItemCategories에서 기본값으로 처리됨
      console.log('냉장고 초기 데이터 설정 완료');
    } catch (error) {
      // console.error('초기 데이터 설정 실패:', error);
    }
  },
};

// 🔧 전체 데이터 초기화 (개발/테스트용)
export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.FRIDGE_ITEMS,
      STORAGE_KEYS.ITEM_CATEGORIES,
      STORAGE_KEYS.PERSONAL_RECIPES,
      STORAGE_KEYS.FAVORITE_RECIPE_IDS,
      STORAGE_KEYS.SEARCH_HISTORY,
      STORAGE_KEYS.SHARED_RECIPES,
    ]);
    console.log('모든 저장 데이터 삭제 완료');
  } catch (error) {
    // console.error('전체 데이터 삭제 실패:', error);
    throw error;
  }
};
