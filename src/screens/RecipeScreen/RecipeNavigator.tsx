import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecipeHomeScreen from './index';
import AIRecipeScreen from './AIRecipeScreen';
import RecipeDetailScreen from './RecipeDetailScreen';
import SearchScreen from './SearchScreen';
import SearchResultScreen from './SearchResultScreen';
import SharedFolderScreen from './SharedFolderScreen';
import UseRecipeScreen from './UseRecipeScreen'; // 🔧 UseRecipeScreen import 추가

// EnhancedIngredient 타입 정의
export interface EnhancedIngredient extends RecipeIngredient {
  isAvailable: boolean;
}

// Recipe 타입 정의 (공통으로 사용)
export interface Recipe {
  id: string;
  title: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  isShared?: boolean;
  sharedBy?: string;
  // RecipeDetail에서 사용하는 추가 필드들
  ingredients?: RecipeIngredient[];
  steps?: string[] | string; // 🔧 string 배열 또는 문자열 둘 다 허용
  referenceUrl?: string;
}

// RecipeIngredient 타입도 export
export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

// 네비게이션 타입 정의
export type RecipeStackParamList = {
  RecipeHome: {
    fridgeId: string;
    fridgeName: string;
  };
  AIRecipe: undefined;
  RecipeDetail: {
    recipe?: Recipe;
    isEditing?: boolean;
    isNewRecipe?: boolean;
    fridgeId: string;
    fridgeName: string;
    aiGeneratedData?: Partial<Recipe>; // 🔧 AI 생성 데이터 전달용 추가
  };
  Search: undefined; // 파라미터 없음으로 정의
  SearchResult: {
    query: string;
  };
  SharedFolder: undefined;
  UseRecipe: {
    recipe: Recipe;
    fridgeId: string;
    enhancedIngredients?: EnhancedIngredient[];
  };
};

const RecipeStack = createNativeStackNavigator<RecipeStackParamList>();

interface RecipeNavigatorProps {
  route: {
    params: {
      fridgeId: string;
      fridgeName: string;
    };
  };
}

const RecipeNavigator: React.FC<RecipeNavigatorProps> = ({ route }) => {
  const { fridgeId, fridgeName } = route.params;

  return (
    <RecipeStack.Navigator
      initialRouteName="RecipeHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <RecipeStack.Screen
        name="RecipeHome"
        component={RecipeHomeScreen}
        initialParams={{ fridgeId, fridgeName }}
      />
      <RecipeStack.Screen
        name="AIRecipe"
        component={AIRecipeScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <RecipeStack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <RecipeStack.Screen name="Search" component={SearchScreen} />
      <RecipeStack.Screen name="SearchResult" component={SearchResultScreen} />
      <RecipeStack.Screen
        name="SharedFolder"
        component={SharedFolderScreen}
        options={{}}
      />
      {/* 🔧 UseRecipe 스크린 추가 */}
      <RecipeStack.Screen
        name="UseRecipe"
        component={UseRecipeScreen}
        options={{
          animation: 'slide_from_right',
          // 필요시 추가 옵션들
          gestureEnabled: true,
        }}
      />
    </RecipeStack.Navigator>
  );
};

export default RecipeNavigator;
