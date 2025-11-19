// services/NotificationService.ts
import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './apiServices';

export interface NotificationSettings {
  enabled: boolean;
  expiryDaysBefore: number;
  notificationTime: string;
}

class NotificationService {
  private fcmToken: string | null = null;

  // 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    try {
      // iOS에서 원격 메시지 등록
      /*
      Apple Developer에서 푸시 알림 인증서 설정 필요:

      Apple Developer Console 접속
      Certificates, Identifiers & Profiles → Identifiers
      앱 Bundle ID 선택
      Push Notifications 체크박스 활성화
      인증서 생성 및 다운로드
      Xcode에서 Signing & Capabilities에 Push Notifications 추가
      */
      if (Platform.OS === 'ios') {
        try {
          if (Platform.OS === 'ios') {
            await messaging().registerDeviceForRemoteMessages();
          }
          const token = await messaging().getToken();
          console.log('📱 FCM 토큰:', token);
        } catch (error) {
          console.log('⚠️ FCM 설정 스킵 (개발 환경)');
          // 개발 중에는 무시
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ 푸시 알림 권한 허용됨');

        // 중요! 여기서 바로 토큰 가져오기
        try {
          await this.getFCMToken();
          this.setupMessageHandlers();
        } catch (tokenError) {
          console.error('❌ FCM 토큰 가져오기 실패:', tokenError);
          // 토큰 실패해도 권한은 허용된 것으로 처리
        }
      } else {
        console.log('❌ 푸시 알림 권한 거부됨');
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
      console.log('=> FCM 토큰 가져오기 시작...');

      // iOS에서 원격 메시지 등록
      /*
      Apple Developer에서 푸시 알림 인증서 설정 필요:

      Apple Developer Console 접속
      Certificates, Identifiers & Profiles → Identifiers
      앱 Bundle ID 선택
      Push Notifications 체크박스 활성화
      인증서 생성 및 다운로드
      Xcode에서 Signing & Capabilities에 Push Notifications 추가
      */
      if (Platform.OS === 'ios') {
        try {
          if (Platform.OS === 'ios') {
            await messaging().registerDeviceForRemoteMessages();
          }
          const token = await messaging().getToken();
          console.log('📱 FCM 토큰:', token);
        } catch (error) {
          console.log('⚠️ FCM 설정 스킵 (개발 환경)');
          // 개발 중에는 무시
        }
      }

      this.fcmToken = await messaging().getToken();
      console.log('📱 FCM Token:', this.fcmToken);

      // 서버에 토큰 저장
      await this.saveTokenToServer(this.fcmToken);

      return this.fcmToken;
    } catch (error) {
      console.error('❌ FCM 토큰 가져오기 실패:', error);
      throw error; // 에러를 throw해서 상위에서 처리
    }
  }

  // FCM 토큰 출력 (디버깅용)
  async printFCMToken(): Promise<void> {
    try {
      await this.printTokenForTesting();
    } catch (error) {
      console.error('FCM 토큰 출력 실패:', error);
      throw error;
    }
  }

  // 서버에 FCM 토큰 저장
  private async saveTokenToServer(token: string): Promise<void> {
    try {
      console.log('=> 서버에 FCM 토큰 저장 시도');

      // AsyncStorage에도 저장
      await AsyncStorage.setItem('fcm_token', token);

      // 실제 서버 API 호출
      const success = await ApiService.registerFCMToken(token);

      if (success) {
        console.log('✅ FCM 토큰 서버 저장 완료');
      } else {
        console.warn('⚠️ FCM 토큰 서버 저장 실패 (재시도 가능)');
      }
    } catch (error) {
      console.error('❌ 서버에 토큰 저장 중 오류:', error);
    }
  }

  // 메시지 핸들러들 설정
  setupMessageHandlers(): void {
    console.log('=> 메시지 핸들러 설정 중...');

    // 포그라운드 메시지 리스너
    messaging().onMessage(async remoteMessage => {
      console.log('📨 포그라운드에서 메시지 수신:', remoteMessage);

      Alert.alert(
        remoteMessage.notification?.title || '알림',
        remoteMessage.notification?.body || '새 메시지가 있습니다.',
      );
    });

    // 백그라운드/종료 상태에서 알림 클릭으로 앱 열림
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🔔 백그라운드 알림 클릭으로 앱 열림:', remoteMessage);
    });

    // 앱이 종료된 상태에서 알림 클릭으로 앱 시작
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            '🚀 앱 종료 상태에서 알림 클릭으로 앱 시작:',
            remoteMessage,
          );
        }
      });

    // FCM 토큰 갱신 리스너
    messaging().onTokenRefresh(async token => {
      console.log('🔄 FCM 토큰 갱신:', token.substring(0, 30) + '...');
      this.fcmToken = token;
      await this.saveTokenToServer(token);
    });
  }

  // 알림 설정 저장 (로컬 + 서버)
  async saveNotificationSettings(
    settings: NotificationSettings,
  ): Promise<void> {
    try {
      console.log('💾 알림 설정 저장 시작:', settings);

      // 1. 로컬에 저장
      await AsyncStorage.setItem(
        'notification_settings',
        JSON.stringify(settings),
      );
      console.log('💾 알림 설정 로컬 저장됨');

      // 2. 서버에도 알림 설정 전송
      if (settings.enabled && this.fcmToken) {
        const success = await ApiService.updateNotificationSettings(
          this.fcmToken,
          {
            expiryDaysBefore: settings.expiryDaysBefore,
            notificationTime: settings.notificationTime,
          },
        );

        if (success) {
          console.log('✅ 알림 설정 서버 전송 완료');
        } else {
          console.warn('⚠️ 알림 설정 서버 전송 실패');
        }
      }
    } catch (error) {
      console.error('❌ 알림 설정 저장 실패:', error);
      throw error;
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

  // 테스트용: FCM 토큰 출력 및 테스트 알림 전송
  async printTokenForTesting(): Promise<void> {
    try {
      // 토큰이 없으면 가져오기
      if (!this.fcmToken) {
        await this.getFCMToken();
      }

      const token = this.fcmToken;

      if (token) {
        console.log('=== 테스트용 FCM 토큰 ===');
        console.log(token);
        console.log(
          '=== Firebase 콘솔에서 이 토큰으로 테스트 메시지를 보내세요 ===',
        );

        // 테스트 알림 전송 시도
        const success = await ApiService.sendTestNotification(token);

        Alert.alert(
          'FCM 토큰 (테스트용)',
          success
            ? `테스트 알림이 전송되었습니다!\n\n토큰: ${token.substring(
                0,
                50,
              )}...`
            : `토큰: ${token.substring(0, 50)}...\n\n테스트 알림 전송 실패`,
          [{ text: '확인' }],
        );
      } else {
        Alert.alert('오류', 'FCM 토큰을 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('❌ printTokenForTesting 실패:', error);
      Alert.alert('오류', 'FCM 토큰을 가져오는 중 오류가 발생했습니다.');
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
