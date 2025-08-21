// services/LocalNotificationService.ts
import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationSettings {
  enabled: boolean;
  expiryDaysBefore: number;
  notificationTime: string; // "HH:MM" 형식
}

class LocalNotificationService {
  constructor() {
    this.configure();
  }

  // 로컬 알림 설정
  configure() {
    PushNotification.configure({
      // (선택) 알림 클릭 시 실행될 함수
      onNotification: function (notification) {
        console.log('로컬 알림 클릭:', notification);
      },

      // iOS에서 권한 요청
      requestPermissions: Platform.OS === 'ios',
    });

    // Android용 채널 생성
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'food-expiry-channel',
          channelName: '소비기한 알림',
          channelDescription: '식재료 소비기한 임박 알림',
          importance: Importance.HIGH,
          vibrate: true,
        },
        created => console.log(`알림 채널 생성: ${created}`),
      );
    }
  }

  // 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    return new Promise(resolve => {
      PushNotification.requestPermissions(permissions => {
        const granted =
          permissions.alert || permissions.badge || permissions.sound;
        console.log('로컬 알림 권한:', granted);
        resolve(granted);
      });
    });
  }

  // 즉시 테스트 알림 보내기
  async sendTestNotification(): Promise<void> {
    PushNotification.localNotification({
      channelId: 'food-expiry-channel', // Android용
      title: '테스트 알림 🍎',
      message: '로컬 알림이 정상적으로 작동합니다!',
      playSound: true,
      soundName: 'default',
      badge: 1, // iOS용
    });
  }

  // 소비기한 알림 스케줄링
  async scheduleExpiryNotification(
    foodName: string,
    expiryDate: Date,
    daysBefore: number = 3,
  ): Promise<void> {
    const settings = await this.getNotificationSettings();

    if (!settings.enabled) {
      console.log('알림이 비활성화되어 있습니다.');
      return;
    }

    // 알림 날짜 계산
    const notificationDate = new Date(expiryDate);
    notificationDate.setDate(notificationDate.getDate() - daysBefore);

    // 알림 시간 설정 (예: 09:00)
    const [hours, minutes] = settings.notificationTime.split(':').map(Number);
    notificationDate.setHours(hours, minutes, 0, 0);

    // 과거 날짜면 알림 안함
    if (notificationDate <= new Date()) {
      console.log('이미 지난 날짜입니다:', notificationDate);
      return;
    }

    const notificationId = `expiry_${foodName}_${Date.now()}`;

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'food-expiry-channel',
      title: `소비기한 임박! ⏰`,
      message: `${foodName}의 소비기한이 ${daysBefore}일 남았습니다.`,
      date: notificationDate,
      playSound: true,
      soundName: 'default',
      userInfo: {
        foodName,
        expiryDate: expiryDate.toISOString(),
        type: 'expiry_warning',
      },
    });

    console.log(`알림 스케줄됨: ${foodName} - ${notificationDate}`);
  }

  // 여러 식재료에 대한 일괄 스케줄링
  async scheduleMultipleNotifications(
    foods: Array<{
      name: string;
      expiryDate: Date;
    }>,
  ): Promise<void> {
    const settings = await this.getNotificationSettings();

    for (const food of foods) {
      await this.scheduleExpiryNotification(
        food.name,
        food.expiryDate,
        settings.expiryDaysBefore,
      );
    }
  }

  // 특정 알림 취소
  cancelNotification(notificationId: string): void {
    PushNotification.cancelLocalNotifications({ id: notificationId });
  }

  // 모든 알림 취소
  cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  // 스케줄된 알림 목록 확인
  async getScheduledNotifications(): Promise<any[]> {
    return new Promise(resolve => {
      PushNotification.getScheduledLocalNotifications(notifications => {
        console.log('스케줄된 알림들:', notifications);
        resolve(notifications);
      });
    });
  }

  // 알림 설정 저장
  async saveNotificationSettings(
    settings: NotificationSettings,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'notification_settings',
        JSON.stringify(settings),
      );
      console.log('알림 설정 저장됨:', settings);
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
    }
  }

  // 알림 설정 불러오기
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settingsStr = await AsyncStorage.getItem('notification_settings');
      if (settingsStr) {
        return JSON.parse(settingsStr);
      }
    } catch (error) {
      console.error('알림 설정 불러오기 실패:', error);
    }

    return {
      enabled: true,
      expiryDaysBefore: 3,
      notificationTime: '09:00',
    };
  }

  // 알림 상태 확인
  async checkNotificationStatus(): Promise<{
    hasPermission: boolean;
    isEnabled: boolean;
  }> {
    const settings = await this.getNotificationSettings();

    return new Promise(resolve => {
      PushNotification.checkPermissions(permissions => {
        const hasPermission =
          permissions.alert || permissions.badge || permissions.sound;
        resolve({
          hasPermission,
          isEnabled: settings.enabled,
        });
      });
    });
  }

  // 테스트용 함수들
  async printTokenForTesting(): Promise<void> {
    console.log('=== 로컬 알림 모드 ===');
    console.log('FCM 토큰 대신 로컬 알림을 사용합니다.');

    // 즉시 테스트 알림 발송
    await this.sendTestNotification();
  }

  // 데모용: 가상의 식재료들로 알림 테스트
  async createDemoNotifications(): Promise<void> {
    const demoFoods = [
      {
        name: '우유',
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      }, // 2일 후
      {
        name: '달걀',
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      }, // 4일 후
      {
        name: '요거트',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      }, // 1일 후
    ];

    console.log('데모 알림들을 스케줄링합니다...');
    await this.scheduleMultipleNotifications(demoFoods);

    // 스케줄된 알림 목록 출력
    setTimeout(async () => {
      await this.getScheduledNotifications();
    }, 1000);
  }
}

export default new LocalNotificationService();
