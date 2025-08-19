/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Background Message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('백그라운드에서 메시지 수신:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
