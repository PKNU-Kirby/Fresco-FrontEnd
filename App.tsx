import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Config from 'react-native-config';
import NaverLogin from '@react-native-seoul/naver-login';

// Fonts
// import CustomText from './src/components/common/CustomText';

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

// Stack Navigator Type (수정됨)
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
    recognizedData?: {
      photo?: string;
      name?: string;
      quantity?: number;
      unit?: string;
      expiryDate?: string;
      itemCategory?: string;
    };
    scanResults?: ConfirmedIngredient[];
    scanMode?: 'ingredient' | 'receipt';
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

// Tab Navigator Type (수정됨)
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
    // 딥링크 핸들러 초기화
    DeepLinkHandler.setNavigationRef(navigationRef.current);
    const subscription = DeepLinkHandler.initialize();

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
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
            options={{
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="NotificationSettingsScreen"
            component={NotificationSettingsScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
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
    </GestureHandlerRootView>
  );
}

export default App;
