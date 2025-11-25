import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../types/config';
import { getTokenUserId } from '../utils/authUtils';
import { User, SocialProvider, UserId } from '../types/auth';

// 타입 정의
export type Refrigerator = {
  id: number;
  name: string;
  inviteCode?: string;
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
};

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

export interface StoredUserInfo {
  userId: number;
  provider: SocialProvider;
  providerId: number;
  name: string;
  email?: string;
  profileImage?: string;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type GroceryItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string | null;
  purchased: boolean;
  groceryListId?: number;
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

  // 장바구니 관련
  GROCERY_LIST: 'grocery_list',
  // 기타
  AUTO_INCREMENT: 'autoIncrement',
} as const;

// 토큰 갱신 상태 관리
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export class AsyncStorageService {
  // 기존 키들
  private static readonly KEYS = {
    CURRENT_USER_ID: 'currentUserId',
    USERS: 'users',
    REFRIGERATORS: 'refrigerators',
    REFRIGERATOR_USERS: 'refrigeratorUsers',
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
  };

  // ============================================================================
  // 토큰 관리 메서드들
  // ============================================================================

  static async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      // console.error('getAuthToken error:', error);
      return null;
    }
  }

  static async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('accessToken', token);
    } catch (error) {
      // console.error('setAuthToken error:', error);
      throw error;
    }
  }

  static async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('accessToken');
    } catch (error) {
      // console.error('clearAuthToken error:', error);
      throw error;
    }
  }

  static async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('refreshToken', token);
      console.log('리프레시 토큰 저장됨');
    } catch (error) {
      // console.error('리프레시 토큰 저장 실패:', error);
      throw error;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      // console.error('리프레시 토큰 조회 실패:', error);
      return null;
    }
  }

  static async clearRefreshToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('refreshToken');
      console.log('리프레시 토큰 삭제됨');
    } catch (error) {
      // console.error('리프레시 토큰 삭제 실패:', error);
      throw error;
    }
  }

  static async setTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    const tokenArray: [string, string][] = [
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ];
    await AsyncStorage.multiSet(tokenArray);
  }

  static async clearAllAuthData(): Promise<void> {
    try {
      await Promise.all([
        this.clearAuthToken(),
        this.clearRefreshToken(),
        this.clearCurrentUser(),
        AsyncStorage.removeItem(this.KEYS.CURRENT_USER_ID),
      ]);
      console.log('모든 인증 데이터 삭제됨');
    } catch (error) {
      // console.error('인증 데이터 삭제 실패:', error);
      throw error;
    }
  }

  // ============================================================================
  // 사용자 정보 관리 메서드들
  // ============================================================================

  static async setCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      // console.error('setCurrentUser error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      // console.error('getCurrentUser error:', error);
      return null;
    }
  }

  static async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      // console.error('clearCurrentUser error:', error);
      throw error;
    }
  }

  static async setCurrentUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem('currentUserId', userId);
    } catch (error) {
      // console.error('setCurrentUserId error:', error);
      throw error;
    }
  }

  static async getCurrentUserId(): Promise<string | null> {
    try {
      let tokenUserId = await getTokenUserId();

      if (tokenUserId) {
        await AsyncStorage.setItem('currentUserId', tokenUserId);
        return tokenUserId;
      }

      const expired = await isTokenExpired();

      if (expired) {
        const refreshSuccess = await refreshAccessToken();

        if (refreshSuccess) {
          tokenUserId = await getTokenUserId();

          if (tokenUserId) {
            await AsyncStorage.setItem('currentUserId', tokenUserId);
            return tokenUserId;
          }
        } else {
          // console.log('X 토큰 리프레시 실패');
        }
      }

      const storedUserId = await AsyncStorage.getItem('currentUserId');

      if (storedUserId) {
        return storedUserId;
      }

      // console.error('X 모든 방법으로 userId 조회 실패');
      return null;
    } catch (error) {
      // console.error('X 사용자 ID 조회 중 오류:', error);
      return null;
    }
  }

  // ============================================================================
  // 자동 증가 ID 생성
  // ============================================================================

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
      // console.error('Auto increment error:', error);
      return Date.now();
    }
  }

  // ============================================================================
  // 로그인 사용자 생성 함수 (원래 시그니처 유지)
  // ============================================================================

  static async createUserFromLogin(
    provider: SocialProvider,
    providerId: string,
    name: string,
  ): Promise<User> {
    try {
      const tokenUserId = await getTokenUserId();
      const serverUserId = tokenUserId || '1';

      const newUser: User = {
        id: serverUserId,
        provider,
        providerId,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // update user list
      const usersJson = await AsyncStorage.getItem('users');
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      const existingIndex = users.findIndex(u => u.id === serverUserId);
      if (existingIndex >= 0) {
        users[existingIndex] = { ...users[existingIndex], ...newUser };
      } else {
        users.push(newUser);
      }

      await AsyncStorage.setItem('users', JSON.stringify(users));
      console.log('사용자 저장 완료:', newUser);

      return newUser;
    } catch (error) {
      // console.error('사용자 생성 실패:', error);
      throw error;
    }
  }

  // ============================================================================
  // 사용자 CRUD
  // ============================================================================

  static async getUsers(): Promise<User[]> {
    try {
      const usersData = await AsyncStorage.getItem(this.KEYS.USERS);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      // console.error('Get users error:', error);
      return [];
    }
  }
  static async getUserById(id: number): Promise<User | null> {
    try {
      const usersJson = await AsyncStorage.getItem(this.KEYS.USERS);

      if (!usersJson) {
        const expired = await isTokenExpired();

        if (expired) {
          const refreshSuccess = await refreshAccessToken();

          if (refreshSuccess) {
            const retryUsersJson = await AsyncStorage.getItem(this.KEYS.USERS);
            if (!retryUsersJson) {
              return null;
            }

            const users: User[] = JSON.parse(retryUsersJson);
            return users.find(user => user.id === id.toString()) || null;
          }
        }

        return null;
      }

      const users: User[] = JSON.parse(usersJson);
      return users.find(user => user.id === id.toString()) || null;
    } catch (error) {
      // console.error('X Get user by ID error:', error);
      return null;
    }
  }

  // ============================================================================
  // 냉장고 관련 메서드들
  // ============================================================================

  static async getRefrigerators(): Promise<Refrigerator[]> {
    try {
      const fridgesData = await AsyncStorage.getItem(this.KEYS.REFRIGERATORS);
      return fridgesData ? JSON.parse(fridgesData) : [];
    } catch (error) {
      // console.error('Get refrigerators error:', error);
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
        id: await this.getNextId('refrigerators'),
        name,
        inviteCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      refrigerators.push(newRefrigerator);
      await AsyncStorage.setItem(
        this.KEYS.REFRIGERATORS,
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
        this.KEYS.REFRIGERATOR_USERS,
        JSON.stringify(refrigeratorUsers),
      );

      return {
        refrigerator: newRefrigerator,
        refrigeratorUser: newRefrigeratorUser,
      };
    } catch (error) {
      // console.error('Create refrigerator error:', error);
      throw error;
    }
  }

  static async getRefrigeratorUsers(): Promise<RefrigeratorUser[]> {
    try {
      const refrigeratorUsersData = await AsyncStorage.getItem(
        this.KEYS.REFRIGERATOR_USERS,
      );
      return refrigeratorUsersData ? JSON.parse(refrigeratorUsersData) : [];
    } catch (error) {
      // console.error('Get refrigerator users error:', error);
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
        refrigeratorId: refrigeratorId,
        inviterId: inviterId,
        inviteeId: inviteeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      refrigeratorUsers.push(newRefrigeratorUser);
      await AsyncStorage.setItem(
        this.KEYS.REFRIGERATOR_USERS,
        JSON.stringify(refrigeratorUsers),
      );

      return newRefrigeratorUser;
    } catch (error) {
      // console.error('Add user to refrigerator error:', error);
      throw error;
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
      // console.error('Get user refrigerators error:', error);
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
      // console.error('Get hidden fridges error:', error);
      return [];
    }
  }

  static async getFridgeHidden(
    userId: number,
    fridgeId: number,
  ): Promise<boolean> {
    try {
      const hiddenFridges = await this.getHiddenFridges(userId);
      return hiddenFridges.includes(fridgeId);
    } catch (error) {
      // console.error('getFridgeHidden 실패:', error);
      return false;
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
      // console.error('Set fridge hidden error:', error);
    }
  }

  static async initializeDefaultFridgeForUser(userId: number): Promise<void> {
    try {
      const initKey = `initialized_${userId}`;
      const isInitialized = await AsyncStorage.getItem(initKey);

      if (isInitialized) {
        console.log('사용자 이미 초기화됨');
        return;
      }

      const userFridges = await this.getUserRefrigerators(userId);

      if (userFridges.length === 0) {
        await this.createRefrigerator('내 냉장고', userId);
        console.log('기본 냉장고 생성 완료');
      }

      await AsyncStorage.setItem(initKey, 'true');
    } catch (error) {
      // console.error('Initialize default fridge error:', error);
    }
  }

  static async getSelectedFridgeId(): Promise<number | null> {
    try {
      const fridgeId = await AsyncStorage.getItem('selectedFridgeId');
      return fridgeId ? parseInt(fridgeId, 10) : null;
    } catch (error) {
      // console.error('선택된 냉장고 ID 조회 실패:', error);
      return null;
    }
  }

  static async setSelectedFridgeId(fridgeId: number): Promise<void> {
    try {
      await AsyncStorage.setItem('selectedFridgeId', fridgeId.toString());
    } catch (error) {
      // console.error('선택된 냉장고 ID 저장 실패:', error);
      throw error;
    }
  }

  // ============================================================================
  // 장바구니(Grocery) 관련 메서드들
  // ============================================================================

  /**
   * 장바구니 전체 조회
   */
  static async getGroceryList(): Promise<GroceryItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GROCERY_LIST);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      // console.error('장바구니 조회 실패:', error);
      return [];
    }
  }

  /**
   * 장바구니 전체 저장
   */
  static async saveGroceryList(items: GroceryItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.GROCERY_LIST,
        JSON.stringify(items),
      );
    } catch (error) {
      // console.error('장바구니 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 장바구니에 아이템 추가
   */
  static async addToGroceryList(item: GroceryItem): Promise<void> {
    try {
      const items = await this.getGroceryList();
      items.push(item);
      await this.saveGroceryList(items);
    } catch (error) {
      // console.error('장바구니 아이템 추가 실패:', error);
      throw error;
    }
  }

  /**
   * 장바구니 아이템 업데이트
   */
  static async updateGroceryItem(
    itemId: number,
    updates: Partial<GroceryItem>,
  ): Promise<void> {
    try {
      const items = await this.getGroceryList();
      const index = items.findIndex(item => item.id === itemId);

      if (index !== -1) {
        items[index] = { ...items[index], ...updates };
        await this.saveGroceryList(items);
      }
    } catch (error) {
      // console.error('장바구니 아이템 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 장바구니에서 아이템 삭제
   */
  static async removeFromGroceryList(itemId: number): Promise<void> {
    try {
      const items = await this.getGroceryList();
      const filtered = items.filter(item => item.id !== itemId);
      await this.saveGroceryList(filtered);
    } catch (error) {
      // console.error('장바구니 아이템 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 장바구니 전체 비우기
   */
  static async clearGroceryList(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GROCERY_LIST);
    } catch (error) {
      // console.error('장바구니 비우기 실패:', error);
      throw error;
    }
  }

  // ============================================================================
  // 인증 상태 관리
  // ============================================================================

  static async isLoggedIn(): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    const accessToken = await this.getAuthToken();
    return !!(userId && accessToken);
  }

  // ============================================================================
  // 사용자 정보 저장 (호환성을 위해)
  // ============================================================================

  static async saveUserInfo(userInfo: StoredUserInfo): Promise<void> {
    const userDataArray: [string, string][] = [
      ['userId', userInfo.userId.toString()],
      ['userProvider', userInfo.provider],
      ['userProviderId', userInfo.providerId.toString()],
      ['userName', userInfo.name],
      ['userProfile', JSON.stringify(userInfo)],
    ];

    if (userInfo.email) {
      userDataArray.push(['userEmail', userInfo.email]);
    }
    if (userInfo.profileImage) {
      userDataArray.push(['userProfileImage', userInfo.profileImage]);
    }
    if (userInfo.fcmToken) {
      userDataArray.push(['userFcmToken', userInfo.fcmToken]);
    }

    await AsyncStorage.multiSet(userDataArray);
  }
}

// ============================================================================
// 토큰 자동 갱신 (동시성 제어)
// ============================================================================

export const saveTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  const tokenArray: [string, string][] = [
    ['accessToken', accessToken],
    ['refreshToken', refreshToken],
  ];
  await AsyncStorage.multiSet(tokenArray);
};

