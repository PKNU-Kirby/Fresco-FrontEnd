export { Header } from './Header';
export { StepsSection } from './StepsSection';
export { UseRecipeModal } from './UseRecipeModal';
export { ShareRecipeModal } from './ShareRecipeModal';
export { IngredientsSection } from './IngredientsSection';
export { RecipeTitleSection } from './RecipeTitleSection';
export { ReferenceUrlSection } from './ReferenceURLSection';
export { RecipeActionButtons } from './RecipeActionButtons';
export { SharedRecipeIndicator } from './SharedRecipeIndicator';

import { useState, useEffect } from 'react';
import {
  Recipe,
  RecipeIngredient,
} from '../../screens/RecipeScreen/RecipeNavigator';
import {
  RecipeStorage,
  FavoriteStorage,
  SharedRecipeStorage,
} from '../../utils/AsyncStorageUtils';

// ConfirmModal 상태 타입
export interface RecipeModalState {
  errorMessage: string;
  successMessage: string;
  errorModalVisible: boolean;
  successModalVisible: boolean;
  setErrorModalVisible: (visible: boolean) => void;
  setSuccessModalVisible: (visible: boolean) => void;
}

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

  // ConfirmModal 상태들
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
      setErrorMessage('레시피 제목을 입력해주세요.');
      setErrorModalVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isNewRecipe) {
        const newRecipe = {
          ...currentRecipe,
          id: Date.now(),
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          steps: getStepsArray(currentRecipe.steps),
        };
        await RecipeStorage.addPersonalRecipe(newRecipe);
        setCurrentRecipe(newRecipe);
        setSuccessMessage('레시피가 저장되었습니다.');
        setSuccessModalVisible(true);
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
        setSuccessMessage('레시피가 업데이트되었습니다.');
        setSuccessModalVisible(true);
      }
      setIsEditMode(false);
    } catch (error) {
      console.error('레시피 저장 실패:', error);
      setErrorMessage('레시피 저장에 실패했습니다.');
      setErrorModalVisible(true);
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
      setErrorMessage('즐겨찾기 설정에 실패했습니다.');
      setErrorModalVisible(true);
    }
  };

  const modalState: RecipeModalState = {
    errorMessage,
    successMessage,
    errorModalVisible,
    successModalVisible,
    setErrorModalVisible,
    setSuccessModalVisible,
  };

  return {
    isLoading,
    isFavorite,
    isEditMode,
    modalState,
    currentRecipe,
    handleSave,
    setIsEditMode,
    getStepsArray,
    toggleFavorite,
    setCurrentRecipe,
    getIngredientsArray,
  };
};
