import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { User, SocialProvider, UserId } from '../types/auth';

// 타입 정의들
export type Refrigerator = {
  id: string;
  name: string;
  inviteCode?: string;
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

export interface StoredUserInfo {
  userId: string;
  provider: SocialProvider;
  providerId: string;
  name: string;
  email?: string;
  profileImage?: string;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
      console.error('getAuthToken error:', error);
      return null;
    }
  }

  static async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('setAuthToken error:', error);
      throw error;
    }
  }

  static async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('accessToken');
    } catch (error) {
      console.error('clearAuthToken error:', error);
      throw error;
    }
  }

  static async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('refreshToken', token);
      console.log('리프레시 토큰 저장됨');
    } catch (error) {
      console.error('리프레시 토큰 저장 실패:', error);
      throw error;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('리프레시 토큰 조회 실패:', error);
      return null;
    }
  }

  static async clearRefreshToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('refreshToken');
      console.log('리프레시 토큰 삭제됨');
    } catch (error) {
      console.error('리프레시 토큰 삭제 실패:', error);
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
      console.error('인증 데이터 삭제 실패:', error);
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
      console.error('setCurrentUser error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  }

  static async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('clearCurrentUser error:', error);
      throw error;
    }
  }

  static async setCurrentUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem('currentUserId', userId);
    } catch (error) {
      console.error('setCurrentUserId error:', error);
      throw error;
    }
  }

  static async getCurrentUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('currentUserId');
    } catch (error) {
      console.error('getCurrentUserId error:', error);
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
      console.error('Auto increment error:', error);
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
          this.KEYS.USERS,
          JSON.stringify(updatedUsers),
        );

        console.log('기존 사용자 업데이트 완료:', existingUser);
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
        await AsyncStorage.setItem(this.KEYS.USERS, JSON.stringify(users));

        console.log('새 사용자 생성 완료:', newUser);
        return newUser;
      }
    } catch (error) {
      console.error('Create user from login error:', error);
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

  // ============================================================================
  // 냉장고 관련 메서드들
  // ============================================================================

  static async getRefrigerators(): Promise<Refrigerator[]> {
    try {
      const fridgesData = await AsyncStorage.getItem(this.KEYS.REFRIGERATORS);
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
        id: (await this.getNextId('refrigeratorUsers')).toString(),
        refrigeratorId: newRefrigerator.id,
        inviterId: creatorId.toString(),
        inviteeId: creatorId.toString(),
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
      console.error('Create refrigerator error:', error);
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
        this.KEYS.REFRIGERATOR_USERS,
        JSON.stringify(refrigeratorUsers),
      );

      return newRefrigeratorUser;
    } catch (error) {
      console.error('Add user to refrigerator error:', error);
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

  static async getFridgeHidden(
    userId: number,
    fridgeId: number,
  ): Promise<boolean> {
    try {
      const hiddenFridges = await this.getHiddenFridges(userId);
      return hiddenFridges.includes(fridgeId);
    } catch (error) {
      console.error('getFridgeHidden 실패:', error);
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
      console.error('Set fridge hidden error:', error);
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
      ['userId', userInfo.userId],
      ['userProvider', userInfo.provider],
      ['userProviderId', userInfo.providerId],
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
    console.error('토큰 만료 확인 중 오류:', error);
    return true;
  }
};

export const refreshAccessToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    console.log('토큰 갱신이 이미 진행 중입니다.');
    return await refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      console.log('토큰 갱신 시작...');

      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        console.log('Refresh Token이 없습니다.');
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
        console.log('토큰 갱신 응답:', data);

        if (data.code && data.code.includes('OK') && data.result) {
          await saveTokens(
            data.result.accessToken,
            data.result.refreshToken || refreshToken,
          );
          console.log('토큰 갱신 성공');
          return true;
        } else {
          console.log('토큰 갱신 응답 형식이 올바르지 않음:', data);
          return false;
        }
      } else {
        console.log('토큰 갱신 API 실패:', response.status);
        return false;
      }
    } catch (error) {
      console.error('토큰 갱신 중 오류:', error);
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
    console.error('사용자 정보 읽기 실패:', error);
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
    console.error('로그아웃 실패:', error);
    return false;
  }
};

export const debugAuthInfo = async (): Promise<void> => {
  const userInfo = await getUserInfo();
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  const tokenExpired = await isTokenExpired();

  console.log('=== Auth Debug Info ===');
  console.log('User Info:', userInfo);
  console.log(
    'Access Token:',
    accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
  );
  console.log(
    'Refresh Token:',
    refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null',
  );
  console.log('Token Expired:', tokenExpired);
  console.log('Is Logged In:', await isLoggedIn());
  console.log('=====================');
};
