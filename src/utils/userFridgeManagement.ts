// utils/userFridgeManagement.ts - 수정된 버전
import AsyncStorage from '@react-native-async-storage/async-storage';

// 냉장고 인터페이스
interface Refrigerator {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
}

// ERD 구조에 맞는 냉장고-사용자 관계
interface RefrigeratorUser {
  냉장고_사용자_id: number;
  냉장고Id: number;
  초대한_사람_id: number;
  초대받은_사람_id: number;
  생성_시간: string;
  변경_시간: string;
  상태?: 'active' | 'left'; // 추가 상태 필드
}

// 사용자 정보
interface User {
  id: number;
  name: string;
  email?: string;
  profileImage?: string;
}

// Storage Keys - 일관된 키 사용
const REFRIGERATORS_KEY = '@refrigerators';
const REFRIGERATOR_USERS_KEY = '@refrigerator_users';
const CURRENT_USER_KEY = '@current_user';
const USER_PROFILES_KEY = '@user_profiles';

export class UserFridgeManager {
  // === 사용자 관리 ===
  static async getCurrentUser(): Promise<User | null> {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // 기본 사용자 생성 (최초 실행 시)
      const defaultUser: User = {
        id: 1,
        name: '황유진',
        email: 'user@example.com',
      };

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
      await this.addUserProfile(defaultUser);
      return defaultUser;
    } catch (error) {
      console.error('현재 사용자 조회 실패:', error);
      return null;
    }
  }

  static async addUserProfile(user: User): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(USER_PROFILES_KEY);
      const profiles: User[] = stored ? JSON.parse(stored) : [];

      const existingIndex = profiles.findIndex(p => p.id === user.id);
      if (existingIndex >= 0) {
        profiles[existingIndex] = user;
      } else {
        profiles.push(user);
      }

      await AsyncStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('사용자 프로필 추가 실패:', error);
      throw error;
    }
  }

  static async getUserProfile(userId: number): Promise<User | null> {
    try {
      const stored = await AsyncStorage.getItem(USER_PROFILES_KEY);
      const profiles: User[] = stored ? JSON.parse(stored) : [];
      return profiles.find(p => p.id === userId) || null;
    } catch (error) {
      console.error('사용자 프로필 조회 실패:', error);
      return null;
    }
  }

  // === 냉장고 관리 ===
  static async createFridge(
    name: string,
    description?: string,
  ): Promise<Refrigerator> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('현재 사용자를 찾을 수 없습니다.');
      }

      console.log('냉장고 생성 시작:', {
        name,
        description,
        userId: currentUser.id,
      });

      // 기존 냉장고 목록 조회
      const stored = await AsyncStorage.getItem(REFRIGERATORS_KEY);
      const fridges: Refrigerator[] = stored ? JSON.parse(stored) : [];

      // 새 냉장고 ID 생성
      const maxId =
        fridges.length > 0 ? Math.max(...fridges.map(f => f.id)) : 0;
      const newId = maxId + 1;

      // 초대 코드 생성 (6자리 랜덤)
      const inviteCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const newFridge: Refrigerator = {
        id: newId,
        name,
        description,
        ownerId: currentUser.id,
        inviteCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memberCount: 1,
      };

      // 냉장고 저장
      fridges.push(newFridge);
      await AsyncStorage.setItem(REFRIGERATORS_KEY, JSON.stringify(fridges));

      // 소유자 관계 생성
      await this.addRefrigeratorUser(currentUser.id, newId, currentUser.id);

      console.log(
        `새 냉장고 생성 완료: ${name} (ID: ${newId}, 코드: ${inviteCode})`,
      );
      return newFridge;
    } catch (error) {
      console.error('냉장고 생성 실패:', error);
      throw error;
    }
  }

  // === 냉장고-사용자 관계 관리 (ERD 구조) ===
  static async addRefrigeratorUser(
    invitedUserId: number,
    fridgeId: number,
    inviterUserId: number,
  ): Promise<void> {
    try {
      console.log('refrigeratorUsers 관계 추가:', {
        invitedUserId,
        fridgeId,
        inviterUserId,
      });

      const stored = await AsyncStorage.getItem(REFRIGERATOR_USERS_KEY);
      const relations: RefrigeratorUser[] = stored ? JSON.parse(stored) : [];

      // 새 관계 ID 생성
      const maxId =
        relations.length > 0
          ? Math.max(...relations.map(r => r.냉장고_사용자_id))
          : 0;
      const newId = maxId + 1;

      const newRelation: RefrigeratorUser = {
        냉장고_사용자_id: newId,
        냉장고Id: fridgeId,
        초대한_사람_id: inviterUserId,
        초대받은_사람_id: invitedUserId,
        생성_시간: new Date().toISOString(),
        변경_시간: new Date().toISOString(),
        상태: 'active',
      };

      relations.push(newRelation);
      await AsyncStorage.setItem(
        REFRIGERATOR_USERS_KEY,
        JSON.stringify(relations),
      );

      console.log('refrigeratorUsers 관계 추가 완료:', newRelation);

      // 냉장고 멤버 수 업데이트
      await this.updateFridgeMemberCount(fridgeId);
    } catch (error) {
      console.error('refrigeratorUsers 관계 추가 실패:', error);
      throw error;
    }
  }

  static async getFridgeByInviteCode(
    inviteCode: string,
  ): Promise<Refrigerator | null> {
    try {
      const stored = await AsyncStorage.getItem(REFRIGERATORS_KEY);
      const fridges: Refrigerator[] = stored ? JSON.parse(stored) : [];
      return fridges.find(f => f.inviteCode === inviteCode) || null;
    } catch (error) {
      console.error('초대 코드로 냉장고 조회 실패:', error);
      return null;
    }
  }

  static async joinFridge(
    inviteCode: string,
  ): Promise<{ success: boolean; message: string; fridge?: Refrigerator }> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return { success: false, message: '현재 사용자를 찾을 수 없습니다.' };
      }

      // 초대 코드로 냉장고 찾기
      const fridge = await this.getFridgeByInviteCode(inviteCode);
      if (!fridge) {
        return { success: false, message: '유효하지 않은 초대 코드입니다.' };
      }

      // 이미 참여 중인지 확인
      const existingRelation = await this.getRefrigeratorUserRelation(
        currentUser.id,
        fridge.id,
      );
      if (existingRelation) {
        if (existingRelation.상태 === 'active') {
          return { success: false, message: '이미 참여 중인 냉장고입니다.' };
        } else if (existingRelation.상태 === 'left') {
          // 이전에 나간 냉장고라면 다시 참여
          existingRelation.상태 = 'active';
          existingRelation.변경_시간 = new Date().toISOString();
          await this.updateRefrigeratorUserRelation(existingRelation);
          await this.updateFridgeMemberCount(fridge.id);

          return {
            success: true,
            message: '냉장고에 다시 참여했습니다.',
            fridge,
          };
        }
      }

      // 새로운 관계 생성
      await this.addRefrigeratorUser(currentUser.id, fridge.id, fridge.ownerId);

      console.log(`냉장고 참여: ${fridge.name} (사용자: ${currentUser.name})`);
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

  static async leaveFridge(
    fridgeId: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return { success: false, message: '현재 사용자를 찾을 수 없습니다.' };
      }

      const relation = await this.getRefrigeratorUserRelation(
        currentUser.id,
        fridgeId,
      );
      if (!relation) {
        return { success: false, message: '참여하지 않은 냉장고입니다.' };
      }

      // 소유자인지 확인
      const fridge = await this.getFridgeById(fridgeId);
      if (fridge && fridge.ownerId === currentUser.id) {
        return {
          success: false,
          message:
            '냉장고 소유자는 나갈 수 없습니다. 냉장고를 삭제하거나 소유권을 이전해주세요.',
        };
      }

      // 관계 상태를 'left'로 변경
      relation.상태 = 'left';
      relation.변경_시간 = new Date().toISOString();
      await this.updateRefrigeratorUserRelation(relation);

      // 멤버 수 업데이트
      await this.updateFridgeMemberCount(fridgeId);

      return { success: true, message: '냉장고에서 나갔습니다.' };
    } catch (error) {
      console.error('냉장고 나가기 실패:', error);
      return {
        success: false,
        message: '냉장고 나가기 중 오류가 발생했습니다.',
      };
    }
  }

  // 냉장고-사용자 관계 조회
  static async getRefrigeratorUserRelation(
    userId: number,
    fridgeId: number,
  ): Promise<RefrigeratorUser | null> {
    try {
      const stored = await AsyncStorage.getItem(REFRIGERATOR_USERS_KEY);
      const relations: RefrigeratorUser[] = stored ? JSON.parse(stored) : [];

      return (
        relations.find(
          r => r.초대받은_사람_id === userId && r.냉장고Id === fridgeId,
        ) || null
      );
    } catch (error) {
      console.error('냉장고-사용자 관계 조회 실패:', error);
      return null;
    }
  }

  // 냉장고-사용자 관계 업데이트
  static async updateRefrigeratorUserRelation(
    updatedRelation: RefrigeratorUser,
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(REFRIGERATOR_USERS_KEY);
      const relations: RefrigeratorUser[] = stored ? JSON.parse(stored) : [];

      const index = relations.findIndex(
        r => r.냉장고_사용자_id === updatedRelation.냉장고_사용자_id,
      );

      if (index >= 0) {
        relations[index] = updatedRelation;
        await AsyncStorage.setItem(
          REFRIGERATOR_USERS_KEY,
          JSON.stringify(relations),
        );
      }
    } catch (error) {
      console.error('냉장고-사용자 관계 업데이트 실패:', error);
      throw error;
    }
  }

  static async getFridgeById(fridgeId: number): Promise<Refrigerator | null> {
    try {
      const stored = await AsyncStorage.getItem(REFRIGERATORS_KEY);
      const fridges: Refrigerator[] = stored ? JSON.parse(stored) : [];
      return fridges.find(f => f.id === fridgeId) || null;
    } catch (error) {
      console.error('냉장고 조회 실패:', error);
      return null;
    }
  }

  static async getUserFridges(
    userId: number,
  ): Promise<
    Array<{ fridge: Refrigerator; role: 'owner' | 'member'; joinedAt: string }>
  > {
    try {
      console.log(`getUserFridges 호출: userId = ${userId}`);

      // 1. 냉장고-사용자 관계 조회
      const stored = await AsyncStorage.getItem(REFRIGERATOR_USERS_KEY);
      const relations: RefrigeratorUser[] = stored ? JSON.parse(stored) : [];
      console.log('모든 refrigeratorUsers 관계:', relations);

      // 활성 상태이고 초대받은_사람_id가 현재 사용자인 관계들 찾기
      const userRelations = relations.filter(
        r => r.초대받은_사람_id === userId && (r.상태 === 'active' || !r.상태), // 상태가 없으면 기본값 active
      );
      console.log(`사용자 ${userId}의 활성 관계:`, userRelations);

      if (userRelations.length === 0) {
        console.log('사용자의 활성 관계가 없습니다.');
        return [];
      }

      // 2. 냉장고 정보 조회
      const fridgeStored = await AsyncStorage.getItem(REFRIGERATORS_KEY);
      const fridges: Refrigerator[] = fridgeStored
        ? JSON.parse(fridgeStored)
        : [];
      console.log('모든 냉장고:', fridges);

      // 3. 사용자 냉장고 목록 구성
      const userFridges = userRelations
        .map(relation => {
          const fridge = fridges.find(f => f.id === relation.냉장고Id);
          if (!fridge) {
            console.log(`냉장고 ${relation.냉장고Id}를 찾을 수 없습니다.`);
            return null;
          }

          // 소유자인지 확인 (냉장고의 ownerId와 사용자 ID가 같으면 소유자)
          const role: 'owner' | 'member' =
            fridge.ownerId === userId ? 'owner' : 'member';

          return {
            fridge,
            role,
            joinedAt: relation.생성_시간,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => {
          // 소유자 우선, 그 다음 참여일 순
          if (a.role === 'owner' && b.role === 'member') return -1;
          if (a.role === 'member' && b.role === 'owner') return 1;
          return (
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
          );
        });

      console.log(
        `사용자 ${userId}의 최종 냉장고 ${userFridges.length}개:`,
        userFridges,
      );
      return userFridges;
    } catch (error) {
      console.error('사용자 냉장고 목록 조회 실패:', error);
      return [];
    }
  }

  // === 헬퍼 함수들 ===
  static async updateFridgeMemberCount(fridgeId: number): Promise<void> {
    try {
      // 활성 멤버 수 계산
      const stored = await AsyncStorage.getItem(REFRIGERATOR_USERS_KEY);
      const relations: RefrigeratorUser[] = stored ? JSON.parse(stored) : [];

      const activeMemberCount = relations.filter(
        r => r.냉장고Id === fridgeId && (r.상태 === 'active' || !r.상태),
      ).length;

      // 냉장고 정보 업데이트
      const fridgeStored = await AsyncStorage.getItem(REFRIGERATORS_KEY);
      const fridges: Refrigerator[] = fridgeStored
        ? JSON.parse(fridgeStored)
        : [];

      const fridgeIndex = fridges.findIndex(f => f.id === fridgeId);
      if (fridgeIndex >= 0) {
        fridges[fridgeIndex].memberCount = activeMemberCount;
        fridges[fridgeIndex].updatedAt = new Date().toISOString();
        await AsyncStorage.setItem(REFRIGERATORS_KEY, JSON.stringify(fridges));
      }
    } catch (error) {
      console.error('냉장고 멤버 수 업데이트 실패:', error);
    }
  }

  // 전체 데이터 초기화 (개발/테스트용)
  static async resetAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        REFRIGERATORS_KEY,
        REFRIGERATOR_USERS_KEY,
        USER_PROFILES_KEY,
      ]);
      console.log('모든 냉장고 데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('데이터 초기화 실패:', error);
      throw error;
    }
  }
}
