import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import FridgeSelectScreen from './src/screens/FridgeSelectScreen';
import FridgeHomeScreen from './src/screens/FridgeHomeScreen';
import RecipeScreen from './src/screens/RecipeScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import CameraScreen from './src/screens/CameraScreen';
import FridgeSettingsScreen from './src/screens/FridgeSettingsScreen';

// Stack Navigator Type
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  FridgeSelect: undefined;
  MainTabs: {fridgeId: number; fridgeName: string};
  AddItem: {
    fridgeId: number;
    recognizedData?: {
      name?: string;
      quantity?: string;
      unit?: string;
      expiryDate?: string;
      storageType?: string;
      itemCategory?: string;
    };
  };
  Camera: {fridgeId: number};
  FridgeSettings: {
    fridgeId: number;
    fridgeName: string;
    userRole: 'owner' | 'member'; // 권한에 따른 UI 분기
  };
};

// Tab Navigator Type
export type MainTabParamList = {
  FridgeHome: {fridgeId: number; fridgeName: string};
  Recipe: {fridgeId: number; fridgeName: string};
  ShoppingList: {fridgeId: number; fridgeName: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
function MainTabNavigator({
  route,
}: {
  route: {params: {fridgeId: number; fridgeName: string}};
}) {
  const {fridgeId, fridgeName} = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ff6b6b',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingVertical: 12,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="FridgeHome"
        component={FridgeHomeScreen}
        initialParams={{fridgeId, fridgeName}}
        options={{
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="Recipe"
        component={RecipeScreen}
        initialParams={{fridgeId, fridgeName}}
        options={{
          tabBarLabel: '레시피',
        }}
      />
      <Tab.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        initialParams={{fridgeId, fridgeName}}
        options={{
          tabBarLabel: '쇼핑목록',
        }}
      />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="FridgeSelect" component={FridgeSelectScreen} />
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen
            name="AddItem"
            component={AddItemScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom', // 하단에서 올라오는 애니메이션
            }}
          />
          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              presentation: 'fullScreenModal', // 전체화면 모달
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="FridgeSettings"
            component={FridgeSettingsScreen}
            options={{
              presentation: 'modal', // 모달 스타일
              animation: 'slide_from_right', // 오른쪽에서 슬라이드
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
