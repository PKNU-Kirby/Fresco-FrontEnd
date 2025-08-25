import React, { useState } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecipeStackParamList, RecipeIngredient } from '../RecipeNavigator';
import MockDataService from '../../../utils/MockDataService';
import { SharedRecipeStorage } from '../../../utils/AsyncStorageUtils';
import { useRecipeDetail } from '../../../components/RecipeDetail/RecipeDetail';
import { Header } from '../../../components/RecipeDetail/Header';
import { SharedRecipeIndicator } from '../../../components/RecipeDetail/RecipeDetail';
import { RecipeTitleSection } from '../../../components/RecipeDetail/RecipeDetail';
import { IngredientsSection } from '../../../components/RecipeDetail/RecipeDetail';
import { StepsSection } from '../../../components/RecipeDetail/RecipeDetail';
import { ReferenceUrlSection } from '../../../components/RecipeDetail/RecipeDetail';
import { RecipeActionButtons } from '../../../components/RecipeDetail/RecipeDetail';
import { UseRecipeModal } from '../../../components/RecipeDetail/RecipeDetail';
import { ShareRecipeModal } from '../../../components/RecipeDetail/RecipeDetail';
import { styles } from './styles';

interface CheckableIngredient extends RecipeIngredient {
  isChecked: boolean;
}

interface CheckableFridge {
  id: number;
  name: string;
  isChecked: boolean;
}

type RecipeDetailScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'RecipeDetail'
>;
type RecipeDetailScreenRouteProp = RouteProp<
  RecipeStackParamList,
  'RecipeDetail'
>;

