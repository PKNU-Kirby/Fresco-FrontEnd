// types/Recipe.ts - 백엔드 호환 인터페이스

// 기본 레시피 재료 (등록/수정 시 사용)
export interface RecipeIngredient {
  id: string;
  ingredientId?: number; // 백엔드 ID
  name: string; // ingredientName과 매핑
  quantity: number; // 백엔드와 동일
  // instead 제거 (등록 시 사용 안함)
}

// 레시피 사용 시 대체재 정보가 포함된 재료
export interface RecipeIngredientWithAlternatives extends RecipeIngredient {
  available: boolean; // 냉장고에 있는지
  alternatives?: Array<{
    name: string;
    reason: string;
    fridgeQuantity: number;
  }>;
}

export interface Recipe {
  id: string;
  recipeId?: number; // 백엔드 ID
  title: string;
  steps: string; // 백엔드는 string (프론트 string[]에서 변경)
  referenceUrl?: string; // 백엔드의 url 필드
  ingredients: RecipeIngredient[];
  createdAt: string;
  updatedAt?: string;
  isShared?: boolean;
  sharedBy?: string;
  isFavorite?: boolean;
}

// 백엔드 API 요청/응답 타입
export interface RecipeCreateRequest {
  title: string;
  ingredients: Array<{
    ingredientName: string;
    quantity: number;
  }>;
  steps: string;
  url?: string;
}

export interface RecipeDetailResponse {
  recipeId: number;
  title: string;
  steps: string;
  url: string;
  ingredients: Array<{
    ingredientId: number;
    name: string;
    quantity: number;
    instead: string; // 백엔드에서 관리 (조회 시에만)
  }>;
}

// 레시피 사용하기 API 응답 (예상)
export interface UseRecipeCheckResponse {
  recipeId: number;
  ingredients: Array<{
    ingredientId: number;
    name: string;
    quantity: number;
    available: boolean;
    fridgeQuantity?: number;
    alternatives?: Array<{
      name: string;
      fridgeQuantity: number;
      similarity: number;
      reason: string;
    }>;
  }>;
}
