/*
// services/NotificationService.ts
import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationSettings {
  enabled: boolean;
  expiryDaysBefore: number; // 소비기한 며칠 전 알림
  notificationTime: string; // "HH:MM" 형식
}

class NotificationService {
  private fcmToken: string | null = null;

  // 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    try {
      // iOS에서 원격 메시지 등록 (권한 요청 전에!)
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('푸시 알림 권한이 허용되었습니다.');
        await this.getFCMToken();
        this.setupMessageHandlers();
      } else {
        console.log('푸시 알림 권한이 거부되었습니다.');
      }

      return enabled;
    } catch (error) {
      console.error('푸시 알림 권한 요청 실패:', error);
      return false;
    }
  }

  // FCM 토큰 가져오기
  async getFCMToken(): Promise<string | null> {
    try {
      if (!this.fcmToken) {
        // iOS에서 원격 메시지 등록 (필수!)
        if (Platform.OS === 'ios') {
          await messaging().registerDeviceForRemoteMessages();
        }

        this.fcmToken = await messaging().getToken();
        console.log('FCM Token:', this.fcmToken);

        // 서버에 토큰 저장
        await this.saveTokenToServer(this.fcmToken);
      }
      return this.fcmToken;
    } catch (error) {
      console.error('FCM 토큰 가져오기 실패:', error);
      return null;
    }
  }

  // 서버에 FCM 토큰 저장
  private async saveTokenToServer(token: string): Promise<void> {
    try {
      // 실제 API 호출로 대체해야 함
      console.log('서버에 FCM 토큰 저장:', token);
      await AsyncStorage.setItem('fcm_token', token);

      // TODO: 실제 서버 API 호출
      // const response = await fetch('YOUR_API_ENDPOINT/fcm-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, userId: 'current_user_id' }),
      // });
    } catch (error) {
      console.error('서버에 토큰 저장 실패:', error);
    }
  }

  // 메시지 핸들러들 설정
  setupMessageHandlers(): void {
    // 포그라운드 메시지 리스너
    messaging().onMessage(async remoteMessage => {
      console.log('포그라운드에서 메시지 수신:', remoteMessage);

      // 포그라운드에서 알림 표시 (자동으로 표시됨)
      Alert.alert(
        remoteMessage.notification?.title || '알림',
        remoteMessage.notification?.body || '새 메시지가 있습니다.',
      );
    });

    // 백그라운드/종료 상태에서 알림 클릭으로 앱 열림
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('백그라운드 알림 클릭으로 앱 열림:', remoteMessage);
      // 특정 화면으로 네비게이션 등 처리
    });

    // 앱이 종료된 상태에서 알림 클릭으로 앱 시작
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('앱 종료 상태에서 알림 클릭으로 앱 시작:', remoteMessage);
          // 특정 화면으로 네비게이션 등 처리
        }
      });

    // FCM 토큰 갱신 리스너
    messaging().onTokenRefresh(token => {
      console.log('FCM 토큰 갱신:', token);
      this.fcmToken = token;
      this.saveTokenToServer(token);
    });
  }

  // 백그라운드 메시지 핸들러 설정 (index.js에서 호출)
  static setupBackgroundHandler(): void {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('백그라운드에서 메시지 수신:', remoteMessage);
      // 백그라운드에서는 자동으로 시스템 알림이 표시됨
      // 여기서는 데이터 처리만 필요
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

    // 기본 설정
    return {
      enabled: true,
      expiryDaysBefore: 3,
      notificationTime: '09:00',
    };
  }

  // 테스트용: Firebase 콘솔에서 테스트 메시지 보내기 위한 토큰 출력
  async printTokenForTesting(): Promise<void> {
    const token = await this.getFCMToken();
    if (token) {
      console.log('=== 테스트용 FCM 토큰 ===');
      console.log(token);
      console.log(
        '=== Firebase 콘솔에서 이 토큰으로 테스트 메시지를 보내세요 ===',
      );

      // 개발 중에는 Alert로도 표시
      Alert.alert(
        'FCM 토큰 (테스트용)',
        `토큰이 콘솔에 출력되었습니다.\n\n${token.substring(0, 50)}...`,
        [{ text: '확인' }],
      );
    }
  }

  // 알림 상태 확인
  async checkNotificationStatus(): Promise<{
    hasPermission: boolean;
    isEnabled: boolean;
  }> {
    try {
      const authStatus = await messaging().hasPermission();
      const hasPermission =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED;

      const settings = await this.getNotificationSettings();

      return {
        hasPermission,
        isEnabled: settings.enabled,
      };
    } catch (error) {
      console.error('알림 상태 확인 실패:', error);
      return { hasPermission: false, isEnabled: false };
    }
  }
}

export default new NotificationService();


*/
