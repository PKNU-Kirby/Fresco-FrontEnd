import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SocialProvider } from '../types/auth';

export type Refrigerator = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type RefrigeratorUser = {
  id: number;
  refrigeratorId: number;
  inviterId: number;
  inviteeId: number;
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
  id: number;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  itemCategory: string;
  fridgeId: number;
  unit?: string;
  storageType?: string;
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
      const newRefrigerator: Refrigerator = {
        id: await this.getNextId('refrigerators'),
        name,
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
        id: await this.getNextId('refrigeratorUsers'),
        refrigeratorId: newRefrigerator.id,
        inviterId: creatorId,
        inviteeId: creatorId,
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
      const fridgeIndex = refrigerators.findIndex(fridge => fridge.id === id);

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
        fridge => fridge.id !== id,
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRIGERATORS,
        JSON.stringify(filteredRefrigerators),
      );

      const refrigeratorUsers = await this.getRefrigeratorUsers();
      const filteredRefrigeratorUsers = refrigeratorUsers.filter(
        ru => ru.refrigeratorId !== id,
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
        id: await this.getNextId('refrigeratorUsers'),
        refrigeratorId,
        inviterId,
        inviteeId,
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
          !(ru.refrigeratorId === refrigeratorId && ru.inviteeId === userId),
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
        ru => ru.inviteeId === userId,
      );

      const fridgesWithRole: FridgeWithRole[] = userRefrigeratorRelations
        .map(relation => {
          const refrigerator = refrigerators.find(
            r => r.id === relation.refrigeratorId,
          );
          if (!refrigerator) return null;

          const memberCount = refrigeratorUsers.filter(
            ru => ru.refrigeratorId === refrigerator.id,
          ).length;
          const isOwner = relation.inviterId === relation.inviteeId;

          return {
            ...refrigerator,
            isOwner,
            role: isOwner ? ('owner' as const) : ('member' as const),
            memberCount,
            isHidden: hiddenFridges.includes(refrigerator.id),
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
    fridgeId: number,
  ): Promise<FridgeItem[]> {
    try {
      const allItems = await this.getAllFridgeItems();
      return allItems.filter(item => item.fridgeId === fridgeId);
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
      const maxId = allItems.reduce((max, item) => Math.max(max, item.id), 0);
      const itemWithId: FridgeItem = {
        ...newItem,
        id: maxId + 1,
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
      const filteredItems = allItems.filter(item => item.id !== itemId);
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
      // 사용자의 기본 냉장고가 있는지 확인
      const userFridges = await this.getUserRefrigerators(userId);

      if (userFridges.length === 0) {
        // 기본 냉장고 생성
        const defaultFridge = await this.createRefrigerator(
          '내 냉장고',
          userId,
        );

        // 기본 아이템들 추가
        const defaultItems: Omit<FridgeItem, 'id'>[] = [
          {
            name: '우유',
            quantity: '1',
            unit: 'L',
            expiryDate: '2025.08.20',
            itemCategory: '우유 / 유제품',
            fridgeId: defaultFridge.refrigerator.id,
          },
          {
            name: '계란',
            quantity: '10',
            unit: '개',
            expiryDate: '2025.08.25',
            itemCategory: '정육 / 계란',
            fridgeId: defaultFridge.refrigerator.id,
          },
        ];

        for (const item of defaultItems) {
          await this.addFridgeItem(item);
        }

        console.log('기본 냉장고와 아이템 생성 완료');
      }
    } catch (error) {
      console.error('Initialize default fridge error:', error);
    }
  }
}
