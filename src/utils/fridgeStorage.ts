import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  IngredientControllerAPI,
  type RefrigeratorIngredientResponse,
  type AutoCompleteSearchResponse,
} from '../services/API/ingredientControllerAPI';

// 기존 FridgeItem 타입 유지 (하위 호환성)
export type FridgeItem = {
  id: string;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  itemCategory: string;
  fridgeId: string;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
};

// AsyncStorage 키
const FRIDGE_ITEMS_KEY = 'fridgeItems';

// 카테고리 매핑 (하드코딩)
const CATEGORY_MAP: { [key: string]: number } = {
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

const CATEGORY_ID_TO_NAME: { [key: number]: string } = {
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

// API 호출 가능 여부 확인
const isApiAvailable = (): boolean => {
  try {
    return (
      IngredientControllerAPI &&
      typeof IngredientControllerAPI.getRefrigeratorIngredients === 'function'
    );
  } catch (error) {
    console.warn('IngredientControllerAPI를 사용할 수 없습니다:', error);
    return false;
  }
};

// API 응답을 앱에서 사용하는 형태로 변환
const mapApiItemToFridgeItem = (
  apiItem: RefrigeratorIngredientResponse,
): FridgeItem => ({
  id: apiItem.id,
  name: apiItem.ingredientName,
  quantity: apiItem.quantity?.toString() || '0',
  expiryDate: apiItem.expirationDate,
  itemCategory: CATEGORY_ID_TO_NAME[apiItem.categoryId] || '기타',
  fridgeId: apiItem.id, // refrigeratorIngredientId를 fridgeId로 사용
  unit: apiItem.unit || 'g',
  createdAt: apiItem.createdAt,
  updatedAt: apiItem.updatedAt,
});

// AsyncStorage에서 데이터 가져오기 (fallback용)
const getFridgeItemsFromStorage = async (): Promise<FridgeItem[]> => {
  try {
    const itemsJson = await AsyncStorage.getItem(FRIDGE_ITEMS_KEY);
    return itemsJson ? JSON.parse(itemsJson) : [];
  } catch (error) {
    console.error('AsyncStorage에서 냉장고 아이템 가져오기 실패:', error);
    return [];
  }
};

// AsyncStorage에서 특정 냉장고 아이템 가져오기 (fallback용)
const getFridgeItemsByFridgeIdFromStorage = async (
  fridgeId: string,
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
 * 냉장고 아이템 조회 (IngredientControllerAPI 우선, AsyncStorage fallback)
 */
export const getFridgeItemsByFridgeId = async (
  fridgeId: string,
  categoryIds: number[] = [],
  page: number = 0,
  size: number = 100,
): Promise<FridgeItem[]> => {
  if (isApiAvailable()) {
    try {
      console.log(
        `IngredientControllerAPI를 통해 냉장고 ${fridgeId} 아이템 조회 중...`,
      );

      const response = await IngredientControllerAPI.getRefrigeratorIngredients(
        fridgeId,
        {
          categoryIds,
          page,
          size,
          sort: 'expirationDate',
        },
      );

      console.log('API 응답:', response);

      if (response.content && Array.isArray(response.content)) {
        const mappedItems = response.content.map(mapApiItemToFridgeItem);
        console.log('변환된 아이템들:', mappedItems);
        return mappedItems;
      } else {
        console.warn('빈 배열 응답:', response);
        return [];
      }
    } catch (error) {
      console.error(
        'IngredientControllerAPI 조회 실패, AsyncStorage fallback 시도:',
        error,
      );
      return await getFridgeItemsByFridgeIdFromStorage(fridgeId);
    }
  } else {
    console.log('IngredientControllerAPI 사용 불가, AsyncStorage 사용');
    return await getFridgeItemsByFridgeIdFromStorage(fridgeId);
  }
};

/**
 * 아이템 업데이트 (IngredientControllerAPI 우선, AsyncStorage fallback)
 */
export const updateFridgeItem = async (
  itemId: string,
  updates: Partial<Omit<FridgeItem, 'id' | 'createdAt'>>,
): Promise<void> => {
  if (isApiAvailable()) {
    try {
      const apiUpdates: any = {};

      if (updates.quantity !== undefined) {
        apiUpdates.quantity = parseInt(updates.quantity, 10);
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
      console.log(
        `IngredientControllerAPI를 통해 아이템 ${itemId} 업데이트 완료`,
      );
    } catch (error) {
      console.error('IngredientControllerAPI 업데이트 실패:', error);
      throw error;
    }
  } else {
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
    } catch (error) {
      console.error('AsyncStorage 업데이트 실패:', error);
      throw error;
    }
  }
};

/**
 * 아이템 삭제 (IngredientControllerAPI 우선, AsyncStorage fallback)
 */
export const deleteItemFromFridge = async (itemId: string): Promise<void> => {
  if (isApiAvailable()) {
    try {
      await IngredientControllerAPI.deleteRefrigeratorIngredient(itemId);
      console.log(`IngredientControllerAPI를 통해 아이템 ${itemId} 삭제 완료`);
    } catch (error) {
      console.error('IngredientControllerAPI 삭제 실패:', error);
      throw error;
    }
  } else {
    // AsyncStorage fallback
    try {
      const existingItems = await getFridgeItemsFromStorage();
      const updatedItems = existingItems.filter(item => item.id !== itemId);
      await AsyncStorage.setItem(
        FRIDGE_ITEMS_KEY,
        JSON.stringify(updatedItems),
      );
      console.log(`AsyncStorage를 통해 아이템 ${itemId} 삭제 완료`);
    } catch (error) {
      console.error('AsyncStorage 삭제 실패:', error);
      throw error;
    }
  }
};

/**
 * 식재료 자동완성 검색
 */
export const searchIngredients = async (
  keyword: string,
): Promise<AutoCompleteSearchResponse[]> => {
  if (isApiAvailable()) {
    return await IngredientControllerAPI.searchIngredients(keyword);
  } else {
    console.warn('IngredientControllerAPI 사용 불가, 빈 배열 반환');
    return [];
  }
};

/**
 * 식재료 이름으로 검색
 */
export const findIngredientByName = async (
  ingredientName: string,
): Promise<AutoCompleteSearchResponse | null> => {
  if (isApiAvailable()) {
    return await IngredientControllerAPI.findIngredientByName(ingredientName);
  } else {
    console.warn('IngredientControllerAPI 사용 불가, null 반환');
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
  if (!isApiAvailable()) {
    return ingredientNames.map(name => ({
      name,
      result: null,
      error: 'IngredientControllerAPI 사용 불가',
    }));
  }

  return await IngredientControllerAPI.findMultipleIngredients(ingredientNames);
};

/**
 * 냉장고에 확인된 식재료 추가 (AddItemScreen에서 사용)
 */
export const addConfirmedIngredientsToFridge = async (
  fridgeId: string,
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
): Promise<any> => {
  if (isApiAvailable()) {
    try {
      console.log('확인된 식재료 추가 시작:', confirmedIngredients);

      const response = await IngredientControllerAPI.addConfirmedIngredients(
        fridgeId,
        confirmedIngredients,
      );
      console.log('식재료 추가 응답:', response);

      return response;
    } catch (error) {
      console.error('IngredientControllerAPI를 통한 식재료 추가 실패:', error);
      throw new Error(`식재료 추가에 실패했습니다: ${error.message}`);
    }
  } else {
    // AsyncStorage fallback
    try {
      const existingItems = await getFridgeItemsFromStorage();
      const currentTime = new Date().toISOString();
      const maxId =
        existingItems.length > 0
          ? Math.max(...existingItems.map(item => parseInt(item.id, 10)))
          : 0;

      const newItems: FridgeItem[] = confirmedIngredients.map(
        (confirmed, index) => ({
          id: (maxId + index + 1).toString(),
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
    } catch (error) {
      console.error('AsyncStorage 추가 실패:', error);
      throw error;
    }
  }
};

// ========== 기존 함수들 (하위 호환성을 위해 유지) ==========

/**
 * 단일 아이템 추가 (기존 함수 - 호환성 유지)
 */
export const addItemToFridge = async (
  fridgeId: string,
  item: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>,
  categoryId: number = 0,
): Promise<FridgeItem> => {
  if (isApiAvailable()) {
    try {
      const result = await IngredientControllerAPI.addSingleIngredient(
        fridgeId,
        item.name,
        item.expiryDate,
      );

      // 결과를 FridgeItem 형태로 변환
      const mappedResult: FridgeItem = {
        id: `new_${Date.now()}`,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || 'g',
        expiryDate: item.expiryDate,
        itemCategory: item.itemCategory,
        fridgeId,
        createdAt: new Date().toISOString(),
      };

      console.log(
        'IngredientControllerAPI를 통해 아이템 추가 완료:',
        mappedResult,
      );
      return mappedResult;
    } catch (error) {
      console.error('IngredientControllerAPI 추가 실패:', error);
      throw error;
    }
  } else {
    // AsyncStorage fallback
    try {
      const existingItems = await getFridgeItemsFromStorage();
      const currentTime = new Date().toISOString();
      const maxId =
        existingItems.length > 0
          ? Math.max(...existingItems.map(item => parseInt(item.id, 10)))
          : 0;

      const newItem: FridgeItem = {
        ...item,
        id: (maxId + 1).toString(),
        fridgeId,
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      const updatedItems = [...existingItems, newItem];
      await AsyncStorage.setItem(
        FRIDGE_ITEMS_KEY,
        JSON.stringify(updatedItems),
      );

      console.log('AsyncStorage를 통해 아이템 추가 완료:', newItem);
      return newItem;
    } catch (error) {
      console.error('AsyncStorage 추가 실패:', error);
      throw error;
    }
  }
};

/**
 * 여러 아이템 추가 (기존 함수 - deprecated)
 */
export const addItemsToFridge = async (
  fridgeId: string,
  newItems: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>[],
  categoryMapping: { [categoryName: string]: number } = {},
): Promise<FridgeItem[]> => {
  console.warn(
    'addItemsToFridge는 deprecated입니다. addConfirmedIngredientsToFridge를 사용하세요.',
  );

  const results = [];
  for (const item of newItems) {
    try {
      const categoryId = categoryMapping[item.itemCategory] || 0;
      const result = await addItemToFridge(fridgeId, item, categoryId);
      results.push(result);
    } catch (error) {
      console.error(`아이템 "${item.name}" 추가 실패:`, error);
    }
  }

  return results;
};

/**
 * 기존 전체 조회 함수 (deprecated)
 */
export const getFridgeItems = async (): Promise<FridgeItem[]> => {
  console.warn(
    'getFridgeItems는 deprecated입니다. getFridgeItemsByFridgeId를 사용하세요.',
  );
  return await getFridgeItemsFromStorage();
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
