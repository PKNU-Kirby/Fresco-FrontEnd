import {useState, useEffect} from 'react';

export type FridgeItem = {
  id: number;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  storageType: string;
  itemCategory: string;
  fridgeId: number;
  unit?: string;
};

export const useFridgeData = (fridgeId: number) => {
  // 보관 분류 목록
  const [storageTypes, setStorageTypes] = useState<string[]>([
    '전체',
    '냉장실',
    '냉동실',
    '실온',
    '과자박스',
    '아이스크림박스',
    '기타',
  ]);

  // 식재료 카테고리 목록
  const [itemCategories, setItemCategories] = useState([
    '전체',
    '베이커리',
    '채소 / 과일',
    '정육 / 계란',
    '가공식품',
    '수산 / 건어물',
    '쌀 / 잡곡',
    '우유 / 유제품',
    '건강식품',
    '장 / 양념 / 소스',
    '기타',
  ]);

  // 냉장고 아이템들을 상태로 관리
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);

  // Mock data
  const getMockDataByFridgeId = (fridgeId: number): FridgeItem[] => {
    const dataMap: {[key: number]: FridgeItem[]} = {
      1: [
        // 본가
        {
          id: 1,
          name: '식빵',
          quantity: '1',
          expiryDate: '2025.07.15',
          storageType: '실온',
          itemCategory: '베이커리',
          fridgeId: 1,
        },
        {
          id: 2,
          name: '양배추',
          quantity: '1',
          expiryDate: '2025.07.20',
          storageType: '냉장실',
          itemCategory: '채소 / 과일',
          fridgeId: 1,
        },
        {
          id: 3,
          name: '닭가슴살 500g',
          quantity: '1',
          expiryDate: '2025.07.18',
          storageType: '냉장실',
          itemCategory: '정육 / 계란',
          fridgeId: 1,
        },
        {
          id: 4,
          name: '우유 1000ml',
          quantity: '1',
          expiryDate: '2025.07.25',
          storageType: '냉장실',
          itemCategory: '우유 / 유제품',
          fridgeId: 1,
        },
        {
          id: 5,
          name: '냉동만두',
          quantity: '1',
          expiryDate: '2025.12.31',
          storageType: '냉동실',
          itemCategory: '가공식품',
          fridgeId: 1,
        },
        {
          id: 6,
          name: '고추장',
          quantity: '1',
          expiryDate: '2026.03.20',
          storageType: '실온',
          itemCategory: '장 / 양념 / 소스',
          fridgeId: 1,
        },
        {
          id: 7,
          name: '초코과자',
          quantity: '3',
          expiryDate: '2025.09.30',
          storageType: '과자박스',
          itemCategory: '기타',
          fridgeId: 1,
        },
      ],
      2: [
        // 자취방
        {
          id: 8,
          name: '계란',
          quantity: '10',
          expiryDate: '2025.08.15',
          storageType: '냉장실',
          itemCategory: '정육 / 계란',
          fridgeId: 2,
        },
        {
          id: 9,
          name: '김치',
          quantity: '1통',
          expiryDate: '2025.12.31',
          storageType: '냉장실',
          itemCategory: '채소 / 과일',
          fridgeId: 2,
        },
        {
          id: 10,
          name: '바나나',
          quantity: '5',
          expiryDate: '2025.07.20',
          storageType: '실온',
          itemCategory: '채소 / 과일',
          fridgeId: 2,
        },
        {
          id: 11,
          name: '참치캔',
          quantity: '3',
          expiryDate: '2026.01.30',
          storageType: '실온',
          itemCategory: '수산 / 건어물',
          fridgeId: 2,
        },
        {
          id: 12,
          name: '아이스크림',
          quantity: '2',
          expiryDate: '2025.12.31',
          storageType: '아이스크림박스',
          itemCategory: '우유 / 유제품',
          fridgeId: 2,
        },
        {
          id: 13,
          name: '현미 5kg',
          quantity: '1',
          expiryDate: '2025.12.31',
          storageType: '실온',
          itemCategory: '쌀 / 잡곡',
          fridgeId: 2,
        },
      ],
      3: [
        // 냉동고
        {
          id: 14,
          name: '냉동새우 300g',
          quantity: '1',
          expiryDate: '2025.11.20',
          storageType: '냉동실',
          itemCategory: '수산 / 건어물',
          fridgeId: 3,
        },
        {
          id: 15,
          name: '냉동삼겹살 1kg',
          quantity: '1',
          expiryDate: '2025.10.15',
          storageType: '냉동실',
          itemCategory: '정육 / 계란',
          fridgeId: 3,
        },
        {
          id: 16,
          name: '냉동블루베리 500g',
          quantity: '1',
          expiryDate: '2025.12.31',
          storageType: '냉동실',
          itemCategory: '채소 / 과일',
          fridgeId: 3,
        },
      ],
      4: [
        // 숨김냉장고
        {
          id: 17,
          name: '오래된치즈',
          quantity: '1',
          expiryDate: '2025.06.01',
          storageType: '냉장실',
          itemCategory: '우유 / 유제품',
          fridgeId: 4,
        },
        {
          id: 18,
          name: '홍삼 1박스',
          quantity: '1',
          expiryDate: '2026.05.20',
          storageType: '실온',
          itemCategory: '건강식품',
          fridgeId: 4,
        },
      ],
    };

    return dataMap[fridgeId] || [];
  };

  // fridgeId가 변경될 때 해당 냉장고 데이터 로드
  useEffect(() => {
    const mockData = getMockDataByFridgeId(fridgeId);
    setFridgeItems(mockData);
  }, [fridgeId]);

  const deleteItem = (itemId: number) => {
    setFridgeItems(prev => prev.filter(item => item.id !== itemId));
  };

  // 아이템 개수 변경 함수
  const updateItemQuantity = (itemId: number, newQuantity: string) => {
    setFridgeItems(prev =>
      prev.map(item =>
        item.id === itemId ? {...item, quantity: newQuantity} : item,
      ),
    );
  };

  // 아이템 단위 변경 함수
  const updateItemUnit = (itemId: number, newUnit: string) => {
    setFridgeItems(prev =>
      prev.map(item => (item.id === itemId ? {...item, unit: newUnit} : item)),
    );
  };

  // 아이템 소비기한 변경 함수
  const updateItemExpiryDate = (itemId: number, newDate: string) => {
    setFridgeItems(prev =>
      prev.map(item =>
        item.id === itemId ? {...item, expiryDate: newDate} : item,
      ),
    );
  };

  return {
    fridgeItems,
    storageTypes,
    setStorageTypes,
    itemCategories,
    setItemCategories,
    deleteItem,
    updateItemQuantity,
    updateItemUnit,
    updateItemExpiryDate,
  };
};
