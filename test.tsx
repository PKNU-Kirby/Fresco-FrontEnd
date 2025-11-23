import React, { useEffect, useRef, useState } from 'react';
import firebase from '@react-native-firebase/app';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Config from './src/types/config';
import NaverLogin from '@react-native-seoul/naver-login';

// Modals
import ConfirmModal from './src/components/modals/ConfirmModal';

// Services
import NotificationService from './src/services/NotificationService';
import {
  ApiErrorHandler,
  ErrorAction,
  ErrorSeverity,
} from './src/utils/errorHandler';

// Icons
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import FridgeSelectScreen from './src/screens/FridgeSelectScreen';
import FridgeHomeScreen from './src/screens/FridgeHomeScreen';
import RecipeNavigator from './src/screens/RecipeScreen/RecipeNavigator';
import ShoppingListScreen from './src/screens/ShoppingListScreen';
import FridgeSettingsScreen from './src/screens/FridgeSettingsScreen';
import UsageHistoryScreen from './src/screens/UsageHistoryScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import CameraScreen from './src/screens/CameraScreen';
import PhotoPreview from './src/screens/CameraScreen/PhotoPreview';
import InviteConfirmScreen from './src/screens/InviteConfirmScreen';
import MembersScreen from './src/screens/FridgeSettingsScreen/MembersScreen';
import NotificationSettingsScreen from './src/screens/FridgeSettingsScreen/NotificationSettingsScreen';

// 딥링크 핸들러
import { DeepLinkHandler } from './src/utils/deepLinkHandler';

// Types
import { ConfirmedIngredient } from './src/services/API/ingredientControllerAPI';

interface NaverConfig {
  consumerKey: string;
  consumerSecret: string;
  appName: string;
  serviceUrlSchemeIOS: string;
  disableNaverAppAuthIOS: boolean;
}

const NAVER_CONFIG: NaverConfig = {
  consumerKey: Config.NAVER_CLIENT_ID || '',
  consumerSecret: Config.NAVER_CLIENT_SECRET || '',
  appName: 'Fresco',
  serviceUrlSchemeIOS: 'naverlogin',
  disableNaverAppAuthIOS: true,
};

// Stack Navigator Type
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  FridgeSelect: undefined;
  InviteConfirm: {
    token: string;
    fridgeInfo: {
      name: string;
      inviterName: string;
      memberCount?: number;
    };
  };
  MainTabs: {
    fridgeId: number;
    fridgeName: string;
    screen?: keyof MainTabParamList;
    params?: any;
  };
  CameraScreen: {
    fridgeId: number;
  };
  PhotoPreview: {
    photo: {
      uri: string;
      width?: number;
      height?: number;
      fileSize?: number;
      type?: string;
      fileName?: string;
    };
    fridgeId: number;
    scanMode?: 'ingredient' | 'receipt';
  };
  AddItemScreen: {
    fridgeId: number;
    fridgeName?: string;
    recognizedData?: {
      photo?: string;
      name?: string;
      quantity?: number;
      unit?: string;
      expiryDate?: string;
      itemCategory?: string;
    };
    scanResults?: ConfirmedIngredient[];
    scanMode?: 'camera' | 'receipt';
  };
  FridgeSettings: {
    fridgeId: number;
    fridgeName: string;
    userRole: 'owner' | 'member';
  };
  MembersScreen: {
    fridgeId: number;
    fridgeName: string;
    userRole: 'owner' | 'member';
  };
  UsageHistoryScreen: { fridgeId: number };
  NotificationSettingsScreen: {};
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator Type
export type MainTabParamList = {
  FridgeHomeScreen: {
    fridgeId: number;
    fridgeName: string;
    newItems?: any[];
    refreshKey?: number;
  };
  Recipe: { fridgeId: number; fridgeName: string };
  ShoppingListScreen: { fridgeId: number; fridgeName: string };
};

