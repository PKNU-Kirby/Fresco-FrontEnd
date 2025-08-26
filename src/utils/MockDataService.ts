import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Recipe,
  RecipeIngredient,
} from '../screens/RecipeScreen/RecipeNavigator';

// 냉장고 식재료 인터페이스
export interface FridgeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  categoryId?: string;
  expirationDate?: string;
  fridgeId: number;
}

// 대체 재료 관계 인터페이스
export interface AlternativeRelation {
  originalName: string;
  alternativeName: string;
  reason: string; // 대체 가능한 이유
}

// 기존 인터페이스들...
export interface FridgeInfo {
  refrigeratorId: number;
  name: string;
  memberCount: number;
  recipes: Recipe[];
  isOwner: boolean;
  joinedAt: string;
}

export interface UserFridgeRelation {
  냉장고_사용자_id: number;
  냉장고Id: number;
  초대한_사람_id: number;
  초대받은_사람_id: number;
  생성_시간: string;
  변경_시간: string;
}

// Mock 냉장고별 식재료 데이터
const MOCK_FRIDGE_INGREDIENTS: { [fridgeId: number]: FridgeIngredient[] } = {
  1: [
    // 우리집 냉장고
    {
      id: '1',
      name: '양파',
      quantity: 3,
      unit: '개',
      categoryId: '1',
      expirationDate: '2025-09-01',
      fridgeId: 1,
    },
    {
      id: '2',
      name: '대파',
      quantity: 2,
      unit: '단',
      categoryId: '1',
      expirationDate: '2025-08-30',
      fridgeId: 1,
    },
    {
      id: '3',
      name: '당근',
      quantity: 5,
      unit: '개',
      categoryId: '1',
      expirationDate: '2025-08-28',
      fridgeId: 1,
    },
    {
      id: '4',
      name: '감자',
      quantity: 8,
      unit: '개',
      categoryId: '1',
      expirationDate: '2025-09-10',
      fridgeId: 1,
    },
    {
      id: '5',
      name: '소금',
      quantity: 500,
      unit: 'g',
      categoryId: '2',
      expirationDate: '2026-08-01',
      fridgeId: 1,
    },
    {
      id: '6',
      name: '설탕',
      quantity: 300,
      unit: 'g',
      categoryId: '2',
      expirationDate: '2026-05-01',
      fridgeId: 1,
    },
    {
      id: '7',
      name: '간장',
      quantity: 200,
      unit: 'ml',
      categoryId: '2',
      expirationDate: '2025-12-01',
      fridgeId: 1,
    },
    {
      id: '8',
      name: '식용유',
      quantity: 800,
      unit: 'ml',
      categoryId: '2',
      expirationDate: '2025-10-01',
      fridgeId: 1,
    },
    {
      id: '9',
      name: '우유',
      quantity: 1000,
      unit: 'ml',
      categoryId: '3',
      expirationDate: '2025-08-30',
      fridgeId: 1,
    },
    {
      id: '10',
      name: '계란',
      quantity: 12,
      unit: '개',
      categoryId: '3',
      expirationDate: '2025-09-05',
      fridgeId: 1,
    },
  ],
  2: [
    // 회사 냉장고
    {
      id: '11',
      name: '파프리카',
      quantity: 4,
      unit: '개',
      categoryId: '1',
      expirationDate: '2025-08-29',
      fridgeId: 2,
    },
    {
      id: '12',
      name: '양배추',
      quantity: 1,
      unit: '통',
      categoryId: '1',
      expirationDate: '2025-09-02',
      fridgeId: 2,
    },
    {
      id: '13',
      name: '마요네즈',
      quantity: 300,
      unit: 'ml',
      categoryId: '2',
      expirationDate: '2025-11-01',
      fridgeId: 2,
    },
    {
      id: '14',
      name: '케첩',
      quantity: 200,
      unit: 'ml',
      categoryId: '2',
      expirationDate: '2025-10-15',
      fridgeId: 2,
    },
  ],
  3: [
    // 할머니집 냉장고
    {
      id: '15',
      name: '무',
      quantity: 2,
      unit: '개',
      categoryId: '1',
      expirationDate: '2025-09-05',
      fridgeId: 3,
    },
    {
      id: '16',
      name: '배추',
      quantity: 1,
      unit: '포기',
      categoryId: '1',
      expirationDate: '2025-08-31',
      fridgeId: 3,
    },
    {
      id: '17',
      name: '된장',
      quantity: 500,
      unit: 'g',
      categoryId: '2',
      expirationDate: '2026-02-01',
      fridgeId: 3,
    },
    {
      id: '18',
      name: '고춧가루',
      quantity: 100,
      unit: 'g',
      categoryId: '2',
      expirationDate: '2025-12-01',
      fridgeId: 3,
    },
  ],
};

