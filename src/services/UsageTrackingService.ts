import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageService } from '../services/AsyncStorageService';
import {
  UsageHistoryAPI,
  HistoryRecord,
} from '../services/API/usageHistoryAPI';

export interface UsageRecord {
  id: number;
  userId: number;
  consumerName: string;
  userAvatar: string;
  itemName: string;
  usedQuantity: number;
  unit: string;
  fridgeId: number;
  usageType: 'consume' | 'modify' | 'delete' | 'recipe_use';
  usedAt: string;
  time: string;
  details?: string;
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
        id: Date.now(),
        usedAt: now.toISOString(),
        time: timeString,
      };

      const existingRecords = await this.getUsageRecords();
      existingRecords.unshift(newRecord);

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

  // 특정 냉장고의 사용 기록 (서버에서 가져오기)
  static async getFridgeUsageRecords(
    fridgeId: number,
    options?: {
      page?: number;
      size?: number;
    },
  ): Promise<UsageRecord[]> {
    try {
      console.log(`📡 냉장고 ${fridgeId}의 사용 기록 서버 조회 시작...`);

      // 옵션이 있으면 페이지네이션, 없으면 전체 조회
      const records = options
        ? await UsageHistoryAPI.getUsageHistory(fridgeId, options).then(
            response => response.content,
          )
        : await UsageHistoryAPI.getAllUsageHistory(fridgeId);

      console.log(`✅ 서버에서 ${records.length}개의 기록 조회 완료`);

      return records.map((item: HistoryRecord, index: number) => {
        return {
          id: new Date(item.usedAt).getTime() + index,
          userId: item.consumerId,
          consumerName: item.consumerName || '알 수 없음',
          userAvatar: item.consumerName ? item.consumerName.charAt(0) : '👤',
          itemName: item.ingredientName,
          usedQuantity: item.usedQuantity,
          unit: item.unit || '',
          fridgeId: fridgeId,
          usageType: 'consume' as const,
          usedAt: item.usedAt,
          time: UsageHistoryAPI.formatTime(item.usedAt),
        };
      });
    } catch (error) {
      console.error('❌ 서버 사용 기록 조회 실패:', error);
      return [];
    }
  }

  // 페이지네이션을 사용한 사용 기록 조회
  static async getFridgeUsageRecordsPaginated(
    fridgeId: number,
    page: number = 0,
    size: number = 20,
  ): Promise<{
    records: UsageRecord[];
    hasMore: boolean;
    totalPages: number;
    totalElements: number;
  }> {
    try {
      console.log(
        `📡 냉장고 ${fridgeId}의 사용 기록 조회 (page: ${page}, size: ${size})`,
      );

      const response = await UsageHistoryAPI.getUsageHistory(fridgeId, {
        page,
        size,
      });

      const records = response.content.map(
        (item: HistoryRecord, index: number) => ({
          id: new Date(item.usedAt).getTime() + index,
          userId: item.consumerId,
          consumerName: item.consumerName || '알 수 없음',
          userAvatar: item.consumerName ? item.consumerName.charAt(0) : '👤',
          itemName: item.ingredientName,
          usedQuantity: item.usedQuantity,
          unit: item.unit || '',
          fridgeId: fridgeId,
          usageType: 'consume' as const,
          usedAt: item.usedAt,
          time: UsageHistoryAPI.formatTime(item.usedAt),
        }),
      );

      return {
        records,
        hasMore: response.pageInfo.hasNext,
        totalPages: response.pageInfo.totalPages,
        totalElements: response.pageInfo.totalElements,
      };
    } catch (error) {
      console.error('❌ 페이지네이션 사용 기록 조회 실패:', error);
      return {
        records: [],
        hasMore: false,
        totalPages: 0,
        totalElements: 0,
      };
    }
  }

  // 현재 사용자 정보 가져오기
  static async getCurrentUserInfo(): Promise<{
    id: number;
    name: string;
    avatar: string;
  } | null> {
    try {
      const userId = Number(await AsyncStorageService.getCurrentUserId());
      if (!userId) return null;

      const user = await AsyncStorageService.getUserById(userId);
      if (!user) return null;

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
    itemId: number,
    itemName: string,
    consumerName: string,
    usedQuantity: number,
    unit: string,
    fridgeId: number,
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
      userAvatar: userInfo.avatar,
      consumerName,
      itemName,
      usedQuantity,
      unit,
      fridgeId,
      usageType: 'consume',
      details,
    });
  }

  static async trackItemModification(
    itemId: number,
    itemName: string,
    consumerName: string,
    usedQuantity: number,
    unit: string,
    fridgeId: number,
    details?: string,
  ): Promise<void> {
    const userInfo = await this.getCurrentUserInfo();
    if (!userInfo) return;

    await this.addUsageRecord({
      userId: userInfo.id,
      userAvatar: userInfo.avatar,
      consumerName,
      itemName,
      usedQuantity,
      unit,
      fridgeId,
      usageType: 'modify',
      details,
    });
  }

  static async trackItemDeletion(
    itemId: number,
    itemName: string,
    consumerName: string,
    usedQuantity: number,
    unit: string,
    fridgeId: number,
    details?: string,
  ): Promise<void> {
    const userInfo = await this.getCurrentUserInfo();
    if (!userInfo) return;

    await this.addUsageRecord({
      userId: userInfo.id,
      userAvatar: userInfo.avatar,
      consumerName,
      itemName,
      usedQuantity,
      unit,
      fridgeId,
      usageType: 'delete',
      details,
    });
  }

  static async trackRecipeUsage(
    itemId: number,
    itemName: string,
    consumerName: string,
    usedQuantity: number,
    unit: string,
    fridgeId: number,
    recipeName: string,
  ): Promise<void> {
    const userInfo = await this.getCurrentUserInfo();
    if (!userInfo) return;

    await this.addUsageRecord({
      userId: userInfo.id,
      userAvatar: userInfo.avatar,
      consumerName,
      itemName,
      usedQuantity,
      unit,
      fridgeId,
      usageType: 'recipe_use',
      details: `레시피: ${recipeName}`,
    });
  }

  // 사용 기록 정리 (오래된 기록 삭제)
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
