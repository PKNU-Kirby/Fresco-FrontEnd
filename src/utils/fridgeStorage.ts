import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  IngredientControllerAPI,
  type RefrigeratorIngredientResponse,
  type AutoCompleteSearchResponse,
  type ConfirmedIngredient,
  type SaveIngredientsRequest,
} from '../services/API/ingredientControllerAPI';

// 기존 FridgeItem 타입 유지 (하위 호환성)
export type FridgeItem = {
  id: number;
  name: string;
  quantity: number;
  expiryDate: string;
  imageUri?: string;
  itemCategory: string;
  fridgeId: number;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
};

// AsyncStorage 키
const FRIDGE_ITEMS_KEY = 'fridgeItems';

// 카테고리 매핑
const CATEGORY_ID_TO_NAME: { [key: number]: string } = {
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

// API 응답을 FridgeItem으로 변환
const mapApiItemToFridgeItem = (
  apiItem: RefrigeratorIngredientResponse,
  actualFridgeId: number,
): FridgeItem => ({
  id: apiItem.id,
  name: apiItem.ingredientName,
  quantity: apiItem.quantity || 0,
  expiryDate: apiItem.expirationDate,
  itemCategory: CATEGORY_ID_TO_NAME[apiItem.categoryId] || '기타',
  fridgeId: actualFridgeId,
  unit: apiItem.unit || 'g',
  createdAt: apiItem.createdAt,
  updatedAt: apiItem.updatedAt,
});

// AsyncStorage fallback 함수들
const getFridgeItemsFromStorage = async (): Promise<FridgeItem[]> => {
  try {
    const itemsJson = await AsyncStorage.getItem(FRIDGE_ITEMS_KEY);
    return itemsJson ? JSON.parse(itemsJson) : [];
  } catch (error) {
    console.error('AsyncStorage에서 냉장고 아이템 가져오기 실패:', error);
    return [];
  }
};

const getFridgeItemsByFridgeIdFromStorage = async (
  fridgeId: number,
): Promise<FridgeItem[]> => {
  try {
    const allItems = await getFridgeItemsFromStorage();
    return allItems.filter(item => {
      const itemFridgeId = item.fridgeId;
      const targetFridgeId = fridgeId;
      const stringMatch = itemFridgeId.toString() === targetFridgeId.toString();
      const numberMatch = Number(itemFridgeId) === Number(targetFridgeId);
      return stringMatch || numberMatch;
    });
  } catch (error) {
    console.error('AsyncStorage에서 특정 냉장고 아이템 가져오기 실패:', error);
    return [];
  }
};

/**
 * 냉장고 아이템 조회 (API 우선, AsyncStorage fallback)
 */
export const getFridgeItemsByFridgeId = async (
  fridgeId: number,
  categoryIds: number[] = [], // 기본값 유지
  page: number = 0,
  size: number = 100,
): Promise<FridgeItem[]> => {
  console.log(`API를 통해 냉장고 ${fridgeId} 아이템 조회 중...`);

  // ✅ categoryIds가 비어있으면 모든 카테고리 포함
  const finalCategoryIds =
    categoryIds.length === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : categoryIds;

  const response = await IngredientControllerAPI.getRefrigeratorIngredients(
    fridgeId,
    {
      categoryIds: finalCategoryIds,
      page,
      size,
      sort: 'expirationDate',
    },
  );

  if (response.content && Array.isArray(response.content)) {
    const mappedItems = response.content.map(item =>
      mapApiItemToFridgeItem(item, fridgeId),
    );
    console.log('변환된 아이템들:', mappedItems);
    return mappedItems;
  }

  return [];
};

/**
 * 아이템 업데이트 (API 우선, AsyncStorage fallback)
 */
export const updateFridgeItem = async (
  itemId: number,
  updates: Partial<Omit<FridgeItem, 'id' | 'createdAt'>>,
): Promise<void> => {
  try {
    const apiUpdates: any = {};

    if (updates.quantity !== undefined) {
      apiUpdates.quantity = updates.quantity;
    }
    if (updates.unit !== undefined) {
      apiUpdates.unit = updates.unit;
    }
    if (updates.expiryDate !== undefined) {
      apiUpdates.expirationDate = updates.expiryDate;
    }

    await IngredientControllerAPI.updateRefrigeratorIngredient(
      itemId,
      apiUpdates,
    );
    console.log(`API를 통해 아이템 ${itemId} 업데이트 완료`);
  } catch (error) {
    console.error('API 업데이트 실패, AsyncStorage fallback:', error);

    // AsyncStorage fallback
    try {
      const existingItems = await getFridgeItemsFromStorage();
      const updatedItems = existingItems.map(item =>
        item.id === itemId
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item,
      );
      await AsyncStorage.setItem(
        FRIDGE_ITEMS_KEY,
        JSON.stringify(updatedItems),
      );
      console.log(`AsyncStorage를 통해 아이템 ${itemId} 업데이트 완료`);
    } catch (storageError) {
      console.error('AsyncStorage 업데이트도 실패:', storageError);
      throw error; // 원래 API 에러를 던짐
    }
  }
};

/**
 * 여러 아이템 배치 삭제 (API 우선, AsyncStorage fallback)
 */
/**
 * 여러 아이템 배치 삭제 (API 우선, AsyncStorage fallback)
 */
export const batchDeleteItems = async (itemIds: number[]): Promise<void> => {
  try {
    await IngredientControllerAPI.batchDeleteIngredients(itemIds);
    console.log(`API를 통해 ${itemIds.length}개 아이템 배치 삭제 완료`);

    // API 삭제 성공 시 AsyncStorage도 정리
    try {
      const existingItems = await getFridgeItemsFromStorage();
      const updatedItems = existingItems.filter(
        item => !itemIds.includes(item.id),
      );
      await AsyncStorage.setItem(
        FRIDGE_ITEMS_KEY,
        JSON.stringify(updatedItems),
      );
      console.log('AsyncStorage 동기화 완료');
    } catch (syncError) {
      console.warn('AsyncStorage 동기화 실패 (무시):', syncError);
    }
  } catch (error) {
    console.error('API 배치 삭제 실패:', error);

    // 권한 오류(NP)는 서버에 이미 없는 것이므로 AsyncStorage만 정리
    if (
      error.message?.includes('권한') ||
      error.message?.includes('Permission')
    ) {
      console.log('⚠️ 권한 오류 - 서버에 아이템 없음, AsyncStorage만 정리');
      try {
        const existingItems = await getFridgeItemsFromStorage();
        const updatedItems = existingItems.filter(
          item => !itemIds.includes(item.id),
        );
        await AsyncStorage.setItem(
          FRIDGE_ITEMS_KEY,
          JSON.stringify(updatedItems),
        );
        console.log(`AsyncStorage에서 ${itemIds.length}개 아이템 정리 완료`);
        return; // 성공으로 처리
      } catch (storageError) {
        console.error('AsyncStorage 정리 실패:', storageError);
        throw storageError;
      }
    }

    // 다른 에러는 fallback 처리
    try {
      const existingItems = await getFridgeItemsFromStorage();
      const updatedItems = existingItems.filter(
        item => !itemIds.includes(item.id),
      );
      await AsyncStorage.setItem(
        FRIDGE_ITEMS_KEY,
        JSON.stringify(updatedItems),
      );
      console.log(
        `AsyncStorage를 통해 ${itemIds.length}개 아이템 배치 삭제 완료`,
      );
    } catch (storageError) {
      console.error('AsyncStorage 배치 삭제도 실패:', storageError);
      throw error;
    }
  }
};

/**
 * 기존 deleteItemFromFridge를 배치 삭제로 래핑
 */
export const deleteItemFromFridge = async (itemId: number): Promise<void> => {
  return await batchDeleteItems([itemId]);
};

/**
 * 식재료 자동완성 검색
 */
export const searchIngredients = async (
  keyword: string,
): Promise<AutoCompleteSearchResponse[]> => {
  try {
    return await IngredientControllerAPI.searchIngredients(keyword);
  } catch (error) {
    console.error('식재료 검색 실패:', error);
    return [];
  }
};

/**
 * 식재료 이름으로 검색
 */
export const findIngredientByName = async (
  ingredientName: string,
): Promise<AutoCompleteSearchResponse | null> => {
  try {
    return await IngredientControllerAPI.findIngredientByName(ingredientName);
  } catch (error) {
    console.error('식재료 이름 검색 실패:', error);
    return null;
  }
};

/**
 * 여러 식재료 이름을 한번에 확인
 */
export const confirmMultipleIngredients = async (
  ingredientNames: string[],
): Promise<
  { name: string; result: AutoCompleteSearchResponse | null; error?: string }[]
> => {
  try {
    return await IngredientControllerAPI.findMultipleIngredients(
      ingredientNames,
    );
  } catch (error) {
    console.error('다중 식재료 검색 실패:', error);
    return ingredientNames.map(name => ({
      name,
      result: null,
      error: '검색 실패',
    }));
  }
};

/**
 * 냉장고에 확인된 식재료 추가 (AddItemScreen에서 사용)
 * ⚠️ 수정: 올바른 API 함수 호출
 */
export const addConfirmedIngredientsToFridge = async (
  fridgeId: number,
  confirmedIngredients: Array<{
    userInput: {
      id: number;
      name: string;
      quantity: number;
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
): Promise<any> => {
  try {
    console.log('확인된 식재료 추가 시작:', confirmedIngredients);

    // ConfirmedIngredient 형태로 변환
    const formattedIngredients: ConfirmedIngredient[] =
      confirmedIngredients.map(item => ({
        userInput: item.userInput,
        apiResult: item.apiResult,
      }));

    // ⚠️ 수정: 올바른 API 함수 호출
    const response = await IngredientControllerAPI.addConfirmedIngredients(
      fridgeId,
      formattedIngredients,
    );

    console.log('식재료 추가 API 응답:', response);
    return response;
  } catch (error) {
    console.error('API를 통한 식재료 추가 실패, AsyncStorage fallback:', error);

    // AsyncStorage fallback
    try {
      const existingItems = await getFridgeItemsFromStorage();
      const currentTime = new Date().toISOString();
      const maxId =
        existingItems.length > 0
          ? Math.max(...existingItems.map(item => item.id))
          : 0;

      const newItems: FridgeItem[] = confirmedIngredients.map(
        (confirmed, index) => ({
          id: maxId + index + 1,
          name: confirmed.apiResult.ingredientName,
          quantity: confirmed.userInput.quantity,
          unit: confirmed.userInput.unit,
          expiryDate: confirmed.userInput.expirationDate,
          itemCategory: confirmed.apiResult.categoryName,
          fridgeId,
          createdAt: currentTime,
          updatedAt: currentTime,
        }),
      );

      const updatedItems = [...existingItems, ...newItems];
      await AsyncStorage.setItem(
        FRIDGE_ITEMS_KEY,
        JSON.stringify(updatedItems),
      );

      console.log(`AsyncStorage를 통해 ${newItems.length}개 아이템 추가 완료`);
      return newItems;
    } catch (storageError) {
      console.error('AsyncStorage 추가도 실패:', storageError);
      throw error; // 원래 API 에러를 던짐
    }
  }
};

// ========== 기존 함수들 (하위 호환성을 위해 유지) ==========

/**
 * 단일 아이템 추가 (기존 함수 - 호환성 유지)
 */
export const addItemToFridge = async (
  fridgeId: number,
  item: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>,
  categoryId: number = 0,
): Promise<FridgeItem> => {
  try {
    const result = await IngredientControllerAPI.addSingleIngredient(
      fridgeId,
      item.name,
      item.expiryDate,
    );

    const mappedResult: FridgeItem = {
      id: Date.now(),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || 'g',
      expiryDate: item.expiryDate,
      itemCategory: item.itemCategory,
      fridgeId,
      createdAt: new Date().toISOString(),
    };

    console.log('API를 통해 아이템 추가 완료:', mappedResult);
    return mappedResult;
  } catch (error) {
    console.error('API 추가 실패, AsyncStorage fallback:', error);

    // AsyncStorage fallback
    const existingItems = await getFridgeItemsFromStorage();
    const currentTime = new Date().toISOString();
    const maxId =
      existingItems.length > 0
        ? Math.max(...existingItems.map(item => item.id))
        : 0;

    const newItem: FridgeItem = {
      ...item,
      id: maxId + 1,
      fridgeId,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    const updatedItems = [...existingItems, newItem];
    await AsyncStorage.setItem(FRIDGE_ITEMS_KEY, JSON.stringify(updatedItems));

    console.log('AsyncStorage를 통해 아이템 추가 완료:', newItem);
    return newItem;
  }
};

/**
 * 기본 만료일 계산
 */
export const getDefaultExpiryDate = (category: string = '기타'): string => {
  const today = new Date();
  let daysToAdd = 7;

  switch (category) {
    case '베이커리':
      daysToAdd = 3;
      break;
    case '채소 / 과일':
      daysToAdd = 7;
      break;
    case '정육 / 계란':
      daysToAdd = 3;
      break;
    case '가공식품':
      daysToAdd = 14;
      break;
    case '수산 / 건어물':
      daysToAdd = 2;
      break;
    case '쌀 / 잡곡':
      daysToAdd = 30;
      break;
    case '우유 / 유제품':
      daysToAdd = 5;
      break;
    case '건강식품':
      daysToAdd = 30;
      break;
    case '장 / 양념 / 소스':
      daysToAdd = 60;
      break;
    default:
      daysToAdd = 7;
      break;
  }

  const expiryDate = new Date(today);
  expiryDate.setDate(today.getDate() + daysToAdd);
  return expiryDate.toISOString().split('T')[0];
};
