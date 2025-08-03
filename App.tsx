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

import RecipeScreen from './src/screens/RecipeScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';
import FridgeSettingsScreen from './src/screens/FridgeSettingsScreen';
import UsageHistoryScreen from './src/screens/UsageHistoryScreen';

import RecipeFolderScreen from './src/screens/RecipeFolderScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import RecipeEditScreen from './src/screens/RecipeEditScreen';
/*
import AddItemScreen from './src/screens/AddItemScreen';
import CameraScreen from './src/screens/CameraScreen';
*/
import { Recipe, RecipeFolder } from './src/screens/RecipeScreen';

// Stack Navigator Type
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  FridgeSelect: undefined;
  MainTabs: { fridgeId: number; fridgeName: string };
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
  Camera: {
    fridgeId: number;
    photo?: any;
    onRetake?: () => void;
    onUse?: (photo?: string) => void;
    onCancel?: () => void;
  };
  FridgeSettings: {
    fridgeId: number;
    fridgeName: string;
    userRole: 'owner' | 'member'; // 권한에 따른 UI 분리
  };
  UsageHistoryScreen: { fridgeId: number };
  RecipeFolderScreen: {
    folder: RecipeFolder;
    fridgeId: number;
    fridgeName: string;
  };
  RecipeDetailScreen: {
    recipe: Recipe;
    fridgeId: number;
    fridgeName: string;
  };
  RecipeEditScreen: {
    recipe?: Recipe;
    folderId: string;
    fridgeId: number;
    fridgeName: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab Navigator Type
export type MainTabParamList = {
  FridgeHome: { fridgeId: number; fridgeName: string };
  Recipe: { fridgeId: number; fridgeName: string };
  ShoppingList: { fridgeId: number; fridgeName: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
function MainTabNavigator({
  route,
}: {
  route: { params: { fridgeId: number; fridgeName: string } };
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
          height: 80,
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
        name="FridgeHome"
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
        component={RecipeScreen}
        initialParams={{ fridgeId, fridgeName }}
        options={{
          tabBarLabel: '레시피',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="mortar-pestle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ShoppingList"
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
          {/*
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
          */}

          {/* 새로 추가할 레시피 스크린들 */}
          <Stack.Screen
            name="RecipeFolderScreen"
            component={RecipeFolderScreen}
            options={{
              headerShown: true,
              headerTitle: '레시피 폴더',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#333',
              headerTitleStyle: { fontWeight: '600' },
            }}
          />
          <Stack.Screen
            name="RecipeDetailScreen"
            component={RecipeDetailScreen}
            options={{
              headerShown: true,
              headerTitle: '레시피',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#333',
              headerTitleStyle: { fontWeight: '600' },
            }}
          />
          <Stack.Screen
            name="RecipeEditScreen"
            component={RecipeEditScreen}
            options={{
              headerShown: true,
              headerTitle: '레시피 편집',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#333',
              headerTitleStyle: { fontWeight: '600' },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