export const getAccessToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('accessToken');
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('refreshToken');
};

export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return true;

    const tokenParts = accessToken.split('.');
    if (tokenParts.length !== 3) return true;

    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp <= currentTime + 30;
  } catch (error) {
    // console.error('토큰 만료 확인 중 오류:', error);
    return true;
  }
};

export const refreshAccessToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    console.log('토큰 갱신이 이미 진행 중, 기존 프로미스를 반환');
    return await refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await logout();
        return false;
      }

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: refreshToken,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (data.code && data.code.includes('OK') && data.result) {
          await saveTokens(
            data.result.accessToken,
            data.result.refreshToken || refreshToken,
          );
          return true;
        } else {
          return false;
        }
      } else {
        // console.log('X 토큰 갱신 API 실패:', response.status);

        // 401/403 -> 재로그인 필요
        if (response.status === 401 || response.status === 403) {
          console.log('>> 토큰 만료 : 재로그인 필요');
          await logout();
        }

        return false;
      }
    } catch (error) {
      // console.error('X 토큰 갱신 중 오류 :', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return await refreshPromise;
};
// ============================================================================
// 기존 호환성을 위한 함수들
// ============================================================================

export const getUserInfo = async (): Promise<StoredUserInfo | null> => {
  try {
    const userProfileString = await AsyncStorage.getItem('userProfile');
    return userProfileString ? JSON.parse(userProfileString) : null;
  } catch (error) {
    // console.error('사용자 정보 읽기 실패:', error);
    return null;
  }
};

export const getUserId = async (): Promise<UserId | null> => {
  return await AsyncStorage.getItem('userId');
};

export const getUserName = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('userName');
};

export const getUserEmail = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('userEmail');
};

export const getUserProvider = async (): Promise<SocialProvider | null> => {
  return (await AsyncStorage.getItem('userProvider')) as SocialProvider | null;
};

export const getUserProviderId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('userProviderId');
};

export const isLoggedIn = async (): Promise<boolean> => {
  return AsyncStorageService.isLoggedIn();
};

export const logout = async (): Promise<boolean> => {
  try {
    await AsyncStorageService.clearAllAuthData();
    isRefreshing = false;
    refreshPromise = null;
    return true;
  } catch (error) {
    // console.error('로그아웃 실패:', error);
    return false;
  }
};
