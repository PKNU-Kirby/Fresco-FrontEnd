export { Header } from './Header';
export { SharedRecipeIndicator } from './SharedRecipeIndicator';
export { RecipeTitleSection } from './RecipeTitleSection';
export { IngredientsSection } from './IngredientsSection';
export { StepsSection } from '../modals/StepsSection';
export { ReferenceUrlSection } from './ReferenceURLSection';
export { RecipeActionButtons } from './RecipeActionButtons';
export { UseRecipeModal } from './UseRecipeModal';
export { ShareRecipeModal } from './ShareRecipeModal';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  Recipe,
  RecipeIngredient,
} from '../../screens/RecipeScreen/RecipeNavigator';
import {
  RecipeStorage,
  FavoriteStorage,
  SharedRecipeStorage,
} from '../../utils/AsyncStorageUtils';

export const useRecipeDetail = (
  initialRecipe: Recipe,
  isNewRecipe: boolean,
  isEditing: boolean,
  aiGeneratedData?: Partial<Recipe>,
) => {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(initialRecipe);
  const [isEditMode, setIsEditMode] = useState(
    isEditing || isNewRecipe || !!aiGeneratedData,
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 안전한 배열 처리 함수들
  const getStepsArray = (steps: string[] | string | undefined): string[] => {
    if (!steps) return [];
    if (Array.isArray(steps)) {
      return steps.filter(
        step => step && typeof step === 'string' && step.trim().length > 0,
      );
    }
    if (typeof steps === 'string') {
      return steps
        .split('\n')
        .map(step => step.trim())
        .filter(step => step.length > 0);
    }
    return [];
  };

  const getIngredientsArray = (
    ingredients: RecipeIngredient[] | undefined,
  ): RecipeIngredient[] => {
    if (!ingredients) return [];
    if (Array.isArray(ingredients)) return ingredients;
    return [];
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      if (currentRecipe.id && !currentRecipe.isShared) {
        try {
          const favoriteIds = await FavoriteStorage.getFavoriteIds();
          setIsFavorite(favoriteIds.includes(currentRecipe.id));
        } catch (error) {
          console.error('즐겨찾기 상태 로드 실패:', error);
        }
      }
    };
    loadInitialData();
  }, [currentRecipe.id, currentRecipe.isShared]);

  const handleSave = async () => {
    if (!currentRecipe.title.trim()) {
      Alert.alert('오류', '레시피 제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      if (isNewRecipe) {
        const newRecipe = {
          ...currentRecipe,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          steps: getStepsArray(currentRecipe.steps),
        };
        await RecipeStorage.addPersonalRecipe(newRecipe);
        setCurrentRecipe(newRecipe);
        Alert.alert('성공', '레시피가 저장되었습니다.');
      } else {
        const updatedRecipe = {
          ...currentRecipe,
          updatedAt: new Date().toISOString().split('T')[0],
          steps: getStepsArray(currentRecipe.steps),
          createdAt:
            currentRecipe.createdAt || new Date().toISOString().split('T')[0],
        };
        if (currentRecipe.isShared) {
          await SharedRecipeStorage.updateSharedRecipe(updatedRecipe);
        } else {
          await RecipeStorage.updatePersonalRecipe(updatedRecipe);
        }
        setCurrentRecipe(updatedRecipe);
        Alert.alert('성공', '레시피가 업데이트되었습니다.');
      }
      setIsEditMode(false);
    } catch (error) {
      console.error('레시피 저장 실패:', error);
      Alert.alert('오류', '레시피 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!currentRecipe.id || currentRecipe.isShared) return;
    try {
      const newFavoriteState = await FavoriteStorage.toggleFavorite(
        currentRecipe.id,
      );
      setIsFavorite(newFavoriteState);
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      Alert.alert('오류', '즐겨찾기 설정에 실패했습니다.');
    }
  };

  return {
    currentRecipe,
    setCurrentRecipe,
    isEditMode,
    setIsEditMode,
    isFavorite,
    isLoading,
    handleSave,
    toggleFavorite,
    getStepsArray,
    getIngredientsArray,
  };
};
