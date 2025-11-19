import { ApiService } from '../apiServices';

// 사용 기록 타입 - 백엔드 응답에 맞게 수정
export type HistoryRecord = {
  consumerId: number;
  consumerName: string;
  ingredientName: string;
  usedQuantity: number;
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
   * 냉장고 사용 기록 조회 (쿼리 파라미터 버전)
   */
  static async getUsageHistory(
    refrigeratorId: number,
    options?: {
      page?: number;
      size?: number;
      sort?: string;
    },
  ): Promise<HistoryResponse> {
    try {
      const page = options?.page ?? 0;
      const size = options?.size ?? 10;
      const sort = options?.sort ?? 'createdAt,desc';

      console.log(`📡 냉장고 ${refrigeratorId} 사용 기록 조회 중...`);

      // 쿼리 파라미터 생성 - refrigeratorId도 포함
      const queryParams = new URLSearchParams({
        refrigeratorId: refrigeratorId.toString(),
        page: page.toString(),
        size: size.toString(),
        sort: sort,
      });

      console.log(`🔍 요청 URL: /api/v1/history?${queryParams.toString()}`);

      const response = await ApiService.apiCall<HistoryResponse>(
        `/api/v1/history?${queryParams.toString()}`,
        {
          method: 'GET',
        },
      );

      console.log(`✅ 사용 기록 조회 완료: ${response.content.length}개`);
      return response;
    } catch (error) {
      console.error('❌ 사용 기록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 페이지네이션을 사용한 전체 사용 기록 조회
   */
  static async getAllUsageHistory(
    refrigeratorId: number,
    maxPages: number = 10,
  ): Promise<HistoryRecord[]> {
    const allRecords: HistoryRecord[] = [];
    let currentPage = 0;
    let hasMore = true;

    try {
      console.log(`📡 냉장고 ${refrigeratorId}의 전체 사용 기록 조회 시작...`);

      while (hasMore && currentPage < maxPages) {
        console.log(`  - 페이지 ${currentPage + 1} 조회 중...`);
        
        const response = await this.getUsageHistory(refrigeratorId, {
          page: currentPage,
          size: 100,
        });

        allRecords.push(...response.content);
        hasMore = response.pageInfo.hasNext;
        currentPage++;

        console.log(
          `  - 현재까지 ${allRecords.length}개 수집, 다음 페이지 ${hasMore ? '있음' : '없음'}`,
        );
      }

      console.log(`✅ 전체 사용 기록 조회 완료: ${allRecords.length}개`);
      return allRecords;
    } catch (error) {
      console.error('❌ 전체 사용 기록 조회 실패:', error);
      throw error;
    }
  }
}
```

## 테스트용 로그 추가

API 호출이 제대로 되는지 확인하기 위해 상세한 로그를 추가했어요. 실제로 테스트해보면 다음과 같은 로그가 나올 거예요:
```
📡 냉장고 1 사용 기록 조회 중...
🔍 요청 URL: /api/v1/history?refrigeratorId=1&page=0&size=10&sort=createdAt,desc
=> API 호출: GET https://your-api.com/api/v1/history?refrigeratorId=1&page=0&size=10&sort=createdAt,desc
O API 응답 (200): ...
✅ 사용 기록 조회 완료: 10개
```

## UsageTrackingService는 그대로!

UsageTrackingService는 이미 `refrigeratorId`를 전달하고 있으니 수정할 필요 없어요. 그대로 사용하면 됩니다.

## 화면 컴포넌트도 그대로!

UsageHistoryScreen도 수정 없이 그대로 사용하면 됩니다.

## 테스트 방법

1. **앱 실행 후 사용 기록 화면으로 이동**
2. **콘솔 로그 확인:**
   - `🔍 요청 URL` 부분을 확인해서 쿼리 파라미터가 제대로 붙었는지 확인
   - API 응답이 제대로 오는지 확인
3. **만약 에러가 나면:**
   - 에러 메시지 확인
   - 백엔드가 `refrigeratorId` 쿼리 파라미터를 받는지 확인 필요

## 예상되는 API 요청 URL
```
GET /api/v1/history?refrigeratorId=1&page=0&size=10&sort=createdAt,desc