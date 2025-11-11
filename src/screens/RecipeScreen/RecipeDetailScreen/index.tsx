import React, { useState, useCallback, useEffect } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecipeStackParamList, RecipeIngredient } from '../RecipeNavigator';
import { SharedRecipeStorage } from '../../../utils/AsyncStorageUtils';
import { AsyncStorageService } from '../../../services/AsyncStorageService';
import { FridgeWithRole } from '../../../types/permission';
import RecipeAPI from '../../../services/API/RecipeAPI'; // ✅ 추가
import { Header } from '../../../components/RecipeDetail/Header';
import { SharedRecipeIndicator } from '../../../components/RecipeDetail/RecipeDetail';
import { RecipeTitleSection } from '../../../components/RecipeDetail/RecipeDetail';
import { StepsSection } from '../../../components/RecipeDetail/RecipeDetail';
import { ReferenceUrlSection } from '../../../components/RecipeDetail/RecipeDetail';
import { RecipeActionButtons } from '../../../components/RecipeDetail/RecipeDetail';
import { UseRecipeModal } from '../../../components/RecipeDetail/RecipeDetail';
import { ShareRecipeModal } from '../../../components/RecipeDetail/RecipeDetail';
import ConfirmModal from '../../../components/modals/ConfirmModal';
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
        id: 0,
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
        id: 0,
        title: '',
        createdAt: new Date().toISOString().split('T')[0],
        ingredients: [],
        steps: [],
        referenceUrl: '',
      };
    }
  };

  // ✅ state 선언 (useRecipeDetail 대체)
  const [currentRecipe, setCurrentRecipe] = useState(getInitialRecipe());
  const [isEditMode, setIsEditMode] = useState(isNewRecipe || isEditing);
  const [isFavorite, setIsFavorite] = useState(recipe?.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);

  console.log('🔍 isNewRecipe:', isNewRecipe);
  console.log('🔍 isEditing:', isEditing);
  console.log('🔍 isEditMode:', isEditMode); // ← 이게 true여야 해요!
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
    noIngredientsVisible: false,
    userNotFoundVisible: false,
    fridgeLoadErrorVisible: false,
    shareErrorVisible: false,
    selectIngredientsVisible: false,
    shareSuccessVisible: false,
    noFridgesVisible: false,
    noSelectedFridgesVisible: false,
    alreadySharedVisible: false,
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

  // RecipeDetailScreen에 useEffect 추가
  useEffect(() => {
    const loadRecipeDetail = async () => {
      // 새 레시피가 아니고 ID가 있으면 상세 정보 로드
      if (!isNewRecipe && currentRecipe.id) {
        try {
          setIsLoading(true);
          console.log('상세 레시피 로드:', currentRecipe.id);

          const detailRecipe = await RecipeAPI.getRecipeDetail(
            parseInt(currentRecipe.id),
          );
          setCurrentRecipe(detailRecipe);

          console.log('로드된 상세 레시피:', detailRecipe);
        } catch (error) {
          console.error('레시피 상세 로드 실패:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadRecipeDetail();
  }, [currentRecipe.id, isNewRecipe]);

  // ✅ 유틸 함수들 추가
  const getStepsArray = (steps: any): string[] => {
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

  const getIngredientsArray = (ingredients: any) => {
    if (!ingredients || !Array.isArray(ingredients)) return [];
    return ingredients;
  };

  // ✅ handleSave 함수 (API 연동)
  // RecipeDetailScreen의 handleSave 함수만 수정
  const handleSave = async () => {
    if (!currentRecipe.title.trim()) {
      Alert.alert('오류', '레시피 제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      if (isNewRecipe) {
        // ... 새 레시피 생성 로직 동일
      } else {
        // 기존 레시피 수정
        const updateData = {
          title: currentRecipe.title,
          ingredients: getIngredientsArray(currentRecipe.ingredients).map(
            ing => ({
              name: ing.name || ing.ingredientName || '',
              quantity: ing.quantity || 0,
              unit: ing.unit || '',
            }),
          ),
          steps: currentRecipe.steps, // 배열 그대로 전달
          referenceUrl: currentRecipe.referenceUrl || '',
        };

        console.log('🔥 레시피 수정 데이터:', updateData);
        console.log(
          '🔥 현재 레시피 ID 타입:',
          typeof currentRecipe.id,
          currentRecipe.id,
        );

        const updatedRecipe = await RecipeAPI.updateRecipe(
          currentRecipe.id, // string으로 전달
          updateData,
        );

        console.log('🔥 업데이트된 레시피:', updatedRecipe);
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

  // ✅ 즐겨찾기 토글 (API 연동)
  const toggleFavorite = async () => {
    if (!currentRecipe.id) {
      Alert.alert('알림', '저장된 레시피만 즐겨찾기할 수 있습니다.');
      return;
    }

    try {
      console.log('⭐ 즐겨찾기 토글:', currentRecipe.id);
      const result = await RecipeAPI.toggleFavorite(currentRecipe.id);
      setIsFavorite(result.favorite);
      console.log('✅ 즐겨찾기 상태:', result.favorite);
    } catch (error: any) {
      console.error('❌ 즐겨찾기 토글 실패:', error);
      Alert.alert('오류', '즐겨찾기 설정에 실패했습니다.');
    }
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
      id: Date.now(),
      name: '',
      quantity: 0,
      unit: '',
    };
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), newIngredient],
    }));
  };

  const removeIngredient = (id: number) => {
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter(ing => ing.id !== id) || [],
    }));
  };

  const updateIngredient = (
    id: number,
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
    console.log('🔥 addStep 호출됨!');

    setCurrentRecipe(prev => {
      const currentSteps = Array.isArray(prev.steps) ? prev.steps : [];

      // 빈 문자열 추가하되, 기존 배열을 완전히 새로 만들기
      const newSteps = [...currentSteps, ''];

      return {
        ...prev,
        steps: newSteps,
      };
    });
  };
  const removeStep = (index: number) => {
    const currentSteps = getStepsArray(currentRecipe.steps);
    setCurrentRecipe(prev => ({
      ...prev,
      steps: currentSteps.filter((_, i) => i !== index),
    }));
  };

  const updateStep = (index: number, value: string) => {
    setCurrentRecipe(prev => {
      // getStepsArray 사용하지 말고 직접 배열 복사
      const currentSteps = Array.isArray(prev.steps) ? [...prev.steps] : [];
      currentSteps[index] = value;

      return {
        ...prev,
        steps: currentSteps,
      };
    });
  };
  // RecipeDetailScreen에 추가
  const getCleanedSteps = (steps: string[]): string[] => {
    if (!Array.isArray(steps)) return [];

    return steps.map(step => {
      // "1. ", "2. " 등의 패턴 제거
      return step.replace(/^\d+\.\s*/, '').trim();
    });
  };
  // 냉장고 관리로 이동
  const navigateToFridgeManagement = () => {
    navigation.navigate('SharedFolder' as any);
  };

  // ✅ 레시피 공유 (API 연동)
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
      console.log('🔍 Current User ID:', currentUserId);

      if (!currentUserId) {
        modalHandlers.setUserNotFoundVisible(true);
        return;
      }

      const currentUser = await AsyncStorageService.getUserById(currentUserId);
      console.log('🔍 Current User:', currentUser);

      if (!currentUser) {
        modalHandlers.setUserNotFoundVisible(true);
        return;
      }

      const userFridgeList = await AsyncStorageService.getUserRefrigerators(
        parseInt(currentUser.id, 10),
      );

      console.log('🔍 User Fridge List:', userFridgeList);

      const fridges: CheckableFridge[] = userFridgeList.map(
        (fridge: FridgeWithRole) => ({
          id: fridge.id,
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

  // ✅ 레시피 공유 실행 (API 연동)
  const shareToSelectedFridges = async () => {
    const selectedFridges = checkableFridges.filter(fridge => fridge.isChecked);

    if (selectedFridges.length === 0) {
      modalHandlers.setNoSelectedFridgesVisible(true);
      return;
    }

    try {
      let successCount = 0;

      // ✅ 각 냉장고에 API로 공유
      for (const fridge of selectedFridges) {
        try {
          await RecipeAPI.shareRecipe(
            fridge.id,
            parseInt(currentRecipe.id.toString(), 10),
          );
          successCount++;
          console.log(`✅ 냉장고 ${fridge.id}에 공유 성공`);
        } catch (error: any) {
          // 이미 공유된 경우 무시
          if (error.message?.includes('이미')) {
            console.log(`⚠️ 냉장고 ${fridge.id}에 이미 공유됨`);
          } else {
            console.error(`❌ 냉장고 ${fridge.id} 공유 실패:`, error);
          }
        }
      }

      if (successCount > 0) {
        setModals(prev => ({
          ...prev,
          modalTitle: '공유 완료',
          modalMessage: `${successCount}개의 냉장고에 레시피가 공유되었습니다.`,
          shareSuccessCount: successCount,
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

  const toggleIngredientCheck = (id: number) => {
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
              recipeId={parseInt(currentRecipe.id.toString(), 10)} // string -> number 변환
              onUseRecipe={navigateToUseRecipe}
              onShare={openShareModal}
            />
          )}

          <IngredientsSection
            ingredients={getIngredientsArray(currentRecipe.ingredients)}
            isEditMode={isEditMode}
            fridgeId={fridgeId}
            onAddIngredient={addIngredient}
            onRemoveIngredient={removeIngredient}
            onUpdateIngredient={updateIngredient}
            onEnhancedIngredientsChange={handleEnhancedIngredientsChange}
          />

          <StepsSection
            steps={getCleanedSteps(
              Array.isArray(currentRecipe.steps) ? currentRecipe.steps : [],
            )}
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

        <UseRecipeModal
          visible={showUseRecipeModal}
          ingredients={checkableIngredients}
          onClose={() => setShowUseRecipeModal(false)}
          onToggleIngredient={toggleIngredientCheck}
          onDeleteCheckedIngredients={deleteCheckedIngredients}
        />

        <ShareRecipeModal
          visible={showShareModal}
          fridges={checkableFridges}
          onClose={() => setShowShareModal(false)}
          onToggleFridge={toggleFridgeCheck}
          onShareToSelectedFridges={shareToSelectedFridges}
        />

        {/* 모달들 */}
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
          onConfirm={() => modalHandlers.setAlreadySharedVisible(true)}
          onCancel={() => modalHandlers.setAlreadySharedVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RecipeDetailScreen;
