import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SocialProvider } from '../types/auth';

export type Refrigerator = {
  id: string;
  name: string;
  inviteCode?: string; // 초대 코드 필드 추가
  createdAt: string;
  updatedAt: string;
};

export type RefrigeratorUser = {
  id: string;
  refrigeratorId: string;
  inviterId: string;
  inviteeId: string;
  createdAt: string;
  updatedAt: string;
};

export type FridgeWithRole = Refrigerator & {
  isOwner: boolean;
  role: 'owner' | 'member';
  memberCount: number;
  isHidden: boolean; // UI 상태용
};

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

// AsyncStorage 키 상수
const STORAGE_KEYS = {
  // 사용자 관련
  CURRENT_USER_ID: 'userId',
  USERS: 'users',

  // 냉장고 관련
  REFRIGERATORS: 'refrigerators',
  REFRIGERATOR_USERS: 'refrigeratorUsers',
  HIDDEN_FRIDGES: 'hiddenFridges',

  // 아이템 관련
  FRIDGE_ITEMS: 'fridge_items',
  ITEM_CATEGORIES: 'item_categories',

  // 레시피 관련
  PERSONAL_RECIPES: 'personal_recipes',
  FAVORITE_RECIPE_IDS: 'favorite_recipe_ids',
  SEARCH_HISTORY: 'search_history',
  SHARED_RECIPES: 'shared_recipes',

  // 기타
  AUTO_INCREMENT: 'autoIncrement',
} as const;

