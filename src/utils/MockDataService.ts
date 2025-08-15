import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../screens/RecipeScreen/RecipeNavigator';

// 냉장고 정보 인터페이스
export interface FridgeInfo {
  refrigeratorId: number;
  name: string;
  memberCount: number;
  recipes: Recipe[];
  isOwner: boolean;
  joinedAt: string;
}

// 사용자-냉장고 관계 인터페이스
export interface UserFridgeRelation {
  냉장고_사용자_id: number;
  냉장고Id: number;
  초대한_사람_id: number;
  초대받은_사람_id: number;
  생성_시간: string;
  변경_시간: string;
}

// Mock 공동 레시피 데이터
const MOCK_SHARED_RECIPES: Recipe[] = [
  {
    id: 'shared-1',
    title: '우리 가족 김치찌개',
    description: '엄마가 알려준 김치찌개 레시피',
    createdAt: '2024-01-16',
    isShared: true,
    sharedBy: '엄마',
  },
  {
    id: 'shared-2',
    title: '아빠의 된장찌개',
    description: '아빠 특제 된장찌개',
    createdAt: '2024-01-15',
    isShared: true,
    sharedBy: '아빠',
  },
  {
    id: 'shared-3',
    title: '언니의 계란말이',
    description: '언니가 공유한 계란말이',
    createdAt: '2024-01-14',
    isShared: true,
    sharedBy: '언니',
  },
  {
    id: 'shared-4',
    title: '할머니 비빔밥',
    description: '할머니의 특제 비빔밥',
    createdAt: '2024-01-13',
    isShared: true,
    sharedBy: '할머니',
  },
  {
    id: 'shared-5',
    title: '동생의 크림파스타',
    description: '동생이 만든 크림파스타',
    createdAt: '2024-01-12',
    isShared: true,
    sharedBy: '동생',
  },
  {
    id: 'shared-6',
    title: '회사 동료의 샐러드',
    description: '건강한 샐러드 레시피',
    createdAt: '2024-01-11',
    isShared: true,
    sharedBy: '김과장',
  },
  {
    id: 'shared-7',
    title: '팀장님의 삼겹살',
    description: '특제 삼겹살 굽는 법',
    createdAt: '2024-01-10',
    isShared: true,
    sharedBy: '박팀장',
  },
  {
    id: 'shared-8',
    title: '신입의 라면',
    description: '간단하지만 맛있는 라면',
    createdAt: '2024-01-09',
    isShared: true,
    sharedBy: '이신입',
  },
  {
    id: 'shared-9',
    title: '할아버지의 미역국',
    description: '생일날 먹는 특별한 미역국',
    createdAt: '2024-01-08',
    isShared: true,
    sharedBy: '할아버지',
  },
  {
    id: 'shared-10',
    title: '고모의 잡채',
    description: '명절 때 먹는 고모표 잡채',
    createdAt: '2024-01-07',
    isShared: true,
    sharedBy: '고모',
  },
];

// Mock 사용자-냉장고 관계 데이터
const MOCK_USER_FRIDGE_RELATIONS: { [userId: number]: UserFridgeRelation[] } = {
  1: [
    // 사용자 ID 1의 냉장고 관계
    {
      냉장고_사용자_id: 1,
      냉장고Id: 1,
      초대한_사람_id: 1, // 본인이 생성자
      초대받은_사람_id: 1,
      생성_시간: '2024-01-01T00:00:00Z',
      변경_시간: '2024-01-01T00:00:00Z',
    },
    {
      냉장고_사용자_id: 2,
      냉장고Id: 2,
      초대한_사람_id: 10, // 다른 사람이 초대
      초대받은_사람_id: 1,
      생성_시간: '2024-01-15T00:00:00Z',
      변경_시간: '2024-01-15T00:00:00Z',
    },
    {
      냉장고_사용자_id: 3,
      냉장고Id: 3,
      초대한_사람_id: 20, // 다른 사람이 초대
      초대받은_사람_id: 1,
      생성_시간: '2024-02-01T00:00:00Z',
      변경_시간: '2024-02-01T00:00:00Z',
    },
  ],
  2: [
    // 사용자 ID 2의 냉장고 관계
    {
      냉장고_사용자_id: 4,
      냉장고Id: 1,
      초대한_사람_id: 1, // 사용자 1이 초대
      초대받은_사람_id: 2,
      생성_시간: '2024-01-02T00:00:00Z',
      변경_시간: '2024-01-02T00:00:00Z',
    },
    {
      냉장고_사용자_id: 5,
      냉장고Id: 4,
      초대한_사람_id: 2, // 본인이 생성자
      초대받은_사람_id: 2,
      생성_시간: '2024-02-15T00:00:00Z',
      변경_시간: '2024-02-15T00:00:00Z',
    },
  ],
};

// Mock 냉장고 정보
const MOCK_REFRIGERATOR_INFO: { [fridgeId: number]: any } = {
  1: { id: 1, name: '우리집 냉장고', createdAt: '2024-01-01' },
  2: { id: 2, name: '회사 냉장고', createdAt: '2024-01-10' },
  3: { id: 3, name: '할머니집 냉장고', createdAt: '2024-01-20' },
  4: { id: 4, name: '기숙사 냉장고', createdAt: '2024-02-15' },
};

