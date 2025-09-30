import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageService } from '../services/AsyncStorageService';
import {
  UsageHistoryAPI,
  HistoryRecord,
} from '../services/API/usageHistoryAPI';

export interface UsageRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  itemId: string;
  itemName: string;
  quantity: string;
  unit: string;
  fridgeId: string;
  usageType: 'consume' | 'modify' | 'delete' | 'recipe_use'; // 사용 유형
  usedAt: string; // ISO string
  time: string; // "오후 2:30"
  details?: string; // 추가 정보 (예: 레시피 이름)
}

const USAGE_RECORDS_KEY = 'usage_records';

export class UsageTrackingService {
  // 사용 기록 추가
  static async addUsageRecord(
    record: Omit<UsageRecord, 'id' | 'time' | 'usedAt'>,
  ): Promise<void> {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const newRecord: UsageRecord = {
        ...record,
        id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        usedAt: now.toISOString(),
        time: timeString,
      };

      const existingRecords = await this.getUsageRecords();
      existingRecords.unshift(newRecord); // 최신 기록을 앞에 추가

      await AsyncStorage.setItem(
        USAGE_RECORDS_KEY,
        JSON.stringify(existingRecords),
      );
      console.log('사용 기록 추가됨:', newRecord);
    } catch (error) {
      console.error('사용 기록 추가 실패:', error);
    }
  }

  // 모든 사용 기록 조회
  static async getUsageRecords(): Promise<UsageRecord[]> {
    try {
      const stored = await AsyncStorage.getItem(USAGE_RECORDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('사용 기록 조회 실패:', error);
      return [];
    }
  }

  // 특정 냉장고의 사용 기록 조회
  static async getFridgeUsageRecords(fridgeId: string): Promise<UsageRecord[]> {
    try {
      const records = await UsageHistoryAPI.getAllUsageHistory(fridgeId);

      return records.map((item: HistoryRecord) => ({
        id: item.refrigeratorIngredientId.toString(),
        userId: item.consumerId.toString(),
        userName: item.consumerName,
        userAvatar: item.consumerName.charAt(0),
        itemId: item.refrigeratorIngredientId.toString(),
        itemName: item.ingredientName,
        quantity: item.usedQuantity.toString(),
        unit: item.unit,
        fridgeId: fridgeId,
        usageType: 'consume',
        usedAt: item.usedAt,
        time: UsageHistoryAPI.formatTime(item.usedAt), // ← 이렇게
      }));
    } catch (error) {
      console.error('서버 사용 기록 조회 실패:', error);
      return [];
    }
  }
  // 특정 사용자의 사용 기록 조회
  static async getUserUsageRecords(userId: string): Promise<UsageRecord[]> {
    try {
      const allRecords = await this.getUsageRecords();
      return allRecords.filter(record => record.userId === userId);
    } catch (error) {
      console.error('사용자별 사용 기록 조회 실패:', error);
      return [];
    }
  }

  // 현재 사용자 정보 가져오기
  static async getCurrentUserInfo(): Promise<{
    id: string;
    name: string;
    avatar: string;
  } | null> {
    try {
      const userId = await AsyncStorageService.getCurrentUserId();
      if (!userId) return null;

      const user = await AsyncStorageService.getUserById(userId);
      if (!user) return null;

      // 사용자 아바타는 이름 첫 글자나 이모지로 설정
      const avatar = user.name ? user.name.charAt(0) : '👤';

      return {
        id: user.id,
        name: user.name,
        avatar: avatar,
      };
    } catch (error) {
      console.error('현재 사용자 정보 조회 실패:', error);
      return null;
    }
  }

  // 편의 함수들
  static async trackItemConsumption(
    itemId: string,
    itemName: string,
    quantity: string,
    unit: string,
    fridgeId: string,
    details?: string,
  ): Promise<void> {
    const userInfo = await this.getCurrentUserInfo();
    if (!userInfo) {
      console.error(
        '사용자 정보를 찾을 수 없어 사용 기록을 저장할 수 없습니다.',
      );
      return;
    }

    await this.addUsageRecord({
      userId: userInfo.id,
      userName: userInfo.name,
      userAvatar: userInfo.avatar,
      itemId,
      itemName,
      quantity,
      unit,
      fridgeId,
      usageType: 'consume',
      details,
    });
  }

  static async trackItemModification(
    itemId: string,
    itemName: string,
    quantity: string,
    unit: string,
    fridgeId: string,
    details?: string,
  ): Promise<void> {
    const userInfo = await this.getCurrentUserInfo();
    if (!userInfo) return;

    await this.addUsageRecord({
      userId: userInfo.id,
      userName: userInfo.name,
      userAvatar: userInfo.avatar,
      itemId,
      itemName,
      quantity,
      unit,
      fridgeId,
      usageType: 'modify',
      details,
    });
  }

  static async trackItemDeletion(
    itemId: string,
    itemName: string,
    quantity: string,
    unit: string,
    fridgeId: string,
    details?: string,
  ): Promise<void> {
    const userInfo = await this.getCurrentUserInfo();
    if (!userInfo) return;

    await this.addUsageRecord({
      userId: userInfo.id,
      userName: userInfo.name,
      userAvatar: userInfo.avatar,
      itemId,
      itemName,
      quantity,
      unit,
      fridgeId,
      usageType: 'delete',
      details,
    });
  }

  static async trackRecipeUsage(
    itemId: string,
    itemName: string,
    quantity: string,
    unit: string,
    fridgeId: string,
    recipeName: string,
  ): Promise<void> {
    const userInfo = await this.getCurrentUserInfo();
    if (!userInfo) return;

    await this.addUsageRecord({
      userId: userInfo.id,
      userName: userInfo.name,
      userAvatar: userInfo.avatar,
      itemId,
      itemName,
      quantity,
      unit,
      fridgeId,
      usageType: 'recipe_use',
      details: `레시피: ${recipeName}`,
    });
  }

  // 사용 기록 정리 (오래된 기록 삭제 - 선택사항)
  static async cleanOldRecords(daysToKeep: number = 90): Promise<void> {
    try {
      const allRecords = await this.getUsageRecords();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const filteredRecords = allRecords.filter(
        record => new Date(record.usedAt) > cutoffDate,
      );

      await AsyncStorage.setItem(
        USAGE_RECORDS_KEY,
        JSON.stringify(filteredRecords),
      );
      console.log(
        `${
          allRecords.length - filteredRecords.length
        }개의 오래된 사용 기록이 삭제되었습니다.`,
      );
    } catch (error) {
      console.error('사용 기록 정리 실패:', error);
    }
  }
}