// 자동 증가 ID 관리
export class AsyncStorageService {
  // 자동 증가 ID 생성
  private static async getNextId(table: string): Promise<number> {
    try {
      const autoIncrementData = await AsyncStorage.getItem(
        STORAGE_KEYS.AUTO_INCREMENT,
      );
      const autoIncrement = autoIncrementData
        ? JSON.parse(autoIncrementData)
        : {};

      const currentId = autoIncrement[table] || 1;
      const nextId = currentId + 1;

      autoIncrement[table] = nextId;
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTO_INCREMENT,
        JSON.stringify(autoIncrement),
      );

      return currentId;
    } catch (error) {
      console.error('Auto increment error:', error);
      return Date.now();
    }
  }

  // 현재 사용자 관리
  static async getCurrentUserId(): Promise<string | null> {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      return userId;
    } catch (error) {
      console.error('Get current user ID error:', error);
      return null;
    }
  }

  static async setCurrentUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } catch (error) {
      console.error('Set current user ID error:', error);
    }
  }

  static async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (error) {
      console.error('Clear current user error:', error);
    }
  }

  // 로그인 정보와 통합된 사용자 생성
  static async createUserFromLogin(
    provider: SocialProvider,
    providerId: string,
    name: string,
    email?: string,
    profileImage?: string,
    fcmToken?: string,
  ): Promise<User> {
    try {
      const users = await this.getUsers();

      // 기존 사용자가 있는지 확인
      let existingUser = users.find(
        u => u.provider === provider && u.providerId === providerId,
      );

      if (existingUser) {
        // 기존 사용자 정보 업데이트
        existingUser = {
          ...existingUser,
          name,
          fcmToken,
          updatedAt: new Date().toISOString(),
        };

        const updatedUsers = users.map(u =>
          u.id === existingUser!.id ? existingUser! : u,
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.USERS,
          JSON.stringify(updatedUsers),
        );

        return existingUser;
      } else {
        // 새 사용자 생성
        const newUser: User = {
          id: (await this.getNextId('users')).toString(),
          provider,
          providerId,
          name,
          fcmToken,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        users.push(newUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        return newUser;
      }
    } catch (error) {
      console.error('Create user from login error:', error);
      throw error;
    }
  }

  // 사용자 CRUD
  static async getUsers(): Promise<User[]> {
    try {
      const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find(user => user.id === id) || null;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  // 냉장고 관련 메서드들
  static async getRefrigerators(): Promise<Refrigerator[]> {
    try {
      const fridgesData = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRIGERATORS,
      );
      return fridgesData ? JSON.parse(fridgesData) : [];
    } catch (error) {
      console.error('Get refrigerators error:', error);
      return [];
    }
  }

  static async createRefrigerator(
    name: string,
    creatorId: number,
  ): Promise<{
    refrigerator: Refrigerator;
    refrigeratorUser: RefrigeratorUser;
  }> {
    try {
      const refrigerators = await this.getRefrigerators();
      const inviteCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const newRefrigerator: Refrigerator = {
        id: (await this.getNextId('refrigerators')).toString(),
        name,
        inviteCode, // 초대 코드 포함
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      refrigerators.push(newRefrigerator);
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRIGERATORS,
        JSON.stringify(refrigerators),
      );

      const refrigeratorUsers = await this.getRefrigeratorUsers();
      const newRefrigeratorUser: RefrigeratorUser = {
        id: (await this.getNextId('refrigeratorUsers')).toString(),
        refrigeratorId: newRefrigerator.id,
        inviterId: creatorId.toString(),
        inviteeId: creatorId.toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      refrigeratorUsers.push(newRefrigeratorUser);
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRIGERATOR_USERS,
        JSON.stringify(refrigeratorUsers),
      );

      return {
        refrigerator: newRefrigerator,
        refrigeratorUser: newRefrigeratorUser,
      };
    } catch (error) {
      console.error('Create refrigerator error:', error);
      throw error;
    }
  }

  static async updateRefrigerator(
    id: number,
    updates: Partial<Refrigerator>,
  ): Promise<Refrigerator | null> {
    try {
      const refrigerators = await this.getRefrigerators();
      const fridgeIndex = refrigerators.findIndex(
        fridge => parseInt(fridge.id) === id,
      );

      if (fridgeIndex === -1) return null;

      refrigerators[fridgeIndex] = {
        ...refrigerators[fridgeIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRIGERATORS,
        JSON.stringify(refrigerators),
      );
      return refrigerators[fridgeIndex];
    } catch (error) {
      console.error('Update refrigerator error:', error);
      return null;
    }
  }

  static async deleteRefrigerator(id: number): Promise<boolean> {
    try {
      const refrigerators = await this.getRefrigerators();
      const filteredRefrigerators = refrigerators.filter(
        fridge => parseInt(fridge.id) !== id,
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRIGERATORS,
        JSON.stringify(filteredRefrigerators),
      );

      const refrigeratorUsers = await this.getRefrigeratorUsers();
      const filteredRefrigeratorUsers = refrigeratorUsers.filter(
        ru => parseInt(ru.refrigeratorId) !== id,
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRIGERATOR_USERS,
        JSON.stringify(filteredRefrigeratorUsers),
      );

      return true;
    } catch (error) {
      console.error('Delete refrigerator error:', error);
      return false;
    }
  }

  // === 초대 관련 메서드들 ===

  // 냉장고의 초대 코드 가져오기
  static async getFridgeInviteCode(fridgeId: number): Promise<string | null> {
    try {
      const refrigerators = await this.getRefrigerators();
      const fridge = refrigerators.find(r => parseInt(r.id) === fridgeId);

      if (!fridge) return null;

      // 초대 코드가 없으면 생성
      if (!fridge.inviteCode) {
        const newInviteCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
        await this.updateRefrigerator(fridgeId, { inviteCode: newInviteCode });
        return newInviteCode;
      }

      return fridge.inviteCode;
    } catch (error) {
      console.error('초대 코드 조회 실패:', error);
      return null;
    }
  }

  // 초대 코드로 냉장고 찾기
  static async getFridgeByInviteCode(
    inviteCode: string,
  ): Promise<Refrigerator | null> {
    try {
      const refrigerators = await this.getRefrigerators();
      return refrigerators.find(r => r.inviteCode === inviteCode) || null;
    } catch (error) {
      console.error('초대 코드로 냉장고 조회 실패:', error);
      return null;
    }
  }

  // 냉장고에 사용자 참여
  static async joinFridgeByCode(
    inviteCode: string,
  ): Promise<{ success: boolean; message: string; fridge?: Refrigerator }> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) {
        return {
          success: false,
          message: '현재 사용자 정보를 찾을 수 없습니다.',
        };
      }

      // 초대 코드로 냉장고 찾기
      const fridge = await this.getFridgeByInviteCode(inviteCode);
      if (!fridge) {
        return { success: false, message: '유효하지 않은 초대 코드입니다.' };
      }

      const currentUserIdNum = parseInt(currentUserId, 10);
      const fridgeIdNum = parseInt(fridge.id, 10);

      // 이미 참여 중인지 확인
      const refrigeratorUsers = await this.getRefrigeratorUsers();
      const existingRelation = refrigeratorUsers.find(
        ru =>
          parseInt(ru.refrigeratorId) === fridgeIdNum &&
          parseInt(ru.inviteeId) === currentUserIdNum,
      );

      if (existingRelation) {
        return { success: false, message: '이미 참여 중인 냉장고입니다.' };
      }

      // 냉장고 소유자 찾기 (생성자)
      const ownerRelation = refrigeratorUsers.find(
        ru =>
          parseInt(ru.refrigeratorId) === fridgeIdNum &&
          ru.inviterId === ru.inviteeId,
      );
      const ownerId = ownerRelation
        ? parseInt(ownerRelation.inviterId)
        : currentUserIdNum;

      // 새로운 관계 추가
      await this.addUserToRefrigerator(fridgeIdNum, ownerId, currentUserIdNum);

      return {
        success: true,
        message: `'${fridge.name}' 냉장고에 참여했습니다.`,
        fridge,
      };
    } catch (error) {
      console.error('냉장고 참여 실패:', error);
      return { success: false, message: '냉장고 참여 중 오류가 발생했습니다.' };
    }
  }

  // 초대 코드 재생성
  static async regenerateInviteCode(fridgeId: number): Promise<string | null> {
    try {
      const newInviteCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      await this.updateRefrigerator(fridgeId, { inviteCode: newInviteCode });
      return newInviteCode;
    } catch (error) {
      console.error('초대 코드 재생성 실패:', error);
      return null;
    }
  }

  // === JoinWithCodeScreen용 추가 헬퍼 메소드들 ===

  // getUserFridges 메소드 (JoinWithCodeScreen에서 사용)
  static async getUserFridges(userId: number): Promise<FridgeWithRole[]> {
    return await this.getUserRefrigerators(userId);
  }

  // findFridgeByInviteCode 메소드 (JoinWithCodeScreen에서 사용)
  static async findFridgeByInviteCode(
    inviteCode: string,
  ): Promise<Refrigerator | null> {
    return await this.getFridgeByInviteCode(inviteCode);
  }

  // isUserFridgeMember 메소드 (중복 참여 확인용)
  static async isUserFridgeMember(
    fridgeId: number,
    userId: number,
  ): Promise<boolean> {
    try {
      const refrigeratorUsers = await this.getRefrigeratorUsers();
      return refrigeratorUsers.some(
        ru =>
          parseInt(ru.refrigeratorId) === fridgeId &&
          parseInt(ru.inviteeId) === userId,
      );
    } catch (error) {
      console.error('멤버십 확인 실패:', error);
      return false;
    }
  }

  // joinFridgeWithCode 메소드 (코드로 냉장고 참여)
  static async joinFridgeWithCode(
    fridgeId: number,
    userId: number,
  ): Promise<boolean> {
    try {
      // 이미 멤버인지 확인
      const isAlreadyMember = await this.isUserFridgeMember(fridgeId, userId);
      if (isAlreadyMember) {
        return false; // 이미 멤버임
      }

      // 냉장고 소유자 찾기
      const refrigeratorUsers = await this.getRefrigeratorUsers();
      const ownerRelation = refrigeratorUsers.find(
        ru =>
          parseInt(ru.refrigeratorId) === fridgeId &&
          ru.inviterId === ru.inviteeId,
      );
      const ownerId = ownerRelation
        ? parseInt(ownerRelation.inviterId)
        : userId;

      // 새로운 관계 추가
      await this.addUserToRefrigerator(fridgeId, ownerId, userId);
      return true; // 성공
    } catch (error) {
      console.error('냉장고 참여 실패:', error);
      throw error;
    }
  }

  // getFridgeById 메소드 (냉장고 정보 가져오기)
  static async getFridgeById(fridgeId: number): Promise<Refrigerator | null> {
    try {
      const refrigerators = await this.getRefrigerators();
      return refrigerators.find(r => parseInt(r.id) === fridgeId) || null;
    } catch (error) {
      console.error('냉장고 조회 실패:', error);
      return null;
    }
  }

  // 냉장고-사용자 관계 관리
  static async getRefrigeratorUsers(): Promise<RefrigeratorUser[]> {
    try {
      const refrigeratorUsersData = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRIGERATOR_USERS,
      );
      return refrigeratorUsersData ? JSON.parse(refrigeratorUsersData) : [];
    } catch (error) {
      console.error('Get refrigerator users error:', error);
      return [];
    }
  }

  static async addUserToRefrigerator(
    refrigeratorId: number,
    inviterId: number,
    inviteeId: number,
  ): Promise<RefrigeratorUser> {
    try {
      const refrigeratorUsers = await this.getRefrigeratorUsers();
      const newRefrigeratorUser: RefrigeratorUser = {
        id: (await this.getNextId('refrigeratorUsers')).toString(),
        refrigeratorId: refrigeratorId.toString(),
        inviterId: inviterId.toString(),
        inviteeId: inviteeId.toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      refrigeratorUsers.push(newRefrigeratorUser);
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRIGERATOR_USERS,
        JSON.stringify(refrigeratorUsers),
      );

      return newRefrigeratorUser;
    } catch (error) {
      console.error('Add user to refrigerator error:', error);
      throw error;
    }
  }

  static async removeUserFromRefrigerator(
    refrigeratorId: number,
    userId: number,
  ): Promise<boolean> {
    try {
      const refrigeratorUsers = await this.getRefrigeratorUsers();
      const filteredRefrigeratorUsers = refrigeratorUsers.filter(
        ru =>
          !(
            parseInt(ru.refrigeratorId) === refrigeratorId &&
            parseInt(ru.inviteeId) === userId
          ),
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRIGERATOR_USERS,
        JSON.stringify(filteredRefrigeratorUsers),
      );
      return true;
    } catch (error) {
      console.error('Remove user from refrigerator error:', error);
      return false;
    }
  }

  // 사용자별 냉장고 목록 조회
  static async getUserRefrigerators(userId: number): Promise<FridgeWithRole[]> {
    try {
      const [refrigerators, refrigeratorUsers, hiddenFridges] =
        await Promise.all([
          this.getRefrigerators(),
          this.getRefrigeratorUsers(),
          this.getHiddenFridges(userId),
        ]);

      const userRefrigeratorRelations = refrigeratorUsers.filter(
        ru => parseInt(ru.inviteeId) === userId,
      );

      const fridgesWithRole: FridgeWithRole[] = userRefrigeratorRelations
        .map(relation => {
          const refrigerator = refrigerators.find(
            r => parseInt(r.id) === parseInt(relation.refrigeratorId),
          );
          if (!refrigerator) return null;

          const memberCount = refrigeratorUsers.filter(
            ru => parseInt(ru.refrigeratorId) === parseInt(refrigerator.id),
          ).length;
          const isOwner = relation.inviterId === relation.inviteeId;

          return {
            ...refrigerator,
            isOwner,
            role: isOwner ? ('owner' as const) : ('member' as const),
            memberCount,
            isHidden: hiddenFridges.includes(parseInt(refrigerator.id)),
          };
        })
        .filter(Boolean) as FridgeWithRole[];

      return fridgesWithRole;
    } catch (error) {
      console.error('Get user refrigerators error:', error);
      return [];
    }
  }

  // 숨김 냉장고 관리
  static async getHiddenFridges(userId: number): Promise<number[]> {
    try {
      const hiddenFridgesData = await AsyncStorage.getItem(
        `${STORAGE_KEYS.HIDDEN_FRIDGES}_${userId}`,
      );
      return hiddenFridgesData ? JSON.parse(hiddenFridgesData) : [];
    } catch (error) {
      console.error('Get hidden fridges error:', error);
      return [];
    }
  }

  static async setFridgeHidden(
    userId: number,
    fridgeId: number,
    isHidden: boolean,
  ): Promise<void> {
    try {
      const hiddenFridges = await this.getHiddenFridges(userId);

      if (isHidden) {
        if (!hiddenFridges.includes(fridgeId)) {
          hiddenFridges.push(fridgeId);
        }
      } else {
        const index = hiddenFridges.indexOf(fridgeId);
        if (index > -1) {
          hiddenFridges.splice(index, 1);
        }
      }

      await AsyncStorage.setItem(
        `${STORAGE_KEYS.HIDDEN_FRIDGES}_${userId}`,
        JSON.stringify(hiddenFridges),
      );
    } catch (error) {
      console.error('Set fridge hidden error:', error);
    }
  }

  // FridgeItem 관련 메서드
  static async getAllFridgeItems(): Promise<FridgeItem[]> {
    try {
      const itemsJson = await AsyncStorage.getItem(STORAGE_KEYS.FRIDGE_ITEMS);
      return itemsJson ? JSON.parse(itemsJson) : [];
    } catch (error) {
      console.error('Get all fridge items error:', error);
      return [];
    }
  }

  static async getFridgeItemsByFridgeId(
    fridgeId: string,
  ): Promise<FridgeItem[]> {
    try {
      const allItems = await this.getAllFridgeItems();
      return allItems.filter(
        item => parseInt(item.fridgeId, 10) === parseInt(fridgeId, 10),
      );
    } catch (error) {
      console.error('Get fridge items by fridge ID error:', error);
      return [];
    }
  }

  static async addFridgeItem(
    newItem: Omit<FridgeItem, 'id'>,
  ): Promise<FridgeItem> {
    try {
      const allItems = await this.getAllFridgeItems();
      const maxId = allItems.reduce(
        (max, item) => Math.max(max, parseInt(item.id)),
        0,
      );
      const itemWithId: FridgeItem = {
        ...newItem,
        id: (maxId + 1).toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedItems = [...allItems, itemWithId];
      await AsyncStorage.setItem(
        STORAGE_KEYS.FRIDGE_ITEMS,
        JSON.stringify(updatedItems),
      );

      return itemWithId;
    } catch (error) {
      console.error('Add fridge item error:', error);
      throw error;
    }
  }

  static async updateFridgeItem(updatedItem: FridgeItem): Promise<void> {
    try {
      const allItems = await this.getAllFridgeItems();
      const updatedItems = allItems.map(item =>
        item.id === updatedItem.id
          ? { ...updatedItem, updatedAt: new Date().toISOString() }
          : item,
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.FRIDGE_ITEMS,
        JSON.stringify(updatedItems),
      );
    } catch (error) {
      console.error('Update fridge item error:', error);
      throw error;
    }
  }

  static async deleteFridgeItem(itemId: number): Promise<void> {
    try {
      const allItems = await this.getAllFridgeItems();
      const filteredItems = allItems.filter(
        item => parseInt(item.id) !== itemId,
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.FRIDGE_ITEMS,
        JSON.stringify(filteredItems),
      );
    } catch (error) {
      console.error('Delete fridge item error:', error);
      throw error;
    }
  }

  // 아이템 카테고리 관련
  static async getItemCategories(): Promise<string[]> {
    try {
      const categoriesJson = await AsyncStorage.getItem(
        STORAGE_KEYS.ITEM_CATEGORIES,
      );
      return categoriesJson
        ? JSON.parse(categoriesJson)
        : [
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
          ];
    } catch (error) {
      console.error('Get item categories error:', error);
      return [];
    }
  }

  // 초기 데이터 생성
  static async initializeDefaultFridgeForUser(userId: number): Promise<void> {
    try {
      // 이미 초기화됐는지 확인하는 플래그 추가
      const initKey = `initialized_${userId}`;
      const isInitialized = await AsyncStorage.getItem(initKey);

      if (isInitialized) {
        console.log('사용자 이미 초기화됨');
        return;
      }

      // 사용자의 기본 냉장고가 있는지 확인
      const userFridges = await this.getUserRefrigerators(userId);

      if (userFridges.length === 0) {
        // 기본 냉장고 생성
        await this.createRefrigerator('내 냉장고', userId);
        console.log('기본 냉장고 생성 완료');
      }

      // 초기화 완료 플래그 저장
      await AsyncStorage.setItem(initKey, 'true');
    } catch (error) {
      console.error('Initialize default fridge error:', error);
    }
  }
}
