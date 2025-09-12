import { ApiService } from '../apiServices';

// 기존 타입들...
export type AutoCompleteSearchResponse = {
  ingredientId: number;
  ingredientName: string;
  categoryId: number;
  categoryName: string;
};

// 스캔 결과 타입 추가
export type ScanResultItem = {
  ingredientId: number;
  ingredientName: string;
  categoryId: number;
  categoryName: string;
  expirationDate: string;
  input_name: string;
};

export type PhotoScanResult = {
  id: number;
  ingredientId: number;
  categoryId: number;
  ingredientName: string;
  expirationDate: string;
  quantity: number;
};

// 기존 타입들...
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

// ConfirmedIngredient 타입 정의 추가
export type ConfirmedIngredient = {
  userInput: {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    expirationDate: string;
    itemCategory: string;
    photo?: string;
  };
  apiResult: {
    ingredientId: number;
    ingredientName: string;
    categoryId: number;
    categoryName: string;
  };
};

export class IngredientControllerAPI {
  private static readonly BASE_PATH = '/ap1/v1/ingredient';

  // ========== 스캔 관련 메소드 (추가) ==========

  /**
   * 식재료 사진 스캔
   * POST /ap1/v1/ingredient/scan-photo
   */
  static async scanPhoto(imageUri: string): Promise<PhotoScanResult[]> {
    try {
      console.log('식재료 사진 스캔 시작:', imageUri);

      // FormData 생성 (multipart/form-data)
      const formData = new FormData();
      formData.append('ingredientImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'ingredient.jpg',
      } as any);

      const response = await fetch(
        `${ApiService.BASE_URL}${this.BASE_PATH}/scan-photo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(await this.getAuthHeaders()),
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`스캔 요청 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('사진 스캔 결과:', result);

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('사진 스캔 실패:', error);
      throw new Error(`식재료 사진 스캔에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * 영수증 스캔
   * POST /ap1/v1/ingredient/scan-receipt
   */
  static async scanReceipt(imageUri: string): Promise<ScanResultItem[]> {
    try {
      console.log('영수증 스캔 시작:', imageUri);

      // FormData 생성
      const formData = new FormData();
      formData.append('receipt', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);

      const response = await fetch(
        `${ApiService.BASE_URL}${this.BASE_PATH}/scan-receipt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(await this.getAuthHeaders()),
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`스캔 요청 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('영수증 스캔 결과:', result);

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('영수증 스캔 실패:', error);
      throw new Error(`영수증 스캔에 실패했습니다: ${error.message}`);
    }
  }

  // 인증 헤더 가져오기 (ApiService에서 복사)
  private static async getAuthHeaders(): Promise<HeadersInit_> {
    const { AsyncStorageService } = require('../AsyncStorageService');
    const token = await AsyncStorageService.getAuthToken();
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // ========== 스캔 결과 변환 유틸리티 ==========

  /**
   * 스캔 결과를 ConfirmedIngredient 형태로 변환
   */
  static convertScanToConfirmed(
    scanResults: (PhotoScanResult | ScanResultItem)[],
    scanMode: 'ingredient' | 'receipt',
  ): ConfirmedIngredient[] {
    return scanResults.map((item, index) => {
      if (scanMode === 'ingredient') {
        const photoResult = item as PhotoScanResult;
        return {
          userInput: {
            id: `scan_${index + 1}`,
            name: photoResult.ingredientName,
            quantity: photoResult.quantity?.toString() || '1',
            unit: '개',
            expirationDate:
              photoResult.expirationDate || this.getDefaultExpiryDate(),
            itemCategory: this.getCategoryNameById(photoResult.categoryId),
          },
          apiResult: {
            ingredientId: photoResult.ingredientId,
            ingredientName: photoResult.ingredientName,
            categoryId: photoResult.categoryId,
            categoryName: this.getCategoryNameById(photoResult.categoryId),
          },
        };
      } else {
        const receiptResult = item as ScanResultItem;
        return {
          userInput: {
            id: `scan_${index + 1}`,
            name: receiptResult.input_name || receiptResult.ingredientName,
            quantity: '1',
            unit: '개',
            expirationDate:
              receiptResult.expirationDate || this.getDefaultExpiryDate(),
            itemCategory: this.getCategoryNameById(receiptResult.categoryId),
          },
          apiResult: {
            ingredientId: receiptResult.ingredientId,
            ingredientName: receiptResult.ingredientName,
            categoryId: receiptResult.categoryId,
            categoryName: receiptResult.categoryName,
          },
        };
      }
    });
  }

  /**
   * 통합 스캔 메소드 (PhotoPreviewScreen에서 사용)
   */
  static async performScan(
    imageUri: string,
    scanMode: 'ingredient' | 'receipt',
  ): Promise<ConfirmedIngredient[]> {
    try {
      let scanResults: (PhotoScanResult | ScanResultItem)[];

      if (scanMode === 'ingredient') {
        scanResults = await this.scanPhoto(imageUri);
      } else {
        scanResults = await this.scanReceipt(imageUri);
      }

      if (!scanResults || scanResults.length === 0) {
        console.log(`${scanMode} 스캔 결과 없음`);
        return [];
      }

      return this.convertScanToConfirmed(scanResults, scanMode);
    } catch (error) {
      console.error('스캔 처리 실패:', error);
      throw error;
    }
  }

  // ========== 기존 메소드들 (그대로 유지) ==========

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

    const params = new URLSearchParams();
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
   * AddItemScreen에서 사용하는 확인된 식재료들 추가
   */
  static async addConfirmedIngredients(
    refrigeratorId: string,
    confirmedIngredients: ConfirmedIngredient[],
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

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }

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
   * 기본 유통기한 생성 (현재 + 1개월)
   */
  static getDefaultExpiryDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * 카테고리 ID를 카테고리 이름으로 변환
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
   * 카테고리 이름을 카테고리 ID로 변환
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