// Mock 냉장고 구성원 수
const MOCK_MEMBER_COUNTS: { [fridgeId: number]: number } = {
  1: 4,
  2: 8,
  3: 6,
  4: 3,
};

class MockDataService {
  /**
   * 사용자가 속한 냉장고 관계 조회
   */
  static async getUserFridgeRelations(
    userId: number,
  ): Promise<UserFridgeRelation[]> {
    // 실제 API 지연 시뮬레이션
    await this.delay(500);

    return MOCK_USER_FRIDGE_RELATIONS[userId] || [];
  }

  /**
   * 냉장고 기본 정보 조회
   */
  static async getRefrigeratorInfo(fridgeId: number): Promise<any> {
    await this.delay(200);

    return MOCK_REFRIGERATOR_INFO[fridgeId] || null;
  }

  /**
   * 냉장고 구성원 수 조회
   */
  static async getMemberCount(fridgeId: number): Promise<{ count: number }> {
    await this.delay(200);

    return { count: MOCK_MEMBER_COUNTS[fridgeId] || 0 };
  }

  /**
   * 냉장고별 공유 레시피 조회 (권한 확인)
   */
  static async getSharedRecipes(
    fridgeId: number,
    userId: number,
  ): Promise<Recipe[]> {
    await this.delay(300);

    // 권한 확인 - 사용자가 해당 냉장고에 속해있는지 확인
    const userRelations = await this.getUserFridgeRelations(userId);
    const hasAccess = userRelations.some(
      relation => relation.냉장고Id === fridgeId,
    );

    if (!hasAccess) {
      throw new Error('해당 냉장고에 접근 권한이 없습니다.');
    }

    // AsyncStorage에서 저장된 공유 레시피 가져오기
    try {
      const storedData = await AsyncStorage.getItem('sharedRecipes');
      const allSharedRecipes = storedData
        ? JSON.parse(storedData)
        : MOCK_SHARED_RECIPES;

      // 냉장고별로 레시피 분배 (실제로는 DB에서 fridgeId로 필터링)
      return allSharedRecipes.filter((recipe: Recipe, index: number) => {
        // 간단한 분배 로직 (실제로는 recipe.fridgeId === fridgeId)
        return index % 4 === fridgeId - 1;
      });
    } catch (error) {
      console.error('공유 레시피 조회 실패:', error);
      return [];
    }
  }

  /**
   * 사용자가 속한 모든 냉장고 정보 조회
   */
  static async getUserFridges(userId: number): Promise<FridgeInfo[]> {
    try {
      // 1. 사용자가 속한 냉장고 관계 조회
      const userFridgeRelations = await this.getUserFridgeRelations(userId);

      // 2. 각 냉장고 정보와 레시피 가져오기
      const fridgePromises = userFridgeRelations.map(async relation => {
        const [fridgeInfo, memberCount, sharedRecipes] = await Promise.all([
          this.getRefrigeratorInfo(relation.냉장고Id),
          this.getMemberCount(relation.냉장고Id),
          this.getSharedRecipes(relation.냉장고Id, userId),
        ]);

        return {
          refrigeratorId: relation.냉장고Id,
          name: fridgeInfo.name,
          memberCount: memberCount.count,
          recipes: sharedRecipes,
          isOwner: relation.초대한_사람_id === userId,
          joinedAt: relation.생성_시간.split('T')[0], // YYYY-MM-DD 형태로 변환
        };
      });

      return await Promise.all(fridgePromises);
    } catch (error) {
      console.error('사용자 냉장고 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 공유 레시피 삭제 (권한 확인)
   */
  static async deleteSharedRecipe(
    recipeId: string,
    fridgeId: number,
    userId: number,
  ): Promise<boolean> {
    await this.delay(300);

    try {
      // 권한 확인
      const userRelations = await this.getUserFridgeRelations(userId);
      const relation = userRelations.find(rel => rel.냉장고Id === fridgeId);

      if (!relation) {
        throw new Error('해당 냉장고에 접근 권한이 없습니다.');
      }

      // AsyncStorage에서 삭제
      const storedData = await AsyncStorage.getItem('sharedRecipes');
      const allSharedRecipes = storedData
        ? JSON.parse(storedData)
        : MOCK_SHARED_RECIPES;

      const updatedRecipes = allSharedRecipes.filter(
        (recipe: Recipe) => recipe.id !== recipeId,
      );
      await AsyncStorage.setItem(
        'sharedRecipes',
        JSON.stringify(updatedRecipes),
      );

      return true;
    } catch (error) {
      console.error('공유 레시피 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 초기 공유 레시피 데이터 설정
   */
  static async initializeSharedRecipes(): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem('sharedRecipes');
      if (!existingData) {
        await AsyncStorage.setItem(
          'sharedRecipes',
          JSON.stringify(MOCK_SHARED_RECIPES),
        );
      }
    } catch (error) {
      console.error('초기 공유 레시피 설정 실패:', error);
    }
  }

  /**
   * API 지연 시뮬레이션
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Mock 데이터 초기화 (개발/테스트용)
   */
  static async resetMockData(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'sharedRecipes',
        JSON.stringify(MOCK_SHARED_RECIPES),
      );
      console.log('Mock 데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('Mock 데이터 초기화 실패:', error);
    }
  }
}

export default MockDataService;
