import React, { useState, useCallback } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecipeStackParamList, RecipeIngredient } from '../RecipeNavigator';
import { SharedRecipeStorage } from '../../../utils/AsyncStorageUtils';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../../../services/AsyncStorageService';
import { useRecipeDetail } from '../../../components/RecipeDetail/RecipeDetail';
import { Header } from '../../../components/RecipeDetail/Header';
import { SharedRecipeIndicator } from '../../../components/RecipeDetail/RecipeDetail';
import { RecipeTitleSection } from '../../../components/RecipeDetail/RecipeDetail';
import { StepsSection } from '../../../components/RecipeDetail/RecipeDetail';
import { ReferenceUrlSection } from '../../../components/RecipeDetail/RecipeDetail';
import { RecipeActionButtons } from '../../../components/RecipeDetail/RecipeDetail';
import { UseRecipeModal } from '../../../components/RecipeDetail/RecipeDetail';
import { ShareRecipeModal } from '../../../components/RecipeDetail/RecipeDetail';
import ConfirmModal from '../../../components/Recipe/modals/ConfirmModal';
import { EnhancedIngredient } from '../../../hooks/Recipe/useIngredientMatching';
import { IngredientsSection } from '../../../components/RecipeDetail/IngredientsSection';
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

  // 기존 모달 상태
  const [showUseRecipeModal, setShowUseRecipeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [checkableIngredients, setCheckableIngredients] = useState<
    CheckableIngredient[]
  >([]);
  const [checkableFridges, setCheckableFridges] = useState<CheckableFridge[]>(
    [],
  );
  const [enhancedIngredients, setEnhancedIngredients] = useState<
    EnhancedIngredient[]
  >([]);

  // ConfirmModal 상태들
  const [modals, setModals] = useState({
    // 에러 모달들 (빨간색)
    noIngredientsVisible: false,
    userNotFoundVisible: false,
    fridgeLoadErrorVisible: false,
    shareErrorVisible: false,
    selectIngredientsVisible: false,

    // 성공/정보 모달들 (초록색)
    shareSuccessVisible: false,
    noFridgesVisible: false,
    noSelectedFridgesVisible: false,
    alreadySharedVisible: false,

    // 모달 메시지
    modalTitle: '',
    modalMessage: '',
    shareSuccessCount: 0,
  });

  const modalHandlers = {
    setNoIngredientsVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, noIngredientsVisible: visible })),
    setUserNotFoundVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, userNotFoundVisible: visible })),
    setFridgeLoadErrorVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, fridgeLoadErrorVisible: visible })),
    setShareErrorVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, shareErrorVisible: visible })),
    setSelectIngredientsVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, selectIngredientsVisible: visible })),
    setShareSuccessVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, shareSuccessVisible: visible })),
    setNoFridgesVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, noFridgesVisible: visible })),
    setNoSelectedFridgesVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, noSelectedFridgesVisible: visible })),
    setAlreadySharedVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, alreadySharedVisible: visible })),
  };

  const handleEnhancedIngredientsChange = useCallback(
    (ingredients: EnhancedIngredient[]) => {
      setEnhancedIngredients(ingredients);
    },
    [],
  );

  // UseRecipe 네비게이션 (향상된 재료 데이터 전달)
  const navigateToUseRecipe = () => {
    if (!currentRecipe.ingredients || currentRecipe.ingredients.length === 0) {
      modalHandlers.setNoIngredientsVisible(true);
      return;
    }

    navigation.navigate('UseRecipe', {
      recipe: currentRecipe,
      fridgeId: fridgeId,
      enhancedIngredients: enhancedIngredients,
    });
  };

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

  // 냉장고 관리로 이동
  const navigateToFridgeManagement = () => {
    navigation.navigate('SharedFolder' as any);
  };

  // 레시피 공유 모달 - AsyncStorageService 사용
  const openShareModal = async () => {
    if (!currentRecipe.id || isSharedRecipe) {
      setModals(prev => ({
        ...prev,
        modalTitle: '오류',
        modalMessage: '저장된 개인 레시피만 공유할 수 있습니다.',
        userNotFoundVisible: true,
      }));
      return;
    }

    try {
      const currentUserId = await AsyncStorageService.getCurrentUserId();
      if (!currentUserId) {
        modalHandlers.setUserNotFoundVisible(true);
        return;
      }

      const currentUser = await AsyncStorageService.getUserById(currentUserId);
      if (!currentUser) {
        modalHandlers.setUserNotFoundVisible(true);
        return;
      }

      const userFridgeList = await AsyncStorageService.getUserRefrigerators(
        parseInt(currentUser.id, 10),
      );

      const fridges: CheckableFridge[] = userFridgeList.map(
        (fridge: FridgeWithRole) => ({
          id: parseInt(fridge.id, 10),
          name: fridge.name,
          isChecked: false,
        }),
      );

      if (fridges.length === 0) {
        modalHandlers.setNoFridgesVisible(true);
        return;
      }

      setCheckableFridges(fridges);
      setShowShareModal(true);
    } catch (error) {
      console.error('냉장고 목록 로드 실패:', error);
      modalHandlers.setFridgeLoadErrorVisible(true);
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
      modalHandlers.setNoSelectedFridgesVisible(true);
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

      if (newRecipesAdded > 0) {
        setModals(prev => ({
          ...prev,
          modalTitle: '공유 완료',
          modalMessage: `${newRecipesAdded}개의 냉장고에 레시피가 새로 공유되었습니다.`,
          shareSuccessCount: newRecipesAdded,
          shareSuccessVisible: true,
        }));
      } else {
        modalHandlers.setAlreadySharedVisible(true);
      }

      setShowShareModal(false);
    } catch (error) {
      console.error('레시피 공유 실패:', error);
      modalHandlers.setShareErrorVisible(true);
    }
  };

  // UseRecipe 모달 관련 (기존 방식 유지 - 백업용)
  const openUseRecipeModal = () => {
    if (!currentRecipe.ingredients || currentRecipe.ingredients.length === 0) {
      modalHandlers.setNoIngredientsVisible(true);
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
      modalHandlers.setSelectIngredientsVisible(true);
      return;
    }
    // 실제 구현은 UseRecipeScreen에서
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
          {isSharedRecipe && (
            <SharedRecipeIndicator sharedBy={currentRecipe.sharedBy} />
          )}

          <RecipeTitleSection
            title={currentRecipe.title}
            isEditMode={isEditMode}
            onTitleChange={text =>
              setCurrentRecipe(prev => ({ ...prev, title: text }))
            }
          />

          {!isEditMode && currentRecipe.id && (
            <RecipeActionButtons
              isSharedRecipe={isSharedRecipe}
              onUseRecipe={navigateToUseRecipe}
              onShare={openShareModal}
            />
          )}

          <IngredientsSection
            ingredients={getIngredientsArray(currentRecipe.ingredients)}
            isEditMode={isEditMode}
            fridgeId={fridgeId ? parseInt(fridgeId.toString(), 10) : undefined}
            onAddIngredient={addIngredient}
            onRemoveIngredient={removeIngredient}
            onUpdateIngredient={updateIngredient}
            onEnhancedIngredientsChange={handleEnhancedIngredientsChange}
          />

          <StepsSection
            steps={getStepsArray(currentRecipe.steps)}
            isEditMode={isEditMode}
            onAddStep={addStep}
            onRemoveStep={removeStep}
            onUpdateStep={updateStep}
          />

          <ReferenceUrlSection
            url={currentRecipe.referenceUrl}
            isEditMode={isEditMode}
            onUrlChange={text =>
              setCurrentRecipe(prev => ({ ...prev, referenceUrl: text }))
            }
          />

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

        {/* ConfirmModal들 - 에러/경고 모달들 (빨간색) */}
        <ConfirmModal
          isAlert={false}
          visible={modals.noIngredientsVisible}
          title="알림"
          message="이 레시피에는 재료 정보가 없습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => modalHandlers.setNoIngredientsVisible(false)}
          onCancel={() => modalHandlers.setNoIngredientsVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.userNotFoundVisible}
          title="오류"
          message="사용자 정보를 찾을 수 없습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => modalHandlers.setUserNotFoundVisible(false)}
          onCancel={() => modalHandlers.setUserNotFoundVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.fridgeLoadErrorVisible}
          title="오류"
          message="냉장고 목록을 불러올 수 없습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => modalHandlers.setFridgeLoadErrorVisible(false)}
          onCancel={() => modalHandlers.setFridgeLoadErrorVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.shareErrorVisible}
          title="오류"
          message="레시피 공유에 실패했습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => modalHandlers.setShareErrorVisible(false)}
          onCancel={() => modalHandlers.setShareErrorVisible(false)}
        />

        <ConfirmModal
          isAlert={true}
          visible={modals.selectIngredientsVisible}
          title="알림"
          message="삭제할 재료를 선택해주세요."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="취소"
          cancelText="삭제"
          confirmButtonStyle="primary"
          onConfirm={() => modalHandlers.setSelectIngredientsVisible(false)}
          onCancel={() => modalHandlers.setSelectIngredientsVisible(false)}
        />

        <ConfirmModal
          isAlert={true}
          visible={modals.noSelectedFridgesVisible}
          title="알림"
          message="공유할 냉장고를 선택해주세요."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="취소"
          cancelText="공유하기"
          confirmButtonStyle="primary"
          onConfirm={() => modalHandlers.setNoSelectedFridgesVisible(false)}
          onCancel={() => modalHandlers.setNoSelectedFridgesVisible(false)}
        />

        {/* ConfirmModal들 - 성공/정보 모달들 (초록색) */}
        <ConfirmModal
          isAlert={false}
          visible={modals.shareSuccessVisible}
          title="공유 완료"
          message={`${modals.shareSuccessCount}개의 냉장고에 레시피가 새로 공유되었습니다.`}
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'check', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => modalHandlers.setShareSuccessVisible(false)}
          onCancel={() => modalHandlers.setShareSuccessVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.noFridgesVisible}
          title="알림"
          message="참여 중인 냉장고가 없습니다.\n냉장고에 참여한 후 레시피를 공유해보세요."
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'info', color: 'limegreen', size: 48 }}
          confirmText="냉장고 관리"
          cancelText="확인"
          confirmButtonStyle="primary"
          onConfirm={navigateToFridgeManagement}
          onCancel={() => modalHandlers.setNoFridgesVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.alreadySharedVisible}
          title="알림"
          message="선택한 냉장고에 이미 공유된 레시피입니다."
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'info', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => modalHandlers.setAlreadySharedVisible(false)}
          onCancel={() => modalHandlers.setAlreadySharedVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RecipeDetailScreen;
