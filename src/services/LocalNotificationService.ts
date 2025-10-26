import notifee, {
  TriggerType,
  TimestampTrigger,
  AndroidImportance,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationSettings {
  enabled: boolean;
  expiryDaysBefore: number;
  notificationTime: string; // "09:00" 형식
}

class LocalNotificationService {
  private channelId = 'expiry-alerts';

  /**
   * 로컬 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    try {
      console.log('📱 로컬 알림 권한 요청...');
      const settings = await notifee.requestPermission();

      const granted = settings.authorizationStatus >= 1; // AUTHORIZED or PROVISIONAL

      if (granted) {
        console.log('✅ 로컬 알림 권한 허용됨');
        await this.createNotificationChannel();
      } else {
        console.log('❌ 로컬 알림 권한 거부됨');
      }

      return granted;
    } catch (error) {
      console.error('❌ 로컬 알림 권한 요청 실패:', error);
      return false;
    }
  }

  /**
   * 안드로이드 알림 채널 생성
   */
  private async createNotificationChannel(): Promise<void> {
    try {
      await notifee.createChannel({
        id: this.channelId,
        name: '소비기한 알림',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
      console.log('✅ 알림 채널 생성 완료');
    } catch (error) {
      console.error('❌ 알림 채널 생성 실패:', error);
    }
  }

  /**
   * 알림 설정 저장
   */
  async saveNotificationSettings(
    settings: NotificationSettings,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'local_notification_settings',
        JSON.stringify(settings),
      );
      console.log('💾 로컬 알림 설정 저장 완료');
    } catch (error) {
      console.error('❌ 로컬 알림 설정 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 알림 설정 불러오기
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settingsStr = await AsyncStorage.getItem(
        'local_notification_settings',
      );
      if (settingsStr) {
        return JSON.parse(settingsStr);
      }
    } catch (error) {
      console.error('❌ 로컬 알림 설정 불러오기 실패:', error);
    }

    // 기본값
    return {
      enabled: true,
      expiryDaysBefore: 3,
      notificationTime: '09:00',
    };
  }

  /**
   * 알림 상태 확인
   */
  async checkNotificationStatus(): Promise<{
    hasPermission: boolean;
    isEnabled: boolean;
  }> {
    try {
      const permissionSettings = await notifee.getNotificationSettings();
      const hasPermission = permissionSettings.authorizationStatus >= 1;

      const settings = await this.getNotificationSettings();

      return {
        hasPermission,
        isEnabled: settings.enabled,
      };
    } catch (error) {
      console.error('❌ 로컬 알림 상태 확인 실패:', error);
      return { hasPermission: false, isEnabled: false };
    }
  }

  /**
   * 테스트 알림 전송
   */
  async sendTestNotification(): Promise<void> {
    try {
      console.log('🧪 로컬 테스트 알림 전송...');

      await notifee.displayNotification({
        title: '🧪 테스트 알림',
        body: '로컬 알림이 정상적으로 작동합니다!',
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      });

      console.log('✅ 로컬 테스트 알림 전송 완료');
    } catch (error) {
      console.error('❌ 로컬 테스트 알림 전송 실패:', error);
      throw error;
    }
  }

  /**
   * 데모 알림 생성 (개발용)
   */
  async createDemoNotifications(): Promise<void> {
    try {
      console.log('🎬 데모 알림 생성 시작...');

      const demoIngredients = [
        {
          name: '우유',
          expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          name: '계란',
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        {
          name: '두부',
          expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
      ];

      for (const ingredient of demoIngredients) {
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: ingredient.expiryDate.getTime() - 60 * 1000, // 1분 후 (테스트용)
        };

        await notifee.createTriggerNotification(
          {
            title: '🍽️ 소비기한 임박!',
            body: `${ingredient.name}의 소비기한이 곧 만료됩니다.`,
            android: {
              channelId: this.channelId,
            },
          },
          trigger,
        );
      }

      console.log('✅ 데모 알림 생성 완료');
    } catch (error) {
      console.error('❌ 데모 알림 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 예약된 알림 목록 가져오기
   */
  async getScheduledNotifications(): Promise<any[]> {
    try {
      const notifications = await notifee.getTriggerNotifications();
      console.log('📋 예약된 알림 개수:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('❌ 예약된 알림 조회 실패:', error);
      return [];
    }
  }

  /**
   * 식재료 알림 스케줄링
   */
  async scheduleIngredientsNotifications(ingredients: any[]): Promise<void> {
    try {
      console.log('📅 식재료 알림 스케줄링:', ingredients.length + '개');

      const settings = await this.getNotificationSettings();

      if (!settings.enabled) {
        console.log('⚠️ 알림이 비활성화되어 있습니다');
        return;
      }

      // 기존 알림 모두 취소
      await this.cancelAllNotifications();

      // 각 식재료에 대해 알림 생성
      for (const ingredient of ingredients) {
        if (!ingredient.expiryDate) continue;

        const expiryDate = new Date(ingredient.expiryDate);
        const notificationDate = new Date(expiryDate);
        notificationDate.setDate(
          notificationDate.getDate() - settings.expiryDaysBefore,
        );

        // 알림 시간 설정
        const [hours, minutes] = settings.notificationTime
          .split(':')
          .map(Number);
        notificationDate.setHours(hours, minutes, 0, 0);

        // 과거 시간이면 스킵
        if (notificationDate.getTime() <= Date.now()) {
          console.log('⏭️ 과거 알림 스킵:', ingredient.name);
          continue;
        }

        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: notificationDate.getTime(),
        };

        await notifee.createTriggerNotification(
          {
            id: `ingredient-${ingredient.id}`,
            title: '🍽️ 소비기한 임박!',
            body: `${ingredient.name}의 소비기한이 ${settings.expiryDaysBefore}일 남았습니다.`,
            android: {
              channelId: this.channelId,
              importance: AndroidImportance.HIGH,
            },
            ios: {
              sound: 'default',
            },
          },
          trigger,
        );

        console.log(
          `✅ 알림 예약: ${
            ingredient.name
          } - ${notificationDate.toLocaleString()}`,
        );
      }
    } catch (error) {
      console.error('❌ 식재료 알림 스케줄링 실패:', error);
      throw error;
    }
  }

  /**
   * 모든 알림 취소
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('✅ 모든 알림 취소 완료');
    } catch (error) {
      console.error('❌ 알림 취소 실패:', error);
      throw error;
    }
  }
}

export default new LocalNotificationService();
