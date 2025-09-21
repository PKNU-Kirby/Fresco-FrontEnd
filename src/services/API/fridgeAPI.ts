// ===================================================================
// services/fridgeApi.ts - 냉장고 관련 API만 담당
// ===================================================================

import { apiCallWithAuth } from '../../utils/apiUtils';

export class FridgeAPIService {
  // 냉장고 목록 조회
  static async getFridgeList() {
    return apiCallWithAuth('/api/v1/refrigerator', { method: 'GET' });
  }

  // 냉장고 생성
  static async createFridge(name: string, description?: string) {
    return apiCallWithAuth('/api/v1/refrigerator', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  // 냉장고 수정
  static async updateFridge(fridgeId: string, data: any) {
    return apiCallWithAuth(`/api/v1/refrigerator/${fridgeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 냉장고 삭제
  static async deleteFridge(fridgeId: string) {
    return apiCallWithAuth(`/api/v1/refrigerator/${fridgeId}`, {
      method: 'DELETE',
    });
  }

  // 냉장고 멤버 조회
  static async getFridgeMembers(fridgeId: string) {
    return apiCallWithAuth(`/api/v1/refrigerator/users/${fridgeId}`, {
      method: 'GET',
    });
  }

  // 냉장고 멤버 추가
  static async addFridgeMember(fridgeId: string, inviterName: string) {
    return apiCallWithAuth(`/api/v1/refrigerator/users/${fridgeId}`, {
      method: 'POST',
      body: JSON.stringify({ inviterName }),
    });
  }

  // 냉장고 멤버 제거
  static async removeFridgeMember(fridgeId: string, userId: string) {
    return apiCallWithAuth(`/api/v1/refrigerator/users/${fridgeId}/${userId}`, {
      method: 'DELETE',
    });
  }
}
