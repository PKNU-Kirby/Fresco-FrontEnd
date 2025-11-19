import { ApiService } from '../apiServices';

// 사용 기록 타입
export type HistoryRecord = {
  consumerId: number;
  consumerName: string;
  refrigeratorIngredientId: number;
  ingredientName: string;
  usedQuantity: number;
  unit: string;
  usedAt: string;
};

export type HistoryResponse = {
  content: HistoryRecord[];
  pageInfo: {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    first: boolean;
    last: boolean;
  };
};

export class UsageHistoryAPI {
  static formatTime(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;

    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * 냉장고 사용 기록 조회
   */
  static async getUsageHistory(
    fridgeId: number,
    options?: {
      page?: number;
      size?: number;
    },
  ): Promise<HistoryResponse> {
    try {
      const page = options?.page || 0;
      const size = options?.size || 10;

      console.log(`냉장고 ${fridgeId} 사용 기록 조회 중...`);

      const response = await ApiService.apiCall<HistoryResponse>(
        `/api/v1/history/${fridgeId}`,
        {
          method: 'GET',
        },
      );

      console.log(`사용 기록 조회 완료: ${response.content.length}개`);
      return response;
    } catch (error) {
      console.error('사용 기록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 페이지네이션을 사용한 전체 사용 기록 조회
   */
  static async getAllUsageHistory(
    fridgeId: number,
    maxPages: number = 10,
  ): Promise<HistoryRecord[]> {
    const allRecords: HistoryRecord[] = [];
    let currentPage = 0;
    let hasMore = true;

    try {
      while (hasMore && currentPage < maxPages) {
        const response = await this.getUsageHistory(fridgeId, {
          page: currentPage,
          size: 100,
        });

        allRecords.push(...response.content);
        hasMore = response.pageInfo.hasNext;
        currentPage++;
      }

      console.log(`전체 사용 기록 조회 완료: ${allRecords.length}개`);
      return allRecords;
    } catch (error) {
      console.error('전체 사용 기록 조회 실패:', error);
      throw error;
    }
  }
}
