import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import NotificationSettingsScreen from './src/screens/FridgeSettingsScreen/NotificationSettingsScreen';

// Stack Navigator Type
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  FridgeSelect: undefined;
  MainTabs: { fridgeId: string; fridgeName: string };
  AddItemScreen: {
    fridgeId: string;
    recognizedData?: {
      name?: string;
      quantity?: string;
      unit?: string;
      expiryDate?: string;
      itemCategory?: string;
      photo?: string;
    };
  };
  CameraScreen: {
    fridgeId: string;
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
  };
  FridgeSettings: {
    fridgeId: string;
    fridgeName: string;
    userRole: 'owner' | 'member'; // 권한에 따른 UI 분리
  };
  UsageHistoryScreen: { fridgeId: number };
  NotificationSettingsScreen: {};
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator Type
export type MainTabParamList = {
  FridgeHomeScreen: { fridgeId: string; fridgeName: string };
  Recipe: { fridgeId: string; fridgeName: string };
  ShoppingListScreen: { fridgeId: string; fridgeName: string };
};

// Main Tab Navigator
function MainTabNavigator({
  route,
}: {
  route: { params: { fridgeId: string; fridgeName: string } };
}) {
  const { fridgeId, fridgeName } = route.params;

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
    >
      <Tab.Screen
        name="FridgeHomeScreen"
        component={FridgeHomeScreen}
        initialParams={{ fridgeId, fridgeName }}
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="FridgeSelect" component={FridgeSelectScreen} />
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen
            name="FridgeSettings"
            component={FridgeSettingsScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
          />
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
          <Stack.Screen
            name="CameraScreen"
            component={CameraScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="PhotoPreview"
            component={PhotoPreview}
            options={{
              title: '미리보기',
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="AddItemScreen"
            component={AddItemScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
