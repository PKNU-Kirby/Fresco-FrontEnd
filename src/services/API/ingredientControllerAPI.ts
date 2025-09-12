import { ApiService } from '../apiServices';
import { Platform } from 'react-native';
import { launchImageLibrary, MediaType } from 'react-native-image-picker';

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

// 스캔 결과 타입들
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

// ConfirmedIngredient 타입 정의
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

/**
 * 식재료 전용 API 컨트롤러
 * 엔드포인트: /ap1/v1/ingredient/*
 */
export class IngredientControllerAPI {
  private static readonly BASE_PATH = '/ap1/v1/ingredient';

  // ========== 실제 API 테스트를 위한 메소드들 ==========

  /**
   * 갤러리에서 이미지 선택해서 실제 API 테스트
   */
  static async testScanWithGalleryImage(
    scanMode: 'ingredient' | 'receipt',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      launchImageLibrary(
        {
          mediaType: 'photo' as MediaType,
          quality: 0.8,
          includeBase64: false,
        },
        async response => {
          if (response.didCancel || response.errorMessage) {
            reject(new Error('이미지 선택 취소됨'));
            return;
          }

          if (response.assets?.[0]?.uri) {
            try {
              console.log('갤러리에서 선택한 이미지로 실제 API 테스트 시작');
              console.log('선택된 이미지:', {
                uri: response.assets[0].uri,
                size: response.assets[0].fileSize,
                type: response.assets[0].type,
              });

              let result;
              if (scanMode === 'ingredient') {
                result = await this.scanPhoto(response.assets[0].uri);
              } else {
                result = await this.scanReceipt(response.assets[0].uri);
              }

              console.log('실제 API 응답:', result);
              resolve(result);
            } catch (error) {
              console.error('갤러리 이미지 API 테스트 실패:', error);
              reject(error);
            }
          } else {
            reject(new Error('이미지를 선택하지 않음'));
          }
        },
      );
    });
  }

  /**
   * 네트워크 연결 및 서버 상태 테스트
   */
  static async testServerConnection(): Promise<{
    isConnected: boolean;
    responseTime: number;
    serverInfo?: any;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      console.log('서버 연결 테스트 시작...');

      // 간단한 API 호출로 서버 연결 확인 (auto-complete API 사용)
      const response = await this.searchIngredients('테스트');
      const responseTime = Date.now() - startTime;

      console.log('서버 연결 성공:', {
        responseTime: `${responseTime}ms`,
        resultsCount: response.length,
      });

      return {
        isConnected: true,
        responseTime,
        serverInfo: {
          resultsCount: response.length,
          sampleResult: response[0] || null,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('서버 연결 실패:', error);

      return {
        isConnected: false,
        responseTime,
        error: error.message,
      };
    }
  }

  /**
   * API 엔드포인트별 상세 테스트
   */
  static async runFullAPITest(): Promise<{
    autoComplete: {
      success: boolean;
      data?: any;
      error?: string;
      responseTime: number;
    };
    serverConnection: {
      success: boolean;
      data?: any;
      error?: string;
      responseTime: number;
    };
    saveTest: {
      success: boolean;
      data?: any;
      error?: string;
      responseTime: number;
    };
  }> {
    const results = {
      autoComplete: { success: false, responseTime: 0 },
      serverConnection: { success: false, responseTime: 0 },
      saveTest: { success: false, responseTime: 0 },
    };

    // 1. Auto Complete API 테스트
    console.log('=== Auto Complete API 테스트 ===');
    const autoStart = Date.now();
    try {
      const autoResult = await this.searchIngredients('토마토');
      results.autoComplete = {
        success: true,
        data: autoResult,
        responseTime: Date.now() - autoStart,
      };
      console.log('Auto Complete 성공:', autoResult);
    } catch (error) {
      results.autoComplete = {
        success: false,
        error: error.message,
        responseTime: Date.now() - autoStart,
      };
      console.error('Auto Complete 실패:', error);
    }

    // 2. 서버 연결 테스트
    console.log('=== 서버 연결 테스트 ===');
    const connStart = Date.now();
    try {
      const connResult = await this.testServerConnection();
      results.serverConnection = {
        success: connResult.isConnected,
        data: connResult,
        responseTime: Date.now() - connStart,
      };
      console.log('서버 연결 테스트 완료:', connResult);
    } catch (error) {
      results.serverConnection = {
        success: false,
        error: error.message,
        responseTime: Date.now() - connStart,
      };
      console.error('서버 연결 테스트 실패:', error);
    }

    // 3. 저장 API 테스트 (실제 데이터로)
    console.log('=== 저장 API 테스트 ===');
    const saveStart = Date.now();
    try {
      // 먼저 auto-complete로 실제 식재료 찾기
      const ingredient = await this.findIngredientByName('토마토');

      if (ingredient) {
        console.log('저장 테스트는 실제 fridgeId가 필요하므로 스킵');
        results.saveTest = {
          success: true,
          data: {
            message: '저장 API 스킵 (fridgeId 필요)',
            foundIngredient: ingredient,
          },
          responseTime: Date.now() - saveStart,
        };
      } else {
        throw new Error('테스트용 식재료를 찾을 수 없음');
      }
    } catch (error) {
      results.saveTest = {
        success: false,
        error: error.message,
        responseTime: Date.now() - saveStart,
      };
      console.error('저장 API 테스트 실패:', error);
    }

    return results;
  }

  // ========== 기본 스캔 관련 메소드 ==========

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

      console.log('FormData 준비 완료, API 호출 시작...');

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

      console.log('API 응답 상태:', response.status);
      console.log(
        'API 응답 헤더:',
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 에러 응답 본문:', errorText);
        throw new Error(`스캔 API 실패: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('사진 스캔 API 성공 응답:', result);

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('사진 스캔 실패:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw error;
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

      console.log('FormData 준비 완료, API 호출 시작...');

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

      console.log('API 응답 상태:', response.status);
      console.log(
        'API 응답 헤더:',
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 에러 응답 본문:', errorText);
        throw new Error(`스캔 API 실패: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('영수증 스캔 API 성공 응답:', result);

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('영수증 스캔 실패:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw error;
    }
  }

  // 인증 헤더 가져오기
  private static async getAuthHeaders(): Promise<HeadersInit_> {
    try {
      const { AsyncStorageService } = require('../AsyncStorageService');
      const token = await AsyncStorageService.getAuthToken();
      console.log('인증 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
      return {
        ...(token && { Authorization: `Bearer ${token}` }),
      };
    } catch (error) {
      console.error('인증 헤더 생성 실패:', error);
      return {};
    }
  } // ========== 시뮬레이터용 안전한 메소드들 ==========

  static async scanPhotoForSimulator(
    imageUri: string,
  ): Promise<PhotoScanResult[]> {
    try {
      console.log('시뮬레이터용 식재료 사진 스캔 시작:', imageUri);

      if (imageUri.startsWith('data:image')) {
        console.log('Base64 이미지 감지됨, 목업 데이터 반환');

        const mockResponse: PhotoScanResult[] = [
          {
            id: 1,
            ingredientId: 123,
            categoryId: 2,
            ingredientName: '토마토',
            expirationDate: '2025-10-12',
            quantity: 2,
          },
          {
            id: 2,
            ingredientId: 456,
            categoryId: 2,
            ingredientName: '오이',
            expirationDate: '2025-09-20',
            quantity: 1,
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('시뮬레이터 목업 스캔 결과:', mockResponse);
        return mockResponse;
      }

      return await this.scanPhoto(imageUri);
    } catch (error) {
      console.error('시뮬레이터 사진 스캔 실패:', error);
      throw new Error(
        `시뮬레이터 식재료 사진 스캔에 실패했습니다: ${error.message}`,
      );
    }
  }

  static async scanReceiptForSimulator(
    imageUri: string,
  ): Promise<ScanResultItem[]> {
    try {
      console.log('시뮬레이터용 영수증 스캔 시작:', imageUri);

      if (imageUri.startsWith('data:image')) {
        console.log('Base64 이미지 감지됨, 목업 데이터 반환');

        const mockResponse: ScanResultItem[] = [
          {
            ingredientId: 789,
            ingredientName: '우유',
            categoryId: 7,
            categoryName: '우유 / 유제품',
            expirationDate: '2025-09-25',
            input_name: '우유 1L',
          },
          {
            ingredientId: 101,
            ingredientName: '식빵',
            categoryId: 1,
            categoryName: '베이커리',
            expirationDate: '2025-09-15',
            input_name: '식빵',
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('시뮬레이터 목업 영수증 스캔 결과:', mockResponse);
        return mockResponse;
      }

      return await this.scanReceipt(imageUri);
    } catch (error) {
      console.error('시뮬레이터 영수증 스캔 실패:', error);
      throw new Error(
        `시뮬레이터 영수증 스캔에 실패했습니다: ${error.message}`,
      );
    }
  }

  /**
   * 환경에 따라 적절한 스캔 메소드 선택 (안전 모드)
   */
  static async performScanSafe(
    imageUri: string,
    scanMode: 'ingredient' | 'receipt',
  ): Promise<ConfirmedIngredient[]> {
    try {
      let scanResults: (PhotoScanResult | ScanResultItem)[];

      const isSimulator = Platform.OS === 'ios' && __DEV__;
      const isBase64 = imageUri.startsWith('data:image');

      if (isSimulator || isBase64) {
        console.log('시뮬레이터 모드로 스캔 실행');

        if (scanMode === 'ingredient') {
          scanResults = await this.scanPhotoForSimulator(imageUri);
        } else {
          scanResults = await this.scanReceiptForSimulator(imageUri);
        }
      } else {
        console.log('실제 디바이스 모드로 스캔 실행');

        if (scanMode === 'ingredient') {
          scanResults = await this.scanPhoto(imageUri);
        } else {
          scanResults = await this.scanReceipt(imageUri);
        }
      }

      if (!scanResults || scanResults.length === 0) {
        console.log(`${scanMode} 스캔 결과 없음`);
        return [];
      }

      return this.convertScanToConfirmed(scanResults, scanMode);
    } catch (error) {
      console.error('안전 스캔 처리 실패:', error);
      throw error;
    }
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

  // ========== 기존 메소드들 ==========

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
   * 냉장고 식재료 삭제 (임시 구현)
   */
  static async deleteRefrigeratorIngredient(
    refrigeratorIngredientId: string,
  ): Promise<void> {
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

  // ========== 디버깅 및 개발용 메소드들 ==========

  /**
   * API 기본 URL과 경로 확인
   */
  static getAPIInfo(): { baseURL: string; basePath: string; fullURL: string } {
    return {
      baseURL: ApiService.BASE_URL || 'BASE_URL_NOT_SET',
      basePath: this.BASE_PATH,
      fullURL: `${ApiService.BASE_URL || 'BASE_URL_NOT_SET'}${this.BASE_PATH}`,
    };
  }

  /**
   * 개발용 로그 출력
   */
  static logAPIInfo(): void {
    const info = this.getAPIInfo();
    console.log('=== IngredientControllerAPI 정보 ===');
    console.log('Base URL:', info.baseURL);
    console.log('Base Path:', info.basePath);
    console.log('Full URL:', info.fullURL);
    console.log('================================');
  }
}

// Part 1과 Part 2를 합쳐서 완전한 IngredientControllerAPI.ts 파일이 됩니다.
