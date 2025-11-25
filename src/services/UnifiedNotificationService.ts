import NotificationService from './NotificationService';
import LocalNotificationService, {
  NotificationSettings,
} from './LocalNotificationService';

/**
 * 통합 알림 서비스
 * - FCM (원격 푸시 알림) + Local Notification (로컬 알림) 통합 관리
 */
class UnifiedNotificationService {
  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    try {
      console.log('📱 알림 권한 요청 시작...');

      // 1. FCM 권한 요청
      const fcmGranted = await NotificationService.requestPermission();

      // 2. 로컬 알림 권한 요청
      const localGranted = await LocalNotificationService.requestPermission();

      const granted = fcmGranted && localGranted;

      if (granted) {
        console.log('✅ 모든 알림 권한 허용됨');
      } else {
        console.log('❌ 일부 알림 권한이 거부됨');
        console.log('- FCM 권한:', fcmGranted);
        console.log('- 로컬 알림 권한:', localGranted);
      }

      return granted;
    } catch (error) {
      // console.error('❌ 알림 권한 요청 실패:', error);
      return false;
    }
  }

  /**
   * FCM 토큰 가져오기 및 출력
   */
  async printFCMToken(): Promise<void> {
    try {
      await NotificationService.printFCMToken();
    } catch (error) {
      // console.error('❌ FCM 토큰 출력 실패:', error);
      throw error;
    }
  }

  /**
   * 알림 설정 저장 (FCM + 로컬)
   */
  async saveNotificationSettings(
    settings: NotificationSettings,
  ): Promise<void> {
    try {
      console.log('💾 통합 알림 설정 저장 시작:', settings);

      // 1. FCM 설정 저장 (서버 + AsyncStorage)
      await NotificationService.saveNotificationSettings(settings);

      // 2. 로컬 알림 설정 저장
      await LocalNotificationService.saveNotificationSettings(settings);

      console.log('✅ 통합 알림 설정 저장 완료');
    } catch (error) {
      // console.error('❌ 통합 알림 설정 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 알림 설정 불러오기
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      // LocalNotificationService에서 설정 불러오기
      return await LocalNotificationService.getNotificationSettings();
    } catch (error) {
      // console.error('❌ 알림 설정 불러오기 실패:', error);
      // 기본값 반환
      return {
        enabled: true,
        expiryDaysBefore: 3,
        notificationTime: '09:00',
      };
    }
  }

  /**
   * 알림 상태 확인 (권한 + 활성화 여부)
   */
  async checkNotificationStatus(): Promise<{
    hasPermission: boolean;
    isEnabled: boolean;
  }> {
    try {
      // FCM 상태 확인
      const fcmStatus = await NotificationService.checkNotificationStatus();

      // 로컬 알림 상태 확인
      const localStatus =
        await LocalNotificationService.checkNotificationStatus();

      // 두 가지 모두 권한이 있어야 함
      const hasPermission =
        fcmStatus.hasPermission && localStatus.hasPermission;
      const isEnabled = fcmStatus.isEnabled && localStatus.isEnabled;

      console.log('📊 통합 알림 상태:', {
        FCM: fcmStatus,
        로컬: localStatus,
        통합_권한: hasPermission,
        통합_활성화: isEnabled,
      });

      return {
        hasPermission,
        isEnabled,
      };
    } catch (error) {
      // console.error('❌ 알림 상태 확인 실패:', error);
      return {
        hasPermission: false,
        isEnabled: false,
      };
    }
  }

  /**
   * 테스트 알림 전송 (FCM + 로컬)
   */
  async sendTestNotifications(): Promise<void> {
    try {
      console.log('🧪 테스트 알림 전송 시작...');

      // 1. FCM 토큰 출력 및 테스트
      await NotificationService.printFCMToken();

      // 2. 로컬 테스트 알림 전송
      if (LocalNotificationService.sendTestNotification) {
        await LocalNotificationService.sendTestNotification();
      }

      console.log('✅ 테스트 알림 전송 완료');
    } catch (error) {
      // console.error('❌ 테스트 알림 전송 실패:', error);
      throw error;
    }
  }

  /**
   * 데모 알림 생성 (개발용)
   */
  async createDemoNotifications(): Promise<void> {
    try {
      console.log('🎬 데모 알림 생성 시작...');

      if (LocalNotificationService.createDemoNotifications) {
        await LocalNotificationService.createDemoNotifications();
        console.log('✅ 데모 알림 생성 완료');
      } else {
        // console.warn('⚠️ createDemoNotifications 메서드가 없습니다');
      }
    } catch (error) {
      // console.error('❌ 데모 알림 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 예약된 로컬 알림 목록 가져오기
   */
  async getScheduledNotifications(): Promise<any[]> {
    try {
      if (LocalNotificationService.getScheduledNotifications) {
        return await LocalNotificationService.getScheduledNotifications();
      }
      return [];
    } catch (error) {
      // console.error('❌ 예약된 알림 조회 실패:', error);
      return [];
    }
  }

  /**
   * 식재료 알림 스케줄링
   * @param ingredients 알림을 설정할 식재료 목록
   */
  async scheduleIngredientsNotifications(ingredients: any[]): Promise<void> {
    try {
      console.log('📅 식재료 알림 스케줄링 시작...');

      if (LocalNotificationService.scheduleIngredientsNotifications) {
        await LocalNotificationService.scheduleIngredientsNotifications(
          ingredients,
        );
        console.log('✅ 식재료 알림 스케줄링 완료');
      } else {
        // console.warn('⚠️ scheduleIngredientsNotifications 메서드가 없습니다');
      }
    } catch (error) {
      // console.error('❌ 식재료 알림 스케줄링 실패:', error);
      throw error;
    }
  }

  /**
   * 모든 예약된 알림 취소
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      console.log('🗑️ 모든 알림 취소 시작...');

      if (LocalNotificationService.cancelAllNotifications) {
        await LocalNotificationService.cancelAllNotifications();
        console.log('✅ 모든 알림 취소 완료');
      }
    } catch (error) {
      // console.error('❌ 알림 취소 실패:', error);
      throw error;
    }
  }
}

export default new UnifiedNotificationService();
