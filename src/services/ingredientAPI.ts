// ===================================================================
// services/ingredientApi.ts - 식재료 관련 API만 담당
// ===================================================================

import { apiCallWithAuth } from '../utils/authUtils';

export class IngredientApiService {
  // 식재료 목록 조회
  static async getIngredientList(fridgeId: string, filter?: any) {
    const queryParams = filter
      ? `?${new URLSearchParams(filter).toString()}`
      : '';
    return apiCallWithAuth(`/api/v1/ingredient/${fridgeId}${queryParams}`, {
      method: 'GET',
    });
  }

  // 식재료 추가
  static async addIngredient(fridgeId: string, ingredientData: any) {
    return apiCallWithAuth(`/api/v1/ingredient/${fridgeId}`, {
      method: 'POST',
      body: JSON.stringify(ingredientData),
    });
  }

  // 식재료 수정
  static async updateIngredient(ingredientId: string, updateData: any) {
    return apiCallWithAuth(`/api/v1/ingredient/${ingredientId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // 식재료 삭제
  static async deleteIngredient(ingredientId: string) {
    return apiCallWithAuth(`/api/v1/ingredient/${ingredientId}`, {
      method: 'DELETE',
    });
  }

  // 카테고리별 식재료 조회
  static async getIngredientsByCategory(fridgeId: string) {
    return apiCallWithAuth(`/api/v1/ingredient/${fridgeId}/category`, {
      method: 'GET',
    });
  }
}
