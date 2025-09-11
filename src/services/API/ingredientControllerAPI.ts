import { ApiService } from '../apiServices'; // 공통 기능 활용

// 식재료 관련 타입 정의
export type AutoCompleteSearchResponse = {
  ingredientId: number;
  ingredientName: string;
  categoryId: number;
  categoryName: string;
};

export type SaveIngredientInfo = {
  ingredientId: number;
  categoryId: number;
  expirationDate: string;
};

export type SaveIngredientsRequest = {
  ingredientsInfo: SaveIngredientInfo[];
  ingredientIds?: number[];
};

export type RefrigeratorIngredientResponse = {
  id: string;
  ingredientId: number;
  categoryId: number;
  ingredientName: string;
  expirationDate: string;
  quantity: number;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PageResponse<T> = {
  content: T[];
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

export type FilterRequest = {
  categoryIds: number[];
  sort: string;
  page: number;
  size: number;
};

export type UpdateIngredientRequest = {
  unit?: string;
  expirationDate?: string;
  quantity?: number;
};

/**
 * 식재료 전용 API 컨트롤러
 * 엔드포인트: /ap1/v1/ingredient/*
 */
export class IngredientControllerAPI {
  private static readonly BASE_PATH = '/ap1/v1/ingredient';

  /**
   * 식재료 자동완성 검색
   * GET /ap1/v1/ingredient/auto-complete?keyword={keyword}
   */
  static async searchIngredients(
    keyword: string,
  ): Promise<AutoCompleteSearchResponse[]> {
    if (!keyword || keyword.trim() === '') {
      return [];
    }

    const encodedKeyword = encodeURIComponent(keyword.trim());
    const endpoint = `${this.BASE_PATH}/auto-complete?keyword=${encodedKeyword}`;

    try {
      console.log(`식재료 검색: "${keyword}"`);
      const response = await ApiService.apiCall<AutoCompleteSearchResponse[]>(
        endpoint,
      );
      console.log(`검색 결과: ${response.length}개`);
      return response;
    } catch (error) {
      console.error('식재료 검색 실패:', error);
      throw new Error(`식재료 검색에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * 냉장고 식재료 목록 조회
   * GET /ap1/v1/ingredient/{refrigeratorId}
   */
  static async getRefrigeratorIngredients(
    refrigeratorId: string,
    filter: Partial<FilterRequest> = {},
  ): Promise<PageResponse<RefrigeratorIngredientResponse>> {
    const defaultFilter: FilterRequest = {
      categoryIds: [],
      sort: 'expirationDate',
      page: 0,
      size: 50,
      ...filter,
    };

    // 쿼리 파라미터 구성
    const params = new URLSearchParams();

    // categoryIds 배열 처리
    defaultFilter.categoryIds.forEach(id => {
      params.append('categoryIds', id.toString());
    });

    params.append('sort', defaultFilter.sort);
    params.append('page', defaultFilter.page.toString());
    params.append('size', defaultFilter.size.toString());

    const endpoint = `${this.BASE_PATH}/${refrigeratorId}?${params.toString()}`;

    try {
      console.log(`냉장고 ${refrigeratorId} 식재료 목록 조회`, {
        filter: defaultFilter,
      });
      const response = await ApiService.apiCall<
        PageResponse<RefrigeratorIngredientResponse>
      >(endpoint);
      console.log(`조회 결과: ${response.content?.length || 0}개 아이템`);
      return response;
    } catch (error) {
      console.error('냉장고 식재료 조회 실패:', error);
      throw new Error(
        `냉장고 식재료를 불러오는데 실패했습니다: ${error.message}`,
      );
    }
  }

  /**
   * 냉장고에 식재료 추가
   * POST /ap1/v1/ingredient/{refrigeratorId}
   */
  static async addIngredientsToRefrigerator(
    refrigeratorId: string,
    saveRequest: SaveIngredientsRequest,
  ): Promise<any> {
    // 날짜 형식 검증 및 변환
    const processedRequest = {
      ...saveRequest,
      ingredientsInfo: saveRequest.ingredientsInfo.map(item => ({
        ingredientId: item.ingredientId,
        categoryId: item.categoryId,
        expirationDate: this.formatDateForAPI(item.expirationDate),
      })),
    };

    const endpoint = `${this.BASE_PATH}/${refrigeratorId}`;

    try {
      console.log('냉장고에 식재료 추가:', {
        refrigeratorId,
        ingredientsCount: processedRequest.ingredientsInfo.length,
      });
      console.log('요청 데이터:', processedRequest);

      const response = await ApiService.apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(processedRequest),
      });

      console.log('식재료 추가 성공:', response);
      return response;
    } catch (error) {
      console.error('식재료 추가 실패:', error);
      throw new Error(`식재료 추가에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * 냉장고 식재료 정보 수정
   * PUT /ap1/v1/ingredient/{refrigeratorIngredientId}
   */
  static async updateRefrigeratorIngredient(
    refrigeratorIngredientId: string,
    updateData: UpdateIngredientRequest,
  ): Promise<RefrigeratorIngredientResponse> {
    const processedData: any = {};

    if (updateData.unit !== undefined) {
      processedData.unit = updateData.unit;
    }
    if (updateData.expirationDate !== undefined) {
      processedData.expirationDate = this.formatDateForAPI(
        updateData.expirationDate,
      );
    }
    if (updateData.quantity !== undefined) {
      processedData.quantity = updateData.quantity;
    }

    const endpoint = `${this.BASE_PATH}/${refrigeratorIngredientId}`;

    try {
      console.log(
        `냉장고 식재료 ${refrigeratorIngredientId} 수정:`,
        processedData,
      );

      const response = await ApiService.apiCall<RefrigeratorIngredientResponse>(
        endpoint,
        {
          method: 'PUT',
          body: JSON.stringify(processedData),
        },
      );

      console.log('식재료 수정 성공:', response);
      return response;
    } catch (error) {
      console.error('식재료 수정 실패:', error);
      throw new Error(`식재료 수정에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * 냉장고 식재료 삭제
   * DELETE /ap1/v1/ingredient/{refrigeratorIngredientId}
   * (현재 API 스키마에 없어서 임시 구현 - 수량을 0으로 업데이트)
   */
  static async deleteRefrigeratorIngredient(
    refrigeratorIngredientId: string,
  ): Promise<void> {
    // TODO: 실제 DELETE API가 추가되면 수정
    console.warn('DELETE API가 없어서 수량을 0으로 업데이트합니다.');

    try {
      await this.updateRefrigeratorIngredient(refrigeratorIngredientId, {
        quantity: 0,
        expirationDate: new Date().toISOString().split('T')[0],
      });

      console.log(`식재료 ${refrigeratorIngredientId} 삭제 처리 완료 (수량 0)`);
    } catch (error) {
      console.error('식재료 삭제 처리 실패:', error);
      throw new Error(`식재료 삭제에 실패했습니다: ${error.message}`);
    }
  }

  // ========== 편의 메소드들 ==========

  /**
   * 식재료 이름으로 첫 번째 매칭 결과 반환
   */
  static async findIngredientByName(
    ingredientName: string,
  ): Promise<AutoCompleteSearchResponse | null> {
    try {
      const results = await this.searchIngredients(ingredientName);

      if (results && results.length > 0) {
        // 정확히 일치하는 이름을 우선 검색
        const exactMatch = results.find(
          item =>
            item.ingredientName.toLowerCase() === ingredientName.toLowerCase(),
        );

        return exactMatch || results[0];
      }

      return null;
    } catch (error) {
      console.error('식재료 검색 실패:', error);
      throw new Error(`"${ingredientName}" 식재료를 찾을 수 없습니다.`);
    }
  }

  /**
   * 여러 식재료 이름을 한번에 확인
   */
  static async findMultipleIngredients(ingredientNames: string[]): Promise<
    {
      name: string;
      result: AutoCompleteSearchResponse | null;
      error?: string;
    }[]
  > {
    const results = [];

    for (const name of ingredientNames) {
      try {
        const result = await this.findIngredientByName(name);
        results.push({ name, result });
      } catch (error) {
        console.error(`식재료 "${name}" 검색 실패:`, error);
        results.push({ name, result: null, error: error.message });
      }
    }

    return results;
  }

  /**
   * 간편한 식재료 추가 (단일 아이템)
   */
  static async addSingleIngredient(
    refrigeratorId: string,
    ingredientName: string,
    expirationDate: string,
  ): Promise<any> {
    // 1. 식재료 검색
    const ingredientInfo = await this.findIngredientByName(ingredientName);

    if (!ingredientInfo) {
      throw new Error(`"${ingredientName}" 식재료를 찾을 수 없습니다.`);
    }

    // 2. 추가 요청
    const saveRequest: SaveIngredientsRequest = {
      ingredientsInfo: [
        {
          ingredientId: ingredientInfo.ingredientId,
          categoryId: ingredientInfo.categoryId,
          expirationDate: expirationDate,
        },
      ],
    };

    return await this.addIngredientsToRefrigerator(refrigeratorId, saveRequest);
  }

  /**
   * AddItemScreen에서 사용하는 확인된 식재료들 추가
   */
  static async addConfirmedIngredients(
    refrigeratorId: string,
    confirmedIngredients: Array<{
      userInput: {
        id: string;
        name: string;
        quantity: string;
        unit: string;
        expirationDate: string;
        itemCategory: string;
      };
      apiResult: {
        ingredientId: number;
        ingredientName: string;
        categoryId: number;
        categoryName: string;
      };
    }>,
  ): Promise<any> {
    const saveRequest: SaveIngredientsRequest = {
      ingredientsInfo: confirmedIngredients.map(confirmed => ({
        ingredientId: confirmed.apiResult.ingredientId,
        categoryId: confirmed.apiResult.categoryId,
        expirationDate: confirmed.userInput.expirationDate,
      })),
    };

    return await this.addIngredientsToRefrigerator(refrigeratorId, saveRequest);
  }

  // ========== 유틸리티 메소드 ==========

  /**
   * 날짜를 API에서 요구하는 형식으로 변환
   */
  static formatDateForAPI(dateString: string): string {
    if (!dateString) {
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      return defaultDate.toISOString().split('T')[0];
    }

    // 이미 YYYY-MM-DD 형식인지 확인
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // ISO 형식이면 날짜 부분만 추출
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }

    // 다른 형식이면 Date 객체로 변환 후 형식 맞추기
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('날짜 형식 변환 실패, 기본값 사용:', dateString);
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      return defaultDate.toISOString().split('T')[0];
    }
  }

  /**
   * 카테고리 ID를 카테고리 이름으로 변환 (임시 하드코딩)
   */
  static getCategoryNameById(categoryId: number): string {
    const categoryMap: { [key: number]: string } = {
      1: '베이커리',
      2: '채소 / 과일',
      3: '정육 / 계란',
      4: '가공식품',
      5: '수산 / 건어물',
      6: '쌀 / 잡곡',
      7: '우유 / 유제품',
      8: '건강식품',
      9: '장 / 양념 / 소스',
      10: '기타',
    };

    return categoryMap[categoryId] || '기타';
  }

  /**
   * 카테고리 이름을 카테고리 ID로 변환 (임시 하드코딩)
   */
  static getCategoryIdByName(categoryName: string): number {
    const nameToIdMap: { [key: string]: number } = {
      베이커리: 1,
      '채소 / 과일': 2,
      '정육 / 계란': 3,
      가공식품: 4,
      '수산 / 건어물': 5,
      '쌀 / 잡곡': 6,
      '우유 / 유제품': 7,
      건강식품: 8,
      '장 / 양념 / 소스': 9,
      기타: 10,
    };

    return nameToIdMap[categoryName] || 10;
  }
}
