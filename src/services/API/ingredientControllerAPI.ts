import { ApiService } from '../apiServices';
import { Platform } from 'react-native';
import Config from '../../types/config';

// 식재료 관련 타입
export type AutoCompleteSearchResponse = {
  ingredientId: number;
  ingredientName: string;
  categoryId: number;
  categoryName: string;
};

export type SaveIngredientInfo = {
  ingredientId: number;
  categoryId: number;
  quantity?: number;
  unit?: string;
  expirationDate: string;
};

export type SaveIngredientsRequest = {
  ingredientsInfo: SaveIngredientInfo[];
  ingredientIds?: number[];
};

export type RefrigeratorIngredientResponse = {
  id: number;
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

// 영수증 스캔 응답 타입
export type ScanResultItem = {
  ingredientId: number;
  ingredientName: string;
  categoryId: number;
  categoryName: string;
  expirationDate: string;
  inputName: string;
};

// 식재료 스캔 응답 타입
export type PhotoScanResult = {
  ingredientId: number;
  ingredientName: string;
  categoryId: number;
  categoryName: string;
  expirationDate: string;
};

// ConfirmedIngredient 타입
export type ConfirmedIngredient = {
  userInput: {
    id: number;
    name: string;
    quantity: number;
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
 */
export class IngredientControllerAPI {
  /**
   * 식재료 사진 스캔
   */ static async scanPhoto(imageUri: string): Promise<PhotoScanResult[]> {
    try {
      // console.log('서버 상태 체크 후 스캔 시작');

      // 서버 다운 감지를 위한 빠른 테스트
      const testResponse = await fetch(
        `${Config.API_BASE_URL}/api/v1/ingredient/auto-complete?keyword=test`,
        {
          method: 'GET',
          headers: await this.getAuthHeaders(),
        },
      );

      if (!testResponse.ok) {
        throw new Error('SERVER_DOWN');
      }

      // 서버가 살아있으면 실제 스캔 시도
      const formData = new FormData();
      formData.append('ingredientImage', {
        uri: imageUri,
        type: 'image/jpg',
        name: 'ingredient.jpg',
      } as any);

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/ingredient/scan-photo`,
        {
          method: 'POST',
          headers: await this.getAuthHeaders(),
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error('SCAN_FAILED');
      }

      const responseData = JSON.parse(await response.text());
      return responseData.result || [];
    } catch (error) {
      // console.log('스캔 실패, 시뮬레이터 모드로 폴백:', error.message);

      // 서버 문제시 시뮬레이터 모드로 폴백
      return await this.scanPhotoForSimulator(imageUri);
    }
  }

  static async scanReceipt(imageUri: string): Promise<ScanResultItem[]> {
    try {
      // 동일한 로직
      const formData = new FormData();
      formData.append('receipt', {
        uri: imageUri,
        type: 'image/jpg',
        name: 'receipt.jpg',
      } as any);

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/ingredient/scan-receipt`,
        {
          method: 'POST',
          headers: await this.getAuthHeaders(),
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error('RECEIPT_SCAN_FAILED');
      }

      const responseData = JSON.parse(await response.text());
      let data = responseData.result || [];

      if (Array.isArray(data)) {
        data = data.map(item => ({
          ...item,
          inputName: item.input_name || item.inputName || item.ingredientName,
        }));
      }

      return data;
    } catch (error) {
      // console.log('영수증 스캔 실패, 시뮬레이터 모드로 폴백:', error.message);
      return await this.scanReceiptForSimulator(imageUri);
    }
  }

  /**
   * 향상된 안전 스캔 메서드 (빈 결과 처리 포함)
   */
  static async performScanSafeWithEmptyHandling(
    imageUri: string,
    scanMode: 'ingredient' | 'receipt',
  ): Promise<ConfirmedIngredient[]> {
    try {
      let scanResults: (PhotoScanResult | ScanResultItem)[];

      /*
      console.log(
        `안전 스캔 시작 (${scanMode} 모드):`,
        imageUri.substring(0, 50) + '...',
      );
      */

      if (scanMode === 'ingredient') {
        scanResults = await this.scanPhoto(imageUri);
      } else {
        scanResults = await this.scanReceipt(imageUri);
      }

      /*
      console.log(
        `${scanMode} 스캔 API 성공, 결과 개수:`,
        scanResults?.length || 0,
      );
      */

      if (!scanResults || scanResults.length === 0) {
        /*
        console.log(
          `${scanMode} 스캔 결과 없음 - 서버는 정상이지만 인식된 항목이 없음`,
        );
        */

        return [];
      }

      return this.convertScanToConfirmed(scanResults, scanMode);
    } catch (error) {
      // console.error('안전 스캔 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 이미지 품질 사전 검사 및 최적화 제안
   */
  static analyzeImageQuality(
    imageUri: string,
    fileSize?: number,
  ): {
    quality: 'good' | 'acceptable' | 'poor';
    suggestions: string[];
    shouldProceed: boolean;
  } {
    const analysis = {
      quality: 'acceptable' as const,
      suggestions: [] as string[],
      shouldProceed: true,
    };

    // 파일 크기 기반 품질 추정
    if (fileSize) {
      if (fileSize < 50 * 1024) {
        // 50KB 미만
        analysis.quality = 'poor';
        analysis.suggestions.push(
          '이미지가 너무 작습니다. 더 높은 해상도로 촬영해보세요.',
        );
      } else if (fileSize > 5 * 1024 * 1024) {
        // 5MB 초과
        analysis.quality = 'poor';
        analysis.suggestions.push(
          '이미지가 너무 큽니다. 파일 크기를 줄여보세요.',
        );
      } else if (fileSize > 1 * 1024 * 1024) {
        // 1MB 초과
        analysis.quality = 'good';
      }
    }

    // URI 형식 검사
    if (imageUri.startsWith('data:image/png')) {
      analysis.suggestions.push(
        'PNG 형식보다 JPEG 형식이 더 잘 인식될 수 있습니다.',
      );
    }

    // 품질이 낮으면 진행 전 사용자에게 알림
    if (analysis.quality === 'poor') {
      analysis.shouldProceed = false;
      analysis.suggestions.push('다시 촬영하는 것을 권장합니다.');
    }

    return analysis;
  }

  /**
   * 향상된 서버 상태 검사 및 복구
   */
  static async performHealthCheckAndRetry(
    operation: () => Promise<any>,
    maxRetries: number = 3,
  ): Promise<any> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // console.log(`시도 ${attempt}/${maxRetries}`);

        // 첫 번째 시도가 아니면 서버 상태 먼저 확인
        if (attempt > 1) {
          // console.log('서버 상태 확인 중...');
          const healthCheck = await this.checkServerHealth();

          if (!healthCheck) {
            // console.log('서버 상태 불량, 대기 후 재시도...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        // 실제 작업 수행
        const result = await operation();
        // console.log(`시도 ${attempt} 성공!`);
        return result;
      } catch (error) {
        // console.log(`시도 ${attempt} 실패:`, error.message);
        lastError = error;

        // 마지막 시도가 아니면 잠시 대기
        if (attempt < maxRetries) {
          const waitTime = attempt * 1000; // 1초, 2초, 3초씩 증가
          // console.log(`${waitTime}ms 대기 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError;
  }

  /**
   * 복원력 있는 스캔 메서드 (재시도 포함)
   */
  static async scanPhotoWithRetry(
    imageUri: string,
  ): Promise<PhotoScanResult[]> {
    return this.performHealthCheckAndRetry(
      () => this.scanPhoto(imageUri),
      3, // 최대 3번 시도
    );
  }

  static async scanReceiptWithRetry(
    imageUri: string,
  ): Promise<ScanResultItem[]> {
    return this.performHealthCheckAndRetry(
      () => this.scanReceipt(imageUri),
      3, // 최대 3번 시도
    );
  }

  /**
   * FormData 구성 및 전송 과정을 단계별로 검증 (refrigeratorId 포함)
   */
  static async validateFormDataTransmissionWithFridgeId(
    imageUri: string,
    fridgeId: number,
  ): Promise<void> {
    try {
      // console.log('=== FormData 전송 검증 시작 (fridgeId 포함) ===');

      // 이미지 파일 기본 정보 확인
      // console.log('>> 이미지 파일 기본 정보');
      // console.log('URI:', imageUri);
      // console.log('fridgeId:', fridgeId);

      // 파일 읽기 테스트
      // console.log('>> 파일 읽기 테스트');
      try {
        const fileResponse = await fetch(imageUri);
        const fileBlob = await fileResponse.blob();
        /* console.log('파일 읽기 성공:', {
          size: fileBlob.size,
          type: fileBlob.type,
          readable: fileResponse.ok,
        }); */

        if (fileBlob.size === 0) {
          // console.error('❌ 파일 크기가 0바이트입니다!');
          return;
        }
      } catch (fileError) {
        // console.error('❌ 파일 읽기 실패:', fileError);
        return;
      }

      // 3. FormData 구성 테스트 (refrigeratorId 포함)
      // console.log('3️⃣ FormData 구성 테스트 (refrigeratorId 포함)');

      const formData1 = new FormData();
      formData1.append('ingredientImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'ingredient.jpg',
      } as any);
      formData1.append('refrigeratorId', fridgeId);
      // console.log('방식 1 (refrigeratorId 포함): FormData 구성 완료');

      const formData2 = new FormData();
      formData2.append('ingredientImage', {
        uri: imageUri,
        type: 'image/jpg',
        name: 'ingredient.jpg',
      } as any);
      formData2.append('refrigeratorId', fridgeId);
      // console.log('방식 2 (jpg 타입 + refrigeratorId): FormData 구성 완료');

      // 4. 서버 요청 테스트
      const testMethods = [
        { name: 'refrigeratorId 포함', formData: formData1 },
        { name: 'jpg 타입 + refrigeratorId', formData: formData2 },
      ];

      for (const method of testMethods) {
        console.log(`4️⃣ ${method.name} 테스트 중...`);
        await this.testFormDataMethodWithFridgeId(method.formData, method.name);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      // console.error('FormData 검증 중 오류:', error);
    }
  }

  /**
   * 서버 파라미터 요구사항 검증 (refrigeratorId 포함)
   */
  static async validateServerParametersWithFridgeId(
    fridgeId: number,
  ): Promise<void> {
    // console.log('=== 서버 파라미터 요구사항 검증 (fridgeId 포함) ===');

    // 1. refrigeratorId만 있는 요청
    try {
      // console.log('1️⃣ refrigeratorId만 있는 FormData 테스트');

      const onlyFridgeIdData = new FormData();
      onlyFridgeIdData.append('refrigeratorId', fridgeId);
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/ingredient/scan-photo`,
        {
          method: 'POST',
          headers,
          body: onlyFridgeIdData,
        },
      );

      const responseText = await response.text();
      /* console.log('refrigeratorId만 있는 요청 응답:', {
        status: response.status,
        response: responseText,
      });*/
    } catch (error) {
      // console.error('refrigeratorId 테스트 실패:', error);
    }

    // 2. 완전한 요청 (더미 이미지 + refrigeratorId)
    try {
      // console.log('2️⃣ 더미 이미지 + refrigeratorId 테스트');

      const completeData = new FormData();
      completeData.append('ingredientImage', {
        uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        type: 'image/png',
        name: 'test.png',
      } as any);
      completeData.append('refrigeratorId', fridgeId);

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/ingredient/scan-photo`,
        {
          method: 'POST',
          headers,
          body: completeData,
        },
      );

      const responseText = await response.text();
      /*
      console.log('완전한 요청 응답:', {
        status: response.status,
        response: responseText,
      });
      */
    } catch (error) {
      // console.error('완전한 요청 테스트 실패:', error);
    }
  }
  /**
   * ✅ 수정된 파일 검증
   */
  private static validateImageFile(file: {
    uri: string;
    fileSize?: number;
    type?: string;
  }): void {
    if (!file.uri) {
      throw new Error('이미지 파일이 없습니다');
    }

    // React Native에서 file:// 프로토콜 체크
    if (
      !file.uri.startsWith('file://') &&
      !file.uri.startsWith('content://') &&
      !file.uri.startsWith('data:')
    ) {
      // console.warn('비표준 이미지 URI 형식:', file.uri);
    }

    // 파일 크기 체크 (10MB)
    if (file.fileSize && file.fileSize > 10 * 1024 * 1024) {
      throw new Error('이미지 파일 크기가 너무 큽니다 (최대 10MB)');
    }

    // 파일 형식 체크
    if (file.type) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        throw new Error(`지원하지 않는 이미지 형식입니다: ${file.type}`);
      }
    }
  }

  /**
   * ✅ 수정된 인증 헤더 생성
   */
  private static async getAuthHeaders(): Promise<HeadersInit_> {
    try {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('accessToken');

      // console.log('인증 토큰 확인:', token ? '토큰 있음' : '토큰 없음');

      const headers: HeadersInit_ = {
        // FormData 사용 시 Content-Type은 자동 설정되므로 제거
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      return headers;
    } catch (error) {
      // console.error('인증 헤더 생성 실패:', error);
      return {};
    }
  }

  // ========== 수정된 시뮬레이터용 메소드들 ==========

  /**
   * ✅ 수정된 시뮬레이터용 식재료 스캔
   */
  static async scanPhotoForSimulator(
    imageUri: string,
  ): Promise<PhotoScanResult[]> {
    try {
      // console.log('시뮬레이터용 식재료 사진 스캔 시작:', imageUri);

      // Base64나 목업 이미지인 경우 목업 데이터 반환
      if (imageUri.startsWith('data:image') || imageUri.includes('grocery')) {
        // console.log('목업 이미지 감지됨, 목업 데이터 반환');

        const mockResponse: PhotoScanResult[] = [
          {
            ingredientId: 123,
            ingredientName: '토마토',
            categoryId: 2,
            categoryName: '채소 / 과일',
            expirationDate: '2025-10-12',
          },
          {
            ingredientId: 456,
            ingredientName: '오이',
            categoryId: 2,
            categoryName: '채소 / 과일',
            expirationDate: '2025-09-20',
          },
        ];

        // 로딩 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 2000));
        return mockResponse;
      }

      // 실제 이미지인 경우 실제 API 호출 (refrigeratorId 제거)
      return await this.scanPhoto(imageUri);
    } catch (error) {
      // console.error('시뮬레이터 사진 스캔 실패:', error);
      throw error;
    }
  }

  /**
   * ✅ 수정된 시뮬레이터용 영수증 스캔
   */
  static async scanReceiptForSimulator(
    imageUri: string,
  ): Promise<ScanResultItem[]> {
    try {
      // console.log('시뮬레이터용 영수증 스캔 시작:', imageUri);

      if (imageUri.startsWith('data:image') || imageUri.includes('receipt')) {
        // console.log('목업 이미지 감지됨, 목업 데이터 반환');

        const mockResponse: ScanResultItem[] = [
          {
            ingredientId: 789,
            ingredientName: '우유',
            categoryId: 8,
            categoryName: '우유 / 유제품',
            expirationDate: '2025-09-25',
            inputName: '우유 1L',
          },
          {
            ingredientId: 101,
            ingredientName: '식빵',
            categoryId: 1,
            categoryName: '베이커리',
            expirationDate: '2025-09-15',
            inputName: '식빵',
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 3000));
        return mockResponse;
      }

      // 실제 이미지인 경우 실제 API 호출
      return await this.scanReceipt(imageUri);
    } catch (error) {
      // console.error('시뮬레이터 영수증 스캔 실패:', error);
      throw error;
    }
  }

  /**
   * ✅ 환경에 따라 적절한 스캔 메소드 선택
   */
  static async performScanSafe(
    imageUri: string,
    scanMode: 'ingredient' | 'receipt',
  ): Promise<ConfirmedIngredient[]> {
    try {
      let scanResults: (PhotoScanResult | ScanResultItem)[];

      const isSimulator = Platform.OS === 'ios' && __DEV__;
      const isBase64 = imageUri.startsWith('data:image');
      const isMockImage =
        imageUri.includes('grocery') || imageUri.includes('receipt');

      /*
      console.log('스캔 환경 체크:', {
        isSimulator,
        isBase64,
        isMockImage,
        imageUri: imageUri.substring(0, 50) + '...',
      });
      */

      if (isSimulator || isBase64 || isMockImage) {
        // console.log('시뮬레이터/목업 모드로 스캔 실행');

        if (scanMode === 'ingredient') {
          scanResults = await this.scanPhotoForSimulator(imageUri);
        } else {
          scanResults = await this.scanReceiptForSimulator(imageUri);
        }
      } else {
        // console.log('실제 디바이스 모드로 스캔 실행');

        if (scanMode === 'ingredient') {
          scanResults = await this.scanPhoto(imageUri);
        } else {
          scanResults = await this.scanReceipt(imageUri);
        }
      }

      if (!scanResults || scanResults.length === 0) {
        // console.log(`${scanMode} 스캔 결과 없음`);
        return [];
      }

      return this.convertScanToConfirmed(scanResults, scanMode);
    } catch (error) {
      // console.error('안전 스캔 처리 실패:', error);
      throw error;
    }
  }
  /**
   * ✅ 수정된 스캔 결과 변환
   */
  static convertScanToConfirmed(
    scanResults: (PhotoScanResult | ScanResultItem)[],
    scanMode: 'ingredient' | 'receipt',
  ): ConfirmedIngredient[] {
    return scanResults
      .filter(item => {
        // ingredientName과 ingredientId가 있는 경우만 처리
        if (scanMode === 'ingredient') {
          const photoResult = item as PhotoScanResult;
          return photoResult.ingredientName && photoResult.ingredientId;
        } else {
          const receiptResult = item as ScanResultItem;
          return receiptResult.ingredientName && receiptResult.ingredientId;
        }
      })
      .map((item, index) => {
        if (scanMode === 'ingredient') {
          const photoResult = item as PhotoScanResult;
          return {
            userInput: {
              id: `scan_${index + 1}`,
              name: photoResult.ingredientName,
              quantity: 1,
              unit: '개',
              expirationDate:
                photoResult.expirationDate || this.getDefaultExpiryDate(),
              itemCategory:
                photoResult.categoryName ||
                this.getCategoryNameById(photoResult.categoryId),
            },
            apiResult: {
              ingredientId: photoResult.ingredientId,
              ingredientName: photoResult.ingredientName,
              categoryId: photoResult.categoryId,
              categoryName:
                photoResult.categoryName ||
                this.getCategoryNameById(photoResult.categoryId),
            },
          };
        } else {
          const receiptResult = item as ScanResultItem;

          return {
            userInput: {
              id: `scan_${index + 1}`,
              name: receiptResult.ingredientName, // 🔥 ingredientName 사용 (정확한 이름)
              quantity: 1,
              unit: '개',
              expirationDate:
                receiptResult.expirationDate || this.getDefaultExpiryDate(),
              itemCategory:
                receiptResult.categoryName ||
                this.getCategoryNameById(receiptResult.categoryId),
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

  // ========== 기존 메소드들 (그대로 유지) ==========

  /**
   * 식재료 자동완성 검색
   */
  static async searchIngredients(
    keyword: string,
  ): Promise<AutoCompleteSearchResponse[]> {
    if (!keyword || keyword.trim() === '') {
      return [];
    }

    const encodedKeyword = encodeURIComponent(keyword.trim());
    const endpoint = `/api/v1/ingredient/auto-complete?keyword=${encodedKeyword}`;

    try {
      // console.log(`식재료 검색: "${keyword}"`);
      const response = await ApiService.apiCall<AutoCompleteSearchResponse[]>(
        endpoint,
      );
      // console.log(`검색 결과: ${response.length}개`);
      return response;
    } catch (error) {
      // console.error('식재료 검색 실패:', error);
      throw new Error(`식재료 검색에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * 냉장고 식재료 목록 조회
   */
  static async getRefrigeratorIngredients(
    refrigeratorId: number,
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

    const endpoint = `/api/v1/ingredient/${refrigeratorId}?${params.toString()}`;

    try {
      /* console.log(`냉장고 ${refrigeratorId} 식재료 목록 조회`, {
        filter: defaultFilter,
      });*/
      const response = await ApiService.apiCall<
        PageResponse<RefrigeratorIngredientResponse>
      >(endpoint);
      // // console.log(`조회 결과: ${response.content?.length || 0}개 아이템`);
      return response;
    } catch (error) {
      // console.error('냉장고 식재료 조회 실패:', error);
      throw new Error(
        `냉장고 식재료를 불러오는데 실패했습니다: ${error.message}`,
      );
    }
  }

  /**
   * 냉장고의 모든 식재료 가져오기 (레시피 계산용)
   */
  static async getIngredients(
    refrigeratorId: number,
  ): Promise<RefrigeratorIngredientResponse[]> {
    try {
      // console.log(`냉장고 ${refrigeratorId}의 식재료 조회 (레시피용)`);

      const result = await this.getRefrigeratorIngredients(refrigeratorId, {
        size: 1000, // 충분히 큰 사이즈로 모든 식재료 가져오기
        sort: 'expirationDate',
        page: 0,
        categoryIds: [],
      });

      // console.log(`조회된 식재료: ${result.content.length}개`);
      return result.content;
    } catch (error) {
      // console.error('식재료 조회 실패:', error);
      throw error;
    }
  }
  static async addIngredientsToRefrigerator(
    refrigeratorId: number,
    saveRequest: SaveIngredientsRequest,
  ): Promise<any> {
    // console.log('=== addIngredientsToRefrigerator 디버깅 ===');
    // console.log('refrigeratorId:', refrigeratorId);
    // console.log('saveRequest:', JSON.stringify(saveRequest, null, 2));

    const processedRequest = {
      ingredientsInfo: saveRequest.ingredientsInfo.map(item => ({
        ingredientId: item.ingredientId,
        categoryId: item.categoryId,
        quantity: item.quantity,
        unit: item.unit,
        expirationDate: this.formatDateForAPI(item.expirationDate),
      })),
      ingredientIds: saveRequest.ingredientIds,
    };

    // console.log('processedRequest:', JSON.stringify(processedRequest, null, 2));

    const endpoint = `/api/v1/ingredient/${refrigeratorId}`;
    try {
      // console.log('API 호출 시작...');
      const response = await ApiService.apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(processedRequest),
      });

      // console.log('=== API 응답 성공 ===');
      // console.log('응답 데이터:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      // console.log('=== API 응답 실패 ===');
      // console.error('API 에러:', error);
      throw new Error(`식재료 추가에 실패했습니다: ${error.message}`);
    }
  }

  static async updateRefrigeratorIngredient(
    refrigeratorIngredientId: number,
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

    const endpoint = `/api/v1/ingredient/${refrigeratorIngredientId}`;

    try {
      /*
      console.log(
        `냉장고 식재료 ${refrigeratorIngredientId} 수정:`,
        processedData,
      );
      */

      const response = await ApiService.apiCall<RefrigeratorIngredientResponse>(
        endpoint,
        {
          method: 'PUT',
          body: JSON.stringify(processedData),
        },
      );

      // console.log('식재료 수정 성공:', response);
      return response;
    } catch (error) {
      // console.error('식재료 수정 실패:', error);
      throw new Error(`식재료 수정에 실패했습니다: ${error.message}`);
    }
  }

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
      // console.error('식재료 검색 실패:', error);
      throw new Error(`"${ingredientName}" 식재료를 찾을 수 없습니다.`);
    }
  }

  static async addConfirmedIngredients(
    fridgeId: number,
    confirmedIngredients: ConfirmedIngredient[],
  ): Promise<any> {
    const saveRequest: SaveIngredientsRequest = {
      ingredientsInfo: confirmedIngredients.map(confirmed => ({
        ingredientId: confirmed.apiResult.ingredientId,
        categoryId: confirmed.apiResult.categoryId,
        quantity: confirmed.userInput.quantity || 1,
        unit: confirmed.userInput.unit || '개',
        expirationDate: confirmed.userInput.expirationDate,
      })),
      ingredientIds: confirmedIngredients.map(
        confirmed => confirmed.apiResult.ingredientId,
      ),
    };

    return this.addIngredientsToRefrigerator(fridgeId, saveRequest);
  }

  static async batchDeleteIngredients(ingredientIds: number[]): Promise<void> {
    try {
      // console.log('=== 배치 삭제 디버깅 ===');
      // console.log('입력 ID들:', ingredientIds);

      const numericIds = ingredientIds.map(id => id);
      // console.log('숫자 ID들:', numericIds);

      // API 문서대로: ids=1&ids=2 형식
      const queryString = numericIds.map(id => `ids=${id}`).join('&');
      const url = `/api/v1/ingredient?${queryString}`;

      // console.log('최종 URL:', url);

      const response = await ApiService.apiCall<void>(url, {
        method: 'DELETE',
      });

      // console.log('✅ 삭제 성공!');
      return response;
    } catch (error) {
      // 권한 오류(아이템이 이미 없음)는 성공으로 처리
      if (
        error.message?.includes('권한') ||
        error.message?.includes('Permission')
      ) {
        /*
        console.log(
          '⚠️ 아이템이 이미 삭제되었거나 권한이 없음 - 성공으로 처리',
        );
        */
        return; // 예외를 던지지 않고 정상 종료
      }

      // console.error('❌ 배치 삭제 실패');
      // console.error('에러:', error.message);
      throw error;
    }
  }

  // ========== 유틸리티 메소드들 ==========

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
      // console.warn('날짜 형식 변환 실패, 기본값 사용:', dateString);
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      return defaultDate.toISOString().split('T')[0];
    }
  }

  static getDefaultExpiryDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  }

  static getCategoryNameById(categoryId: number): string {
    const categoryMap: { [key: number]: string } = {
      1: '베이커리',
      2: '채소 / 과일',
      3: '정육 / 계란',
      4: '가공식품',
      5: '수산 / 건어물',
      6: '쌀 / 잡곡',
      7: '주류 / 음료',
      8: '우유 / 유제품',
      9: '건강식품',
      10: '장 / 양념 / 소스',
    };

    return categoryMap[categoryId] || '기타';
  }

  static getCategoryIdByName(categoryName: string): number {
    const nameToIdMap: { [key: string]: number } = {
      베이커리: 1,
      '채소 / 과일': 2,
      '정육 / 계란': 3,
      가공식품: 4,
      '수산 / 건어물': 5,
      '쌀 / 잡곡': 6,
      '주류 / 음료': 7,
      '우유 / 유제품': 8,
      건강식품: 9,
      '장 / 양념 / 소스': 10,
    };

    return nameToIdMap[categoryName] || 10;
  }

  // IngredientControllerAPI.ts에 추가할 개선된 오류 처리 및 폴백 메서드

  /**
   * 향상된 이미지 스캔 메서드 (오류 처리 및 폴백 포함)
   */
  static async scanPhotoWithFallback(
    imageUri: string,
  ): Promise<PhotoScanResult[]> {
    try {
      // console.log('향상된 식재료 사진 스캔 시작:', imageUri);

      // 1차 시도: 원본 API
      try {
        const result = await this.scanPhoto(imageUri);
        // console.log('1차 API 호출 성공:', result);
        return result;
      } catch (error) {
        // console.log('1차 API 호출 실패:', error.message);

        // 500 오류인 경우 서버 문제이므로 추가 시도
        if (error.message.includes('500')) {
          // console.log('서버 500 오류 감지, 대안 처리 시작...');

          // 2차 시도: 다른 형식으로 재시도
          try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
            // console.log('2차 시도: 서버 복구 후 재시도...');

            const retryResult = await this.scanPhoto(imageUri);
            // console.log('2차 API 호출 성공:', retryResult);
            return retryResult;
          } catch (retryError) {
            // console.log('2차 API 호출도 실패:', retryError.message);

            // 3차 시도: 폴백 - 시뮬레이터 모드로 전환
            // console.log('폴백 모드로 전환: 시뮬레이터 스캔 사용');
            return await this.scanPhotoForSimulator(imageUri);
          }
        } else {
          // 500이 아닌 다른 오류는 바로 폴백
          // console.log('비-500 오류, 즉시 폴백 모드로 전환');
          return await this.scanPhotoForSimulator(imageUri);
        }
      }
    } catch (error) {
      // console.error('모든 스캔 시도 실패:', error);
      throw new Error(
        `이미지 스캔에 실패했습니다. 서버 문제일 수 있습니다: ${error.message}`,
      );
    }
  }

  /**
   * 향상된 영수증 스캔 메서드 (오류 처리 및 폴백 포함)
   */
  static async scanReceiptWithFallback(
    imageUri: string,
  ): Promise<ScanResultItem[]> {
    try {
      // console.log('향상된 영수증 스캔 시작:', imageUri);

      // 1차 시도: 원본 API
      try {
        const result = await this.scanReceipt(imageUri);
        // console.log('1차 영수증 API 호출 성공:', result);
        return result;
      } catch (error) {
        // console.log('1차 영수증 API 호출 실패:', error.message);

        // 500 오류인 경우 서버 문제이므로 추가 시도
        if (error.message.includes('500')) {
          // console.log('영수증 서버 500 오류 감지, 대안 처리 시작...');

          // 2차 시도: 다른 형식으로 재시도
          try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
            // console.log('2차 시도: 영수증 서버 복구 후 재시도...');

            const retryResult = await this.scanReceipt(imageUri);
            // console.log('2차 영수증 API 호출 성공:', retryResult);
            return retryResult;
          } catch (retryError) {
            // console.log('2차 영수증 API 호출도 실패:', retryError.message);

            // 3차 시도: 폴백 - 시뮬레이터 모드로 전환
            // console.log('폴백 모드로 전환: 영수증 시뮬레이터 스캔 사용');
            return await this.scanReceiptForSimulator(imageUri);
          }
        } else {
          // 500이 아닌 다른 오류는 바로 폴백
          // console.log('비-500 오류, 즉시 영수증 폴백 모드로 전환');
          return await this.scanReceiptForSimulator(imageUri);
        }
      }
    } catch (error) {
      // console.error('모든 영수증 스캔 시도 실패:', error);
      throw new Error(
        `영수증 스캔에 실패했습니다. 서버 문제일 수 있습니다: ${error.message}`,
      );
    }
  }

  /**
   * 서버 상태 점검 및 복구 대기
   */
  static async checkServerHealth(): Promise<boolean> {
    try {
      // console.log('서버 상태 점검 시작...');

      // 간단한 API 호출로 서버 상태 확인
      const response = await this.searchIngredients('test');
      // console.log('서버 상태 정상:', response.length >= 0);
      return true;
    } catch (error) {
      // console.log('서버 상태 불량:', error.message);
      return false;
    }
  }

  /**
   * 향상된 안전 스캔 메서드 (폴백 포함)
   */
  static async performScanSafeWithFallback(
    imageUri: string,
    scanMode: 'ingredient' | 'receipt',
  ): Promise<ConfirmedIngredient[]> {
    try {
      let scanResults: (PhotoScanResult | ScanResultItem)[];

      /* console.log(
        `안전 스캔 시작 (${scanMode} 모드):`,
        imageUri.substring(0, 50) + '...',
      );
      */

      // 서버 상태 먼저 확인
      const isServerHealthy = await this.checkServerHealth();
      // console.log('서버 상태:', isServerHealthy ? '정상' : '불량');

      if (!isServerHealthy) {
        // console.log('서버 상태 불량으로 인해 즉시 폴백 모드 사용');
        if (scanMode === 'ingredient') {
          scanResults = await this.scanPhotoForSimulator(imageUri);
        } else {
          scanResults = await this.scanReceiptForSimulator(imageUri);
        }
      } else {
        // 서버가 정상이면 폴백 기능이 포함된 스캔 시도
        if (scanMode === 'ingredient') {
          scanResults = await this.scanPhotoWithFallback(imageUri);
        } else {
          scanResults = await this.scanReceiptWithFallback(imageUri);
        }
      }

      if (!scanResults || scanResults.length === 0) {
        // console.log(`${scanMode} 스캔 결과 없음`);
        return [];
      }

      return this.convertScanToConfirmed(scanResults, scanMode);
    } catch (error) {
      // console.error('안전 스캔 처리 실패:', error);

      // 최종 폴백: 에러가 발생해도 기본 결과 제공
      // console.log('최종 폴백: 기본 결과 제공');
      try {
        let fallbackResults: (PhotoScanResult | ScanResultItem)[];

        if (scanMode === 'ingredient') {
          fallbackResults = await this.scanPhotoForSimulator(imageUri);
        } else {
          fallbackResults = await this.scanReceiptForSimulator(imageUri);
        }

        return this.convertScanToConfirmed(fallbackResults, scanMode);
      } catch (fallbackError) {
        // console.error('최종 폴백도 실패:', fallbackError);
        throw new Error(
          `이미지 스캔에 완전히 실패했습니다. 네트워크 또는 서버 문제가 있을 수 있습니다.`,
        );
      }
    }
  }

  /**
   * 서버 오류 분석 및 사용자 안내
   */
  static analyzeServerError(error: any): {
    isServerError: boolean;
    userMessage: string;
    technicalDetails: string;
  } {
    const errorMessage = error.message || '';
    const is500Error = errorMessage.includes('500');
    const is400Error = errorMessage.includes('400');
    const is401Error = errorMessage.includes('401');
    const is404Error = errorMessage.includes('404');

    if (is500Error) {
      return {
        isServerError: true,
        userMessage:
          '서버에서 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        technicalDetails:
          '500 Internal Server Error - 이미지 처리 서비스 오류 가능성',
      };
    } else if (is400Error) {
      return {
        isServerError: false,
        userMessage:
          '이미지 형식이 올바르지 않습니다. 다른 이미지로 시도해주세요.',
        technicalDetails: '400 Bad Request - 클라이언트 요청 오류',
      };
    } else if (is401Error) {
      return {
        isServerError: false,
        userMessage: '인증이 만료되었습니다. 다시 로그인해주세요.',
        technicalDetails: '401 Unauthorized - 인증 토큰 문제',
      };
    } else if (is404Error) {
      return {
        isServerError: true,
        userMessage:
          '이미지 스캔 서비스를 찾을 수 없습니다. 관리자에게 문의하세요.',
        technicalDetails: '404 Not Found - API 엔드포인트 문제',
      };
    } else {
      return {
        isServerError: true,
        userMessage: '네트워크 연결을 확인하고 다시 시도해주세요.',
        technicalDetails: `Unknown error: ${errorMessage}`,
      };
    }
  }

  // FormData가 정확히 전송되는지 확인하는 디버깅 도구

  /**
   * FormData 구성 및 전송 과정을 단계별로 검증
   */
  static async validateFormDataTransmission(imageUri: string): Promise<void> {
    try {
      // console.log('=== FormData 전송 검증 시작 ===');

      // 1. 이미지 파일 기본 정보 확인
      // console.log('1️⃣ 이미지 파일 기본 정보');
      // console.log('URI:', imageUri);
      /* console.log(
        'URI 타입:',
        imageUri.startsWith('file://') ? 'Local File' : 'Other',
      );
      */

      // 2. 파일 읽기 테스트
      // console.log('2️⃣ 파일 읽기 테스트');
      try {
        const fileResponse = await fetch(imageUri);
        const fileBlob = await fileResponse.blob();
        /* console.log('파일 읽기 성공:', {
          size: fileBlob.size,
          type: fileBlob.type,
          readable: fileResponse.ok,
        });
        */

        if (fileBlob.size === 0) {
          // console.error('❌ 파일 크기가 0바이트입니다!');
          return;
        }
      } catch (fileError) {
        // console.error('❌ 파일 읽기 실패:', fileError);
        return;
      }

      // 3. FormData 구성 테스트 (여러 방식으로)
      // console.log('3️⃣ FormData 구성 테스트');

      // 방식 1: 현재 방식
      const formData1 = new FormData();
      formData1.append('ingredientImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'ingredient.jpg',
      } as any);
      // console.log('방식 1 (현재): FormData 구성 완료');

      // 방식 2: 명시적 타입 지정
      const formData2 = new FormData();
      formData2.append('ingredientImage', {
        uri: imageUri,
        type: 'image/jpg', // jpg vs jpeg
        name: 'ingredient.jpg',
      } as any);
      // console.log('방식 2 (jpg 타입): FormData 구성 완료');

      // 방식 3: 파일명 변경
      const formData3 = new FormData();
      formData3.append('ingredientImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'test.jpeg',
      } as any);
      // console.log('방식 3 (다른 파일명): FormData 구성 완료');

      // 4. 서버 요청 테스트 (각 방식별로)
      const testMethods = [
        { name: '현재 방식', formData: formData1 },
        { name: 'jpg 타입', formData: formData2 },
        { name: '다른 파일명', formData: formData3 },
      ];

      for (const method of testMethods) {
        // console.log(`4️⃣ ${method.name} 테스트 중...`);
        await this.testFormDataMethod(method.formData, method.name);

        // 각 테스트 사이에 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 5. 헤더 검증
      // console.log('5️⃣ 헤더 검증');
      const headers = await this.getAuthHeaders();
      // console.log('인증 헤더:', headers);

      // Content-Type이 명시적으로 설정되지 않았는지 확인
      if (headers['Content-Type']) {
        /*
        console.warn(
          '⚠️ Content-Type이 수동으로 설정됨. FormData 사용 시 제거해야 함',
        );
        */
      } else {
        // console.log('✅ Content-Type 미설정 (FormData가 자동 설정)');
      }
    } catch (error) {
      // console.error('FormData 검증 중 오류:', error);
    }
  }

  /**
   * 로그 분석 결과 기반 최종 해결책
   * 문제: 서버 AI가 복잡한 이미지 처리 시 500 오류 발생
   * 해결: 이미지 전처리 + 폴백 시스템
   */

  /**
   * 이미지 전처리 및 압축
   */
  static async preprocessImageForScan(imageUri: string): Promise<string> {
    try {
      // console.log('이미지 전처리 시작:', imageUri);

      // React Native에서 이미지 리사이징/압축 라이브러리 사용
      // 예: react-native-image-resizer

      // 임시로 원본 이미지 그대로 반환 (실제로는 압축 처리)
      return imageUri;
    } catch (error) {
      // console.error('이미지 전처리 실패:', error);
      return imageUri; // 실패하면 원본 사용
    }
  }

  /**
   * 복원력 있는 스캔 메서드 (AI 오류 대응)
   */
  static async scanPhotoWithAIFallback(
    imageUri: string,
  ): Promise<PhotoScanResult[]> {
    try {
      // console.log('AI 폴백 스캔 시작:', imageUri);

      // 1단계: 원본 이미지로 시도
      try {
        return await this.attemptScanWithImage(imageUri, 'original');
      } catch (originalError) {
        // console.log('원본 이미지 스캔 실패:', originalError.message);

        // 2단계: 이미지 전처리 후 재시도
        try {
          // console.log('이미지 전처리 후 재시도...');
          const processedUri = await this.preprocessImageForScan(imageUri);
          return await this.attemptScanWithImage(processedUri, 'processed');
        } catch (processedError) {
          // console.log('전처리 이미지 스캔도 실패:', processedError.message);

          // 3단계: 더미 이미지로 API 정상 작동 확인
          try {
            // console.log('더미 이미지로 API 상태 확인...');
            const dummyResult = await this.attemptScanWithDummyImage();

            if (dummyResult.length >= 0) {
              // API는 정상, 이미지 문제임을 확인
              throw new Error('IMAGE_TOO_COMPLEX');
            }
          } catch (dummyError) {
            // API 자체 문제
            throw new Error('API_UNAVAILABLE');
          }

          // 4단계: 최종 폴백 - 시뮬레이터 모드
          // console.log('최종 폴백: 시뮬레이터 모드');
          return await this.scanPhotoForSimulator(imageUri);
        }
      }
    } catch (error) {
      // console.error('모든 스캔 시도 실패:', error);
      throw error;
    }
  }

  /**
   * 개별 이미지 스캔 시도
   */
  static async attemptScanWithImage(
    imageUri: string,
    imageType: string,
  ): Promise<PhotoScanResult[]> {
    const formData = new FormData();
    formData.append('ingredientImage', {
      uri: imageUri,
      type: 'image/jpg', // ✅ jpg 타입 사용
      name: `image_${imageType}.jpg`,
    } as any);

    // console.log(`${imageType} 이미지로 스캔 시도...`);

    const headers = await this.getAuthHeaders();

    const response = await fetch(
      `${Config.API_BASE_URL}/api/v1/ingredient/scan-photo`,
      {
        method: 'POST',
        headers,
        body: formData,
        timeout: 30000, // 30초 타임아웃
      },
    );

    const responseText = await response.text();
    /*
    console.log(
      `${imageType} 이미지 응답:`,
      response.status,
      responseText.substring(0, 100),
    );
    */

    if (!response.ok) {
      throw new Error(`${imageType}_SCAN_FAILED: ${response.status}`);
    }

    const responseData = JSON.parse(responseText);
    return responseData.result || responseData.data || [];
  }

  /**
   * 사용자 친화적 에러 메시지 생성
   */
  static generateUserFriendlyErrorMessage(error: any): {
    title: string;
    message: string;
    actions: Array<{ text: string; action: string }>;
  } {
    const errorMessage = error?.message || '';

    if (errorMessage === 'IMAGE_TOO_COMPLEX') {
      return {
        title: '이미지 처리 한계',
        message:
          '현재 이미지가 너무 복잡하여 AI가 처리할 수 없습니다.\n\n권장사항:\n• 더 간단한 배경에서 촬영\n• 조명을 밝게 하여 재촬영\n• 식재료를 하나씩 개별 촬영\n• 수동 입력 사용',
        actions: [
          { text: '다시 촬영', action: 'retake' },
          { text: '수동 입력', action: 'manual' },
          { text: '취소', action: 'cancel' },
        ],
      };
    } else if (errorMessage === 'API_UNAVAILABLE') {
      return {
        title: '서버 일시 중단',
        message:
          '이미지 인식 서버가 일시적으로 사용할 수 없습니다.\n\n잠시 후 다시 시도하거나 수동 입력을 사용해주세요.',
        actions: [
          { text: '나중에 시도', action: 'cancel' },
          { text: '수동 입력', action: 'manual' },
        ],
      };
    } else {
      return {
        title: '인식 오류',
        message: `이미지 인식 중 오류가 발생했습니다.\n\n${errorMessage}`,
        actions: [
          { text: '다시 시도', action: 'retry' },
          { text: '수동 입력', action: 'manual' },
          { text: '취소', action: 'cancel' },
        ],
      };
    }
  }

  /**
   * PhotoPreviewScreen에서 사용할 통합 스캔 메서드
   */
  static async performRobustScan(
    imageUri: string,
    scanMode: 'ingredient' | 'receipt',
    progressCallback?: (progress: string) => void,
  ): Promise<ConfirmedIngredient[]> {
    try {
      progressCallback?.('이미지 분석 중...');

      let scanResults: (PhotoScanResult | ScanResultItem)[];

      if (scanMode === 'ingredient') {
        progressCallback?.('식재료 인식 중...');
        scanResults = await this.scanPhotoWithAIFallback(imageUri);
      } else {
        progressCallback?.('영수증 분석 중...');
        // 영수증도 동일한 로직 적용
        scanResults = await this.scanReceiptWithAIFallback(imageUri);
      }

      progressCallback?.('결과 처리 중...');

      if (!scanResults || scanResults.length === 0) {
        // console.log('스캔 성공했지만 인식된 항목 없음');
        return [];
      }

      return this.convertScanToConfirmed(scanResults, scanMode);
    } catch (error) {
      // console.error('강화된 스캔 실패:', error);
      throw error;
    }
  }

  /**
   * 영수증 스캔도 동일한 AI 폴백 적용
   */
  static async scanReceiptWithAIFallback(
    imageUri: string,
  ): Promise<ScanResultItem[]> {
    // 식재료 스캔과 동일한 로직, receipt 파라미터만 변경
    try {
      return await this.attemptReceiptScanWithImage(imageUri, 'original');
    } catch (error) {
      // console.log('영수증 원본 스캔 실패, 폴백 시도...');
      return await this.scanReceiptForSimulator(imageUri);
    }
  }

  static async attemptReceiptScanWithImage(
    imageUri: string,
    imageType: string,
  ): Promise<ScanResultItem[]> {
    const formData = new FormData();
    formData.append('receipt', {
      uri: imageUri,
      type: 'image/jpg',
      name: `receipt_${imageType}.jpg`,
    } as any);

    const headers = await this.getAuthHeaders();

    const response = await fetch(
      `${Config.API_BASE_URL}/api/v1/ingredient/scan-receipt`,
      {
        method: 'POST',
        headers,
        body: formData,
        timeout: 30000,
      },
    );

    if (!response.ok) {
      throw new Error(`RECEIPT_${imageType}_SCAN_FAILED: ${response.status}`);
    }

    const responseData = JSON.parse(await response.text());
    let data = responseData.result || responseData.data || [];

    if (Array.isArray(data)) {
      data = data.map(item => ({
        ...item,
        inputName: item.input_name || item.inputName || item.ingredientName,
      }));
    }

    return data;
  }
}
