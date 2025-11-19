import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecipeHomeScreen from './index';
import AIRecipeScreen from './AIRecipeScreen';
import RecipeDetailScreen from './RecipeDetailScreen';
import SearchScreen from './SearchScreen';
import SearchResultScreen from './SearchResultScreen';
import SharedFolderScreen from './SharedFolderScreen';
import UseRecipeScreen from './UseRecipeScreen';

// EnhancedIngredient 타입 정의
export interface EnhancedIngredient extends RecipeIngredient {
  isAvailable: boolean;
}

// RecipeNavigator.ts 또는 types.ts

export interface RecipeIngredient {
  id: number;
  recipeIngredientId?: number;
  name: string;
  quantity: number;
  unit: string;
  instead?: string;
}

export interface Recipe {
  id: number;
  title: string;
  ingredients?: RecipeIngredient[];
  steps?: string[];
  referenceUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type RecipeStackParamList = {
  RecipeHome: {
    fridgeId: number;
    fridgeName: string;
  };
  AIRecipe: undefined;
  RecipeDetail: {
    recipe?: Recipe;
    isEditing?: boolean;
    isNewRecipe?: boolean;
    fridgeId: number;
    fridgeName: string;
    currentFridgeId?: number;
    aiGeneratedData?: Partial<Recipe>;
    isSharedRecipe?: boolean;
  };
  Search: {
    fridgeId: number;
    fridgeName: string;
  };
  SearchResult: {
    query: string;
    fridgeId?: number;
    fridgeName?: string;
  };
  SharedFolder: {
    currentFridgeId?: number;
    currentFridgeName?: string;
  };
  UseRecipe: {
    recipe: Recipe;
    fridgeId: number;
    enhancedIngredients?: EnhancedIngredient[];
  };
};

const RecipeStack = createNativeStackNavigator<RecipeStackParamList>();

interface RecipeNavigatorProps {
  route: {
    params: {
      fridgeId: number;
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
