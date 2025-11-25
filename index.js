/**
 * @format
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// 백그라운드 메시지 핸들러
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // console.log('📭 백그라운드 메시지 수신:', remoteMessage);
  // 여기서 필요한 데이터 처리 (예: AsyncStorage 저장 등)
  // 알림은 자동으로 시스템에서 표시됨
});

AppRegistry.registerComponent(appName, () => App);