const RecipeDetailScreen: React.FC = () => {
  const navigation = useNavigation<RecipeDetailScreenNavigationProp>();
  const route = useRoute<RecipeDetailScreenRouteProp>();

  const {
    recipe,
    isEditing = false,
    isNewRecipe = false,
    fridgeId,
    fridgeName,
    aiGeneratedData,
  } = route.params;

  // 초기 레시피 데이터 생성
  const getInitialRecipe = () => {
    if (aiGeneratedData) {
      return {
        id: '',
        title: aiGeneratedData.title || '',
        createdAt: new Date().toISOString().split('T')[0],
        ingredients: aiGeneratedData.ingredients || [],
        steps: aiGeneratedData.steps || [],
        referenceUrl: aiGeneratedData.referenceUrl || '',
      };
    } else if (recipe) {
      return recipe;
    } else {
      return {
        id: '',
        title: '',
        createdAt: new Date().toISOString().split('T')[0],
        ingredients: [],
        steps: [],
        referenceUrl: '',
      };
    }
  };

  // 커스텀 훅 사용
  const {
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
  } = useRecipeDetail(
    getInitialRecipe(),
    isNewRecipe,
    isEditing,
    aiGeneratedData,
  );

  // 모달 상태
  const [showUseRecipeModal, setShowUseRecipeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [checkableIngredients, setCheckableIngredients] = useState<
    CheckableIngredient[]
  >([]);
  const [checkableFridges, setCheckableFridges] = useState<CheckableFridge[]>(
    [],
  );

  const isSharedRecipe = currentRecipe.isShared || false;

  // 레시피 관련 함수들
  const addIngredient = () => {
    const newIngredient: RecipeIngredient = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
      unit: '',
    };
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), newIngredient],
    }));
  };

  const removeIngredient = (id: string) => {
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter(ing => ing.id !== id) || [],
    }));
  };

  const updateIngredient = (
    id: string,
    field: keyof RecipeIngredient,
    value: string,
  ) => {
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients:
        prev.ingredients?.map(ing =>
          ing.id === id ? { ...ing, [field]: value } : ing,
        ) || [],
    }));
  };

  const addStep = () => {
    const currentSteps = getStepsArray(currentRecipe.steps);
    setCurrentRecipe(prev => ({
      ...prev,
      steps: [...currentSteps, ''],
    }));
  };

  const removeStep = (index: number) => {
    const currentSteps = getStepsArray(currentRecipe.steps);
    setCurrentRecipe(prev => ({
      ...prev,
      steps: currentSteps.filter((_, i) => i !== index),
    }));
  };

  const updateStep = (index: number, value: string) => {
    const currentSteps = getStepsArray(currentRecipe.steps);
    setCurrentRecipe(prev => ({
      ...prev,
      steps: currentSteps.map((step, i) => (i === index ? value : step)),
    }));
  };

  // UseRecipeScreen으로 네비게이션
  const navigateToUseRecipe = () => {
    if (!currentRecipe.ingredients || currentRecipe.ingredients.length === 0) {
      Alert.alert('알림', '이 레시피에는 재료 정보가 없습니다.');
      return;
    }
    navigation.navigate('UseRecipe', {
      recipe: currentRecipe,
      fridgeId: fridgeId,
      fridgeName: fridgeName,
    });
  };

  // 모달 관련 함수들은 기존과 동일하게 유지...
  const openShareModal = async () => {
    if (!currentRecipe.id || isSharedRecipe) {
      Alert.alert('오류', '저장된 개인 레시피만 공유할 수 있습니다.');
      return;
    }
    try {
      const currentUserId = 1;
      const userFridgeList = await MockDataService.getUserFridges(
        currentUserId,
      );
      const fridges: CheckableFridge[] = userFridgeList.map(fridge => ({
        id: fridge.refrigeratorId,
        name: fridge.name,
        isChecked: false,
      }));

      if (fridges.length === 0) {
        Alert.alert(
          '알림',
          '참여 중인 냉장고가 없습니다.\n냉장고에 참여한 후 레시피를 공유해보세요.',
        );
        return;
      }
      setCheckableFridges(fridges);
      setShowShareModal(true);
    } catch (error) {
      console.error('냉장고 목록 로드 실패:', error);
      Alert.alert('오류', '냉장고 목록을 불러올 수 없습니다.');
    }
  };

  const toggleFridgeCheck = (id: number) => {
    setCheckableFridges(prev =>
      prev.map(fridge =>
        fridge.id === id ? { ...fridge, isChecked: !fridge.isChecked } : fridge,
      ),
    );
  };

  const shareToSelectedFridges = async () => {
    const selectedFridges = checkableFridges.filter(fridge => fridge.isChecked);
    if (selectedFridges.length === 0) {
      Alert.alert('알림', '공유할 냉장고를 선택해주세요.');
      return;
    }

    try {
      const currentSharedRecipes = await SharedRecipeStorage.getSharedRecipes();
      let newRecipesAdded = 0;

      for (const fridge of selectedFridges) {
        const sharedRecipe = {
          ...currentRecipe,
          id: `shared-${fridge.id}-${currentRecipe.id}-${Date.now()}`,
          isShared: true,
          sharedBy: '나',
        };

        const alreadyShared = currentSharedRecipes.some(
          sr =>
            sr.title === currentRecipe.title &&
            sr.id.includes(`-${fridge.id}-`),
        );

        if (!alreadyShared) {
          currentSharedRecipes.unshift(sharedRecipe);
          newRecipesAdded++;
        }
      }

      await SharedRecipeStorage.saveSharedRecipes(currentSharedRecipes);
      Alert.alert(
        '공유 완료',
        `${newRecipesAdded}개의 냉장고에 레시피가 새로 공유되었습니다.`,
      );
      setShowShareModal(false);
    } catch (error) {
      console.error('레시피 공유 실패:', error);
      Alert.alert('오류', '레시피 공유에 실패했습니다.');
    }
  };

  // UseRecipe 모달 관련 (기존 방식 유지 - 백업용)
  const openUseRecipeModal = () => {
    if (!currentRecipe.ingredients || currentRecipe.ingredients.length === 0) {
      Alert.alert('알림', '이 레시피에는 재료 정보가 없습니다.');
      return;
    }
    const ingredients: CheckableIngredient[] = currentRecipe.ingredients.map(
      ingredient => ({
        ...ingredient,
        isChecked: false,
      }),
    );
    setCheckableIngredients(ingredients);
    setShowUseRecipeModal(true);
  };

  const toggleIngredientCheck = (id: string) => {
    setCheckableIngredients(prev =>
      prev.map(ingredient =>
        ingredient.id === id
          ? { ...ingredient, isChecked: !ingredient.isChecked }
          : ingredient,
      ),
    );
  };

  const deleteCheckedIngredients = async () => {
    const checkedIngredients = checkableIngredients.filter(
      ingredient => ingredient.isChecked,
    );
    if (checkedIngredients.length === 0) {
      Alert.alert('알림', '삭제할 재료를 선택해주세요.');
      return;
    }
    // 기존 로직과 동일...
    Alert.alert('구현 중', '이 기능은 UseRecipeScreen에서 구현됩니다.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <Header
          isEditMode={isEditMode}
          isNewRecipe={isNewRecipe}
          isSharedRecipe={isSharedRecipe}
          isFavorite={isFavorite}
          isLoading={isLoading}
          onGoBack={() => navigation.goBack()}
          onSave={handleSave}
          onToggleFavorite={toggleFavorite}
          onEdit={() => setIsEditMode(true)}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Shared Recipe Indicator */}
          {isSharedRecipe && (
            <SharedRecipeIndicator sharedBy={currentRecipe.sharedBy} />
          )}

          {/* Recipe Title */}
          <RecipeTitleSection
            title={currentRecipe.title}
            isEditMode={isEditMode}
            onTitleChange={text =>
              setCurrentRecipe(prev => ({ ...prev, title: text }))
            }
          />

          {/* Ingredients */}
          <IngredientsSection
            ingredients={getIngredientsArray(currentRecipe.ingredients)}
            isEditMode={isEditMode}
            onAddIngredient={addIngredient}
            onRemoveIngredient={removeIngredient}
            onUpdateIngredient={updateIngredient}
          />

          {/* Steps */}
          <StepsSection
            steps={getStepsArray(currentRecipe.steps)}
            isEditMode={isEditMode}
            onAddStep={addStep}
            onRemoveStep={removeStep}
            onUpdateStep={updateStep}
          />

          {/* Reference URL */}
          <ReferenceUrlSection
            url={currentRecipe.referenceUrl}
            isEditMode={isEditMode}
            onUrlChange={text =>
              setCurrentRecipe(prev => ({ ...prev, referenceUrl: text }))
            }
          />

          {/* Action Buttons */}
          {!isEditMode && currentRecipe.id && (
            <RecipeActionButtons
              isSharedRecipe={isSharedRecipe}
              onUseRecipe={navigateToUseRecipe}
              onShare={openShareModal}
            />
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Use Recipe Modal */}
        <UseRecipeModal
          visible={showUseRecipeModal}
          ingredients={checkableIngredients}
          onClose={() => setShowUseRecipeModal(false)}
          onToggleIngredient={toggleIngredientCheck}
          onDeleteCheckedIngredients={deleteCheckedIngredients}
        />

        {/* Share Recipe Modal */}
        <ShareRecipeModal
          visible={showShareModal}
          fridges={checkableFridges}
          onClose={() => setShowShareModal(false)}
          onToggleFridge={toggleFridgeCheck}
          onShareToSelectedFridges={shareToSelectedFridges}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RecipeDetailScreen;