// Main Tab Navigator
function MainTabNavigator({
  route,
}: {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
      screen?: string;
      params?: any;
    };
  };
}) {
  const { fridgeId, fridgeName, screen, params } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'limegreen',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingVertical: 12,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '500',
          marginTop: 8,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
      }}
      initialRouteName={
        (screen as keyof MainTabParamList) || 'FridgeHomeScreen'
      }
    >
      <Tab.Screen
        name="FridgeHomeScreen"
        component={FridgeHomeScreen}
        initialParams={params || { fridgeId, fridgeName }}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="house" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Recipe"
        component={RecipeNavigator}
        initialParams={{ fridgeId, fridgeName }}
        options={{
          tabBarLabel: '레시피',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="mortar-pestle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ShoppingListScreen"
        component={ShoppingListScreen}
        initialParams={{ fridgeId, fridgeName }}
        options={{
          tabBarLabel: '쇼핑목록',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="shopping-basket" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  const navigationRef = useRef(null);

  // 👇 NotificationService 모달 상태들
  const [foregroundMessageVisible, setForegroundMessageVisible] =
    useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [tokenAlertVisible, setTokenAlertVisible] = useState(false);
  const [tokenAlertMessage, setTokenAlertMessage] = useState('');
  const [tokenErrorVisible, setTokenErrorVisible] = useState(false);

  // 👇 ErrorHandler 모달 상태들
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorAction, setErrorAction] = useState<ErrorAction>('none');
  const [errorSeverity, setErrorSeverity] = useState<ErrorSeverity>('low');
  const [errorRetryCallback, setErrorRetryCallback] = useState<
    (() => void) | undefined
  >();

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successCallback, setSuccessCallback] = useState<
    (() => void) | undefined
  >();

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState<
    (() => void) | undefined
  >();
  const [cancelCallback, setCancelCallback] = useState<
    (() => void) | undefined
  >();

  useEffect(() => {
    NaverLogin.initialize({
      appName: NAVER_CONFIG.appName,
      consumerKey: NAVER_CONFIG.consumerKey,
      consumerSecret: NAVER_CONFIG.consumerSecret,
      serviceUrlSchemeIOS: NAVER_CONFIG.serviceUrlSchemeIOS,
      disableNaverAppAuthIOS: true,
    });
  }, []);

  useEffect(() => {
    // 👇 NotificationService 모달 콜백 등록
    NotificationService.setModalCallbacks({
      showForegroundMessage: (title: string, body: string) => {
        setMessageTitle(title);
        setMessageBody(body);
        setForegroundMessageVisible(true);
      },
      showTokenAlert: (token: string, success: boolean) => {
        setTokenAlertMessage(
          success
            ? `테스트 알림이 전송되었습니다!\n\n토큰: ${token.substring(
                0,
                50,
              )}...`
            : `토큰: ${token.substring(0, 50)}...\n\n테스트 알림 전송 실패`,
        );
        setTokenAlertVisible(true);
      },
      showTokenError: () => {
        setTokenErrorVisible(true);
      },
    });

    // 👇 ErrorHandler 모달 콜백 등록
    ApiErrorHandler.setModalCallbacks({
      showErrorModal: (title, message, action, severity, onRetry) => {
        setErrorTitle(title);
        setErrorMessage(message);
        setErrorAction(action);
        setErrorSeverity(severity);
        setErrorRetryCallback(() => onRetry);
        setErrorModalVisible(true);
      },
      showSuccessModal: (title, message, onOk) => {
        setSuccessTitle(title);
        setSuccessMessage(message);
        setSuccessCallback(() => onOk);
        setSuccessModalVisible(true);
      },
      showConfirmModal: (title, message, onConfirm, onCancel) => {
        setConfirmTitle(title);
        setConfirmMessage(message);
        setConfirmCallback(() => onConfirm);
        setCancelCallback(() => onCancel);
        setConfirmModalVisible(true);
      },
    });

    // 딥링크 핸들러 초기화
    DeepLinkHandler.setNavigationRef(navigationRef.current);
    const subscription = DeepLinkHandler.initialize();

    console.log('🔥 Firebase App Name:', firebase.app().name);
    console.log('🔥 Firebase initialized:', firebase.apps.length > 0);

    return () => {
      subscription?.remove();
    };
  }, []);

  // 에러 아이콘 가져오기
  const getErrorIcon = () => {
    switch (errorSeverity) {
      case 'critical':
        return { name: 'error', color: '#D32F2F', size: 48 };
      case 'high':
        return { name: 'warning', color: '#F57C00', size: 48 };
      case 'medium':
        return { name: 'error-outline', color: 'tomato', size: 48 };
      default:
        return { name: 'info', color: '#2196F3', size: 48 };
    }
  };

  const getErrorIconContainer = () => {
    switch (errorSeverity) {
      case 'critical':
        return { backgroundColor: '#FFEBEE' };
      case 'high':
        return { backgroundColor: '#FFF3E0' };
      case 'medium':
        return { backgroundColor: '#fae1dd' };
      default:
        return { backgroundColor: '#E3F2FD' };
    }
  };

  const getConfirmText = () => {
    switch (errorAction) {
      case 'retry':
        return '다시 시도';
      case 'login':
        return '로그인';
      case 'refresh':
        return '새로고침';
      default:
        return '확인';
    }
  };

  const handleErrorConfirm = () => {
    if (errorAction === 'retry' && errorRetryCallback) {
      errorRetryCallback();
    }
    setErrorModalVisible(false);
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="FridgeSelect" component={FridgeSelectScreen} />
            <Stack.Screen
              name="InviteConfirm"
              component={InviteConfirmScreen}
              options={{
                title: '냉장고 초대',
                headerShown: true,
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="FridgeSettings"
              component={FridgeSettingsScreen}
            />
            <Stack.Screen name="MembersScreen" component={MembersScreen} />
            <Stack.Screen
              name="UsageHistoryScreen"
              component={UsageHistoryScreen}
              options={{}}
            />
            <Stack.Screen
              name="NotificationSettingsScreen"
              component={NotificationSettingsScreen}
              options={{}}
            />
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
            <Stack.Screen
              name="PhotoPreview"
              component={PhotoPreview}
              options={{
                title: '미리보기',
                presentation: 'modal',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen name="AddItemScreen" component={AddItemScreen} />
          </Stack.Navigator>
        </NavigationContainer>

        {/* 👇 여기부터 전역 모달들 추가 */}

        {/* NotificationService 모달들 */}
        <ConfirmModal
          isAlert={false}
          visible={foregroundMessageVisible}
          title={messageTitle}
          message={messageBody}
          iconContainer={{ backgroundColor: '#e3f2fd' }}
          icon={{ name: 'notifications', color: '#2196F3', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setForegroundMessageVisible(false)}
          onCancel={() => setForegroundMessageVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={tokenAlertVisible}
          title="FCM 토큰 (테스트용)"
          message={tokenAlertMessage}
          iconContainer={{ backgroundColor: '#e3f2fd' }}
          icon={{ name: 'info', color: '#2196F3', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setTokenAlertVisible(false)}
          onCancel={() => setTokenAlertVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={tokenErrorVisible}
          title="오류"
          message="FCM 토큰을 가져올 수 없습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setTokenErrorVisible(false)}
          onCancel={() => setTokenErrorVisible(false)}
        />

        {/* ErrorHandler 모달들 */}
        <ConfirmModal
          isAlert={errorAction !== 'none'}
          visible={errorModalVisible}
          title={errorTitle}
          message={errorMessage}
          iconContainer={getErrorIconContainer()}
          icon={getErrorIcon()}
          confirmText={getConfirmText()}
          cancelText={errorAction !== 'none' ? '취소' : ''}
          confirmButtonStyle={errorAction === 'retry' ? 'primary' : 'danger'}
          onConfirm={handleErrorConfirm}
          onCancel={() => setErrorModalVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={successModalVisible}
          title={successTitle}
          message={successMessage}
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'check', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => {
            if (successCallback) successCallback();
            setSuccessModalVisible(false);
          }}
          onCancel={() => setSuccessModalVisible(false)}
        />

        <ConfirmModal
          isAlert={true}
          visible={confirmModalVisible}
          title={confirmTitle}
          message={confirmMessage}
          iconContainer={{ backgroundColor: '#e3f2fd' }}
          icon={{ name: 'help-outline', color: '#2196F3', size: 48 }}
          confirmText="확인"
          cancelText="취소"
          confirmButtonStyle="primary"
          onConfirm={() => {
            if (confirmCallback) confirmCallback();
            setConfirmModalVisible(false);
          }}
          onCancel={() => {
            if (cancelCallback) cancelCallback();
            setConfirmModalVisible(false);
          }}
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
