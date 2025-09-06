import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/apiServices';

// 타입 정의
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

// API 응답 타입 (ApiService에서 import 가능하다면 그쪽에서 가져오기)
type ApiFridgeItem = {
  id: string;
  ingredientId: string;
  categoryId: string;
  ingredientName: string;
  expirationDate: string;
  quantity: number;
  unit: string;
  fridgeId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ApiItemResponse<T> = {
  content: T[];
  pageInfo: {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
};

// AsyncStorage 키
const FRIDGE_ITEMS_KEY = 'fridgeItems';

// API 호출 가능 여부 확인
const isApiAvailable = (): boolean => {
  try {
    return ApiService && typeof ApiService.getFridgeItems === 'function';
  } catch (error) {
    console.warn('ApiService를 사용할 수 없습니다:', error);
    return false;
  }
};

// API 응답을 앱에서 사용하는 형태로 변환
const mapApiItemToFridgeItem = (apiItem: ApiFridgeItem): FridgeItem => ({
  id: apiItem.id,
  name: apiItem.ingredientName,
  quantity: apiItem.quantity.toString(),
  expiryDate: apiItem.expirationDate,
  itemCategory: apiItem.categoryId.toString(),
  fridgeId: apiItem.fridgeId || apiItem.id,
  unit: apiItem.unit,
  createdAt: apiItem.createdAt,
  updatedAt: apiItem.updatedAt,
});

// 앱의 아이템을 API 형태로 변환
const mapFridgeItemToApiItem = (item: FridgeItem, categoryId: number) => ({
  ingredientName: item.name,
  categoryId: categoryId,
  quantity: parseInt(item.quantity, 10) || 0,
  unit: item.unit || '개',
  expirationDate: item.expiryDate,
});

// AsyncStorage에서 데이터 가져오기 (fallback)
const getFridgeItemsFromStorage = async (): Promise<FridgeItem[]> => {
  try {
    const itemsJson = await AsyncStorage.getItem(FRIDGE_ITEMS_KEY);
    return itemsJson ? JSON.parse(itemsJson) : [];
  } catch (error) {
    console.error('AsyncStorage에서 냉장고 아이템 가져오기 실패:', error);
    return [];
  }
};

// AsyncStorage에서 특정 냉장고 아이템 가져오기 (fallback)
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

// 냉장고 아이템 조회 (API 우선, AsyncStorage fallback)
export const getFridgeItemsByFridgeId = async (
  fridgeId: string,
  categoryIds: number[] = [],
): Promise<FridgeItem[]> => {
  console.log(`냉장고 ${fridgeId} 아이템 조회 시작...`);

  // API 사용 가능한지 확인
  if (isApiAvailable()) {
    try {
      console.log('API를 통한 냉장고 아이템 조회 시도...');
      const response = await ApiService.getFridgeItems(fridgeId, {
        categoryIds,
        page: 0,
        size: 100,
      });

      const mappedItems = response.content.map(mapApiItemToFridgeItem);
      console.log(`API를 통해 ${mappedItems.length}개 아이템 조회 완료`);
      return mappedItems;
    } catch (error) {
      console.error('API 조회 실패, AsyncStorage 사용:', error);
      return await getFridgeItemsByFridgeIdFromStorage(fridgeId);
    }
  } else {
    console.log('API를 사용할 수 없어 AsyncStorage 사용');
    return await getFridgeItemsByFridgeIdFromStorage(fridgeId);
  }
};

// 아이템 업데이트 (API 우선, AsyncStorage fallback)
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

      await ApiService.updateFridgeItem(itemId, apiUpdates);
      console.log(`API를 통해 아이템 ${itemId} 업데이트 완료`);
    } catch (error) {
      console.error('API 업데이트 실패:', error);
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

// 아이템 삭제 (API 우선, AsyncStorage fallback)
export const deleteItemFromFridge = async (itemId: string): Promise<void> => {
  if (isApiAvailable()) {
    try {
      await ApiService.deleteFridgeItem(itemId);
      console.log(`API를 통해 아이템 ${itemId} 삭제 완료`);
    } catch (error) {
      console.error('API 삭제 실패:', error);
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

// 단일 아이템 추가 (API 우선, AsyncStorage fallback)
export const addItemToFridge = async (
  fridgeId: string,
  item: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>,
  categoryId: number = 0,
): Promise<FridgeItem> => {
  if (isApiAvailable()) {
    try {
      const apiItem = mapFridgeItemToApiItem(item as FridgeItem, categoryId);
      const result = await ApiService.addFridgeItem(fridgeId, apiItem);
      const mappedResult = mapApiItemToFridgeItem(result);
      console.log(`API를 통해 아이템 추가 완료:`, mappedResult);
      return mappedResult;
    } catch (error) {
      console.error('API 추가 실패:', error);
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
      console.log(`AsyncStorage를 통해 아이템 추가 완료:`, newItem);
      return newItem;
    } catch (error) {
      console.error('AsyncStorage 추가 실패:', error);
      throw error;
    }
  }
};

// 여러 아이템 추가 (API 우선, AsyncStorage fallback)
export const addItemsToFridge = async (
  fridgeId: string,
  newItems: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>[],
  categoryMapping: { [categoryName: string]: number } = {},
): Promise<FridgeItem[]> => {
  if (isApiAvailable()) {
    try {
      const apiItems = newItems.map(item => {
        const categoryId = categoryMapping[item.itemCategory] || 0;
        return mapFridgeItemToApiItem(item as FridgeItem, categoryId);
      });

      const results = await ApiService.addMultipleFridgeItems(
        fridgeId,
        apiItems,
      );
      const mappedResults = results.map(mapApiItemToFridgeItem);
      console.log(`API를 통해 ${mappedResults.length}개 아이템 일괄 추가 완료`);
      return mappedResults;
    } catch (error) {
      console.error('API 일괄 추가 실패:', error);
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

      const itemsToAdd: FridgeItem[] = newItems.map((item, index) => ({
        ...item,
        id: (maxId + index + 1).toString(),
        fridgeId,
        createdAt: currentTime,
        updatedAt: currentTime,
      }));

      const updatedItems = [...existingItems, ...itemsToAdd];
      await AsyncStorage.setItem(
        FRIDGE_ITEMS_KEY,
        JSON.stringify(updatedItems),
      );
      console.log(
        `AsyncStorage를 통해 ${itemsToAdd.length}개 아이템 일괄 추가 완료`,
      );
      return itemsToAdd;
    } catch (error) {
      console.error('AsyncStorage 일괄 추가 실패:', error);
      throw error;
    }
  }
};

// 기존 함수들 (하위 호환성을 위해 유지)
export const getFridgeItems = async (): Promise<FridgeItem[]> => {
  console.warn(
    'getFridgeItems는 deprecated입니다. getFridgeItemsByFridgeId를 사용하세요.',
  );
  return await getFridgeItemsFromStorage();
};

// 기본 만료일 계산 (기존 로직 유지)
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
