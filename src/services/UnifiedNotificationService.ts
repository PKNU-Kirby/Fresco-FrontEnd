// services/UnifiedNotificationService.ts
import NotificationService from './NotificationService';
import LocalNotificationService from './LocalNotificationService';
import { NotificationSettings } from './LocalNotificationService';

class UnifiedNotificationService {
  // 초기 설정 (앱 시작 시 호출)
  async initialize(): Promise<void> {
    console.log('🔔 통합 알림 서비스 초기화 시작');

    // 1. FCM 설정
    const fcmPermission = await NotificationService.requestPermission();
    console.log('📱 FCM 권한:', fcmPermission ? '허용' : '거부');

    // 2. 로컬 알림 설정 (이미 constructor에서 configure 호출됨)
    const localPermission = await LocalNotificationService.requestPermission();
    console.log('📍 로컬 알림 권한:', localPermission ? '허용' : '거부');

    console.log('✅ 통합 알림 서비스 초기화 완료');
  }

  // 알림 권한 요청 (통합)
  async requestPermission(): Promise<boolean> {
    const fcmGranted = await NotificationService.requestPermission();
    const localGranted = await LocalNotificationService.requestPermission();

    return fcmGranted && localGranted;
  }

  // 알림 설정 저장 (양쪽 모두에 저장)
  async saveNotificationSettings(
    settings: NotificationSettings,
  ): Promise<void> {
    try {
      // 1. FCM 설정 저장 (서버로 전송)
      await NotificationService.saveNotificationSettings(settings);

      // 2. 로컬 알림 설정 저장
      await LocalNotificationService.saveNotificationSettings(settings);

      console.log('✅ 통합 알림 설정 저장 완료:', settings);
    } catch (error) {
      console.error('❌ 통합 알림 설정 저장 실패:', error);
      throw error;
    }
  }

  // 알림 설정 불러오기
  async getNotificationSettings(): Promise<NotificationSettings> {
    // 로컬 설정을 기준으로 사용 (FCM과 동기화됨)
    return LocalNotificationService.getNotificationSettings();
  }

  // 알림 상태 확인 (통합)
  async checkNotificationStatus(): Promise<{
    hasPermission: boolean;
    isEnabled: boolean;
    fcmStatus: { hasPermission: boolean; isEnabled: boolean };
    localStatus: { hasPermission: boolean; isEnabled: boolean };
  }> {
    const fcmStatus = await NotificationService.checkNotificationStatus();
    const localStatus =
      await LocalNotificationService.checkNotificationStatus();

    return {
      hasPermission: fcmStatus.hasPermission && localStatus.hasPermission,
      isEnabled: fcmStatus.isEnabled && localStatus.isEnabled,
      fcmStatus,
      localStatus,
    };
  }

  // 소비기한 알림 스케줄링 (로컬 알림 사용)
  async scheduleExpiryNotification(
    foodName: string,
    expiryDate: Date,
  ): Promise<void> {
    const settings = await this.getNotificationSettings();

    if (!settings.enabled) {
      console.log('⚠️ 알림이 비활성화되어 있습니다.');
      return;
    }

    await LocalNotificationService.scheduleExpiryNotification(
      foodName,
      expiryDate,
      settings.expiryDaysBefore,
    );
  }

  // 여러 식재료 일괄 스케줄링
  async scheduleMultipleNotifications(
    foods: Array<{ name: string; expiryDate: Date }>,
  ): Promise<void> {
    await LocalNotificationService.scheduleMultipleNotifications(foods);
  }

  // 모든 로컬 알림 취소
  cancelAllLocalNotifications(): void {
    LocalNotificationService.cancelAllNotifications();
  }

  // 특정 알림 취소
  cancelNotification(notificationId: string): void {
    LocalNotificationService.cancelNotification(notificationId);
  }

  // 스케줄된 알림 목록 확인
  async getScheduledNotifications(): Promise<any[]> {
    return LocalNotificationService.getScheduledNotifications();
  }

  // 테스트 알림 (FCM + 로컬)
  async sendTestNotifications(): Promise<void> {
    console.log('🧪 테스트 알림 전송 시작');

    // 1. FCM 테스트
    await NotificationService.printTokenForTesting();

    // 2. 로컬 알림 테스트
    await LocalNotificationService.sendTestNotification();

    console.log('✅ 테스트 알림 전송 완료');
  }

  // FCM 토큰 출력 (디버깅용)
  async printFCMToken(): Promise<void> {
    await NotificationService.printTokenForTesting();
  }

  // 데모 알림 생성 (개발용)
  async createDemoNotifications(): Promise<void> {
    await LocalNotificationService.createDemoNotifications();
  }
}

export default new UnifiedNotificationService();