// Mock 대체 재료 관계 데이터
const MOCK_ALTERNATIVE_RELATIONS: AlternativeRelation[] = [
  // 채소류 대체재
  {
    originalName: '양파',
    alternativeName: '대파',
    reason: '매운맛과 단맛을 동시에 낼 수 있어요',
  },
  {
    originalName: '대파',
    alternativeName: '양파',
    reason: '향과 맛이 비슷해요',
  },
  {
    originalName: '당근',
    alternativeName: '파프리카',
    reason: '단맛과 색감이 비슷해요',
  },
  {
    originalName: '파프리카',
    alternativeName: '당근',
    reason: '단맛과 아삭한 식감이 비슷해요',
  },
  {
    originalName: '배추',
    alternativeName: '양배추',
    reason: '식감과 용도가 비슷해요',
  },
  {
    originalName: '양배추',
    alternativeName: '배추',
    reason: '잎채소로 용도가 비슷해요',
  },

  // 조미료 대체재
  {
    originalName: '설탕',
    alternativeName: '꿀',
    reason: '단맛을 낼 수 있어요',
  },
  {
    originalName: '꿀',
    alternativeName: '설탕',
    reason: '자연 단맛을 낼 수 있어요',
  },
  {
    originalName: '소금',
    alternativeName: '간장',
    reason: '짠맛을 낼 수 있어요 (색이 진해져요)',
  },
  {
    originalName: '간장',
    alternativeName: '소금',
    reason: '짠맛을 낼 수 있어요',
  },
  {
    originalName: '마요네즈',
    alternativeName: '케첩',
    reason: '소스로 사용할 수 있어요 (맛은 달라져요)',
  },

  // 기타 대체재
  {
    originalName: '감자',
    alternativeName: '무',
    reason: '식감이 비슷하고 국물 요리에 좋아요',
  },
  {
    originalName: '무',
    alternativeName: '감자',
    reason: '뿌리채소로 식감이 비슷해요',
  },
];

// 기존 Mock 데이터들...
const MOCK_SHARED_RECIPES: Recipe[] = [
  // ... 기존 데이터 유지
];

const MOCK_USER_FRIDGE_RELATIONS: { [userId: number]: UserFridgeRelation[] } = {
  // ... 기존 데이터 유지
};

const MOCK_REFRIGERATOR_INFO: { [fridgeId: number]: any } = {
  // ... 기존 데이터 유지
};

const MOCK_MEMBER_COUNTS: { [fridgeId: number]: number } = {
  // ... 기존 데이터 유지
};

class MockDataService {
  // 기존 메서드들...
  static async getUserFridgeRelations(
    userId: number,
  ): Promise<UserFridgeRelation[]> {
    await this.delay(500);
    return MOCK_USER_FRIDGE_RELATIONS[userId] || [];
  }

  static async getRefrigeratorInfo(fridgeId: number): Promise<any> {
    await this.delay(200);
    return MOCK_REFRIGERATOR_INFO[fridgeId] || null;
  }

  static async getMemberCount(fridgeId: number): Promise<{ count: number }> {
    await this.delay(200);
    return { count: MOCK_MEMBER_COUNTS[fridgeId] || 0 };
  }

  static async getUserFridges(userId: number): Promise<FridgeInfo[]> {
    // ... 기존 구현 유지
  }

  // === 새로 추가되는 메서드들 ===

  /**
   * 특정 냉장고의 식재료 목록 조회
   */
  static async getFridgeIngredients(
    fridgeId: number,
  ): Promise<FridgeIngredient[]> {
    await this.delay(300);

    try {
      // AsyncStorage에서 사용자가 추가한 식재료 조회 (있다면)
      const storageKey = `fridge_ingredients_${fridgeId}`;
      const storedData = await AsyncStorage.getItem(storageKey);

      if (storedData) {
        const userIngredients = JSON.parse(storedData);
        // Mock 데이터와 병합
        return [
          ...(MOCK_FRIDGE_INGREDIENTS[fridgeId] || []),
          ...userIngredients,
        ];
      }

      return MOCK_FRIDGE_INGREDIENTS[fridgeId] || [];
    } catch (error) {
      console.error('냉장고 식재료 조회 실패:', error);
      return MOCK_FRIDGE_INGREDIENTS[fridgeId] || [];
    }
  }

