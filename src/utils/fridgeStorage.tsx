import AsyncStorage from '@react-native-async-storage/async-storage';

const FRIDGE_ITEMS_KEY = 'fridgeItems';

export type FridgeItem = {
  id: string;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  storageType: string;
  itemCategory: string;
  fridgeId: string;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
};

// get Local Fridge Items
export const getFridgeItems = async (): Promise<FridgeItem[]> => {
  try {
    const itemsJson = await AsyncStorage.getItem(FRIDGE_ITEMS_KEY);
    return itemsJson ? JSON.parse(itemsJson) : [];
  } catch (error) {
    console.error('냉장고 아이템 가져오기 실패:', error);
    return [];
  }
};

// get Local Fridge Items by Id
export const getFridgeItemsByFridgeId = async (
  fridgeId: string,
): Promise<FridgeItem[]> => {
  try {
    const allItems = await getFridgeItems();
    return allItems.filter(item => item.fridgeId === fridgeId);
  } catch (error) {
    console.error('특정 냉장고 아이템 가져오기 실패:', error);
    return [];
  }
};

// Add Items to Fridge
export const addItemsToFridge = async (
  fridgeId: string,
  newItems: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>[],
): Promise<FridgeItem[]> => {
  try {
    const existingItems = await getFridgeItems();
    const currentTime = new Date().toISOString();

    // creage New ID
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
    await AsyncStorage.setItem(FRIDGE_ITEMS_KEY, JSON.stringify(updatedItems));

    return itemsToAdd;
  } catch (error) {
    console.error('아이템 추가 실패:', error);
    throw error;
  }
};

// delete Item
export const deleteItemFromFridge = async (itemId: number): Promise<void> => {
  try {
    const existingItems = await getFridgeItems();
    const updatedItems = existingItems.filter(
      item => parseInt(item.id, 10) !== itemId,
    );
    await AsyncStorage.setItem(FRIDGE_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('아이템 삭제 실패:', error);
    throw error;
  }
};

// update Item
export const updateFridgeItem = async (
  itemId: number,
  updates: Partial<Omit<FridgeItem, 'id' | 'createdAt'>>,
): Promise<void> => {
  try {
    const existingItems = await getFridgeItems();
    const updatedItems = existingItems.map(item =>
      parseInt(item.id, 10) === itemId
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item,
    );
    await AsyncStorage.setItem(FRIDGE_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('아이템 업데이트 실패:', error);
    throw error;
  }
};

// calc Default Expity Date
export const getDefaultExpiryDate = (category: string = '기타'): string => {
  const today = new Date();
  let daysToAdd = 7; // 기본값 7일

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
    case '기타':
    default:
      daysToAdd = 7;
      break;
  }

  const expiryDate = new Date(today);
  expiryDate.setDate(today.getDate() + daysToAdd);
  return expiryDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};