  /**
   * 특정 재료의 대체 가능한 재료 조회
   */
  static async getAlternativeIngredients(
    ingredientName: string,
  ): Promise<AlternativeRelation[]> {
    await this.delay(200);

    try {
      // 정확한 이름 매칭 및 유사한 이름 매칭
      return MOCK_ALTERNATIVE_RELATIONS.filter(
        relation =>
          relation.originalName
            .toLowerCase()
            .includes(ingredientName.toLowerCase()) ||
          ingredientName
            .toLowerCase()
            .includes(relation.originalName.toLowerCase()),
      );
    } catch (error) {
      console.error('대체 재료 조회 실패:', error);
      return [];
    }
  }

  /**
   * 레시피 재료와 냉장고 재료를 비교하여 대체재 포함 정보 반환
   */
  static async checkRecipeIngredients(
    recipeIngredients: RecipeIngredient[],
    fridgeId: number,
  ): Promise<
    Array<
      RecipeIngredient & {
        isAvailable: boolean;
        alternatives: Array<{
          name: string;
          quantity: number;
          unit: string;
          reason: string;
        }>;
      }
    >
  > {
    await this.delay(400);

    try {
      const fridgeIngredients = await this.getFridgeIngredients(fridgeId);

      const result = await Promise.all(
        recipeIngredients.map(async ingredient => {
          // 1. 냉장고에 정확히 있는지 확인
          const exactMatch = fridgeIngredients.find(
            fridgeItem =>
              fridgeItem.name.toLowerCase() === ingredient.name.toLowerCase(),
          );

          // 2. 대체재 조회
          const alternativeRelations = await this.getAlternativeIngredients(
            ingredient.name,
          );
          const availableAlternatives = [];

          for (const relation of alternativeRelations) {
            const fridgeAlternative = fridgeIngredients.find(
              fridgeItem =>
                fridgeItem.name.toLowerCase() ===
                relation.alternativeName.toLowerCase(),
            );

            if (fridgeAlternative) {
              availableAlternatives.push({
                name: fridgeAlternative.name,
                quantity: fridgeAlternative.quantity,
                unit: fridgeAlternative.unit,
                reason: relation.reason,
              });
            }
          }

          return {
            ...ingredient,
            isAvailable: !!exactMatch,
            alternatives: availableAlternatives,
          };
        }),
      );

      return result;
    } catch (error) {
      console.error('레시피 재료 확인 실패:', error);
      return recipeIngredients.map(ingredient => ({
        ...ingredient,
        isAvailable: false,
        alternatives: [],
      }));
    }
  }

  /**
   * 냉장고에 식재료 추가 (사용자가 직접 추가하는 경우)
   */
  static async addFridgeIngredient(
    fridgeId: number,
    ingredient: Omit<FridgeIngredient, 'id' | 'fridgeId'>,
  ): Promise<boolean> {
    await this.delay(300);

    try {
      const storageKey = `fridge_ingredients_${fridgeId}`;
      const storedData = await AsyncStorage.getItem(storageKey);
      const currentIngredients = storedData ? JSON.parse(storedData) : [];

      const newIngredient: FridgeIngredient = {
        ...ingredient,
        id: Date.now().toString(),
        fridgeId,
      };

      currentIngredients.push(newIngredient);
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify(currentIngredients),
      );

      return true;
    } catch (error) {
      console.error('냉장고 식재료 추가 실패:', error);
      return false;
    }
  }

  /**
   * 냉장고에서 식재료 제거
   */
  static async removeFridgeIngredient(
    fridgeId: number,
    ingredientId: string,
  ): Promise<boolean> {
    await this.delay(300);

    try {
      const storageKey = `fridge_ingredients_${fridgeId}`;
      const storedData = await AsyncStorage.getItem(storageKey);

      if (!storedData) return false;

      const currentIngredients = JSON.parse(storedData);
      const updatedIngredients = currentIngredients.filter(
        (ingredient: FridgeIngredient) => ingredient.id !== ingredientId,
      );

      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify(updatedIngredients),
      );
      return true;
    } catch (error) {
      console.error('냉장고 식재료 제거 실패:', error);
      return false;
    }
  }

  // 기존 메서드들...
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async resetMockData(): Promise<void> {
    try {
      // 냉장고별 식재료 데이터도 초기화
      for (const fridgeId of Object.keys(MOCK_FRIDGE_INGREDIENTS)) {
        await AsyncStorage.removeItem(`fridge_ingredients_${fridgeId}`);
      }
      console.log('Mock 데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('Mock 데이터 초기화 실패:', error);
    }
  }
}

export default MockDataService;
