import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecipeStackParamList, RecipeIngredient } from '../RecipeNavigator';
import { SharedRecipeStorage } from '../../../utils/AsyncStorageUtils';
import { AsyncStorageService } from '../../../services/AsyncStorageService';
import { FridgeWithRole } from '../../../types/permission';
import RecipeAPI from '../../../services/API/RecipeAPI';
import { PermissionAPIService } from '../../../services/API/permissionAPI'; // 👈 추가
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
    fridgeName,
    currentFridgeId,
    aiGeneratedData,
    isSharedRecipe = false,
  } = route.params;

  console.log('🔍 ===== RecipeDetailScreen 진입 =====');
  console.log('🔍 route.params:', route.params);
  console.log('🔍 isSharedRecipe:', isSharedRecipe);
  console.log('🔍 fridgeId:', fridgeId);
  console.log('🔍 =====================================');

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
      return {
        ...recipe,
        ingredients:
          recipe.ingredients?.map((ing, index) => ({
            ...ing,
            id: `init_${recipe.id}_${index}`,
          })) || [],
      };
    } else {
      return {
        id: 0,
        title: '',
        createdAt: new Date().toISOString().split('T')[0],
        ingredients: [
          {
            id: parseInt(`new_${Math.random().toString(36).substr(2, 9)}`, 10),
            name: '',
            quantity: 0,
            unit: '',
          },
        ],
        steps: [''],
        referenceUrl: '',
      };
    }
  };

  const [currentRecipe, setCurrentRecipe] = useState(getInitialRecipe());
  const [isEditMode, setIsEditMode] = useState(isNewRecipe || isEditing);
  const [isFavorite, setIsFavorite] = useState(recipe?.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);

  // 👇 권한 상태 추가
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

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
    noTitleVisible: false,
    saveSuccessVisible: false,
    saveErrorVisible: false,
    updateSuccessVisible: false,
    updateErrorVisible: false,
    favoriteOnlyForSavedVisible: false,
    favoriteErrorVisible: false,
    shareOnlyPersonalVisible: false,
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
    setNoTitleVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, noTitleVisible: visible })),
    setSaveSuccessVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, saveSuccessVisible: visible })),
    setSaveErrorVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, saveErrorVisible: visible })),
    setUpdateSuccessVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, updateSuccessVisible: visible })),
    setUpdateErrorVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, updateErrorVisible: visible })),
    setFavoriteOnlyForSavedVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, favoriteOnlyForSavedVisible: visible })),
    setFavoriteErrorVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, favoriteErrorVisible: visible })),
    setShareOnlyPersonalVisible: (visible: boolean) =>
      setModals(prev => ({ ...prev, shareOnlyPersonalVisible: visible })),
  };

  // 레시피 상세 로드
  useEffect(() => {
    const loadRecipeDetail = async () => {
      if (!isNewRecipe && currentRecipe.id) {
        try {
          setIsLoading(true);
          console.log('상세 레시피 로드:', currentRecipe.id);

          const detailRecipe = await RecipeAPI.getRecipeDetail(
            currentRecipe.id,
          );
          setCurrentRecipe(detailRecipe);

          console.log('로드된 상세 레시피:', detailRecipe);
        } catch (error) {
          // console.error('레시피 상세 로드 실패:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadRecipeDetail();
  }, [currentRecipe.id, isNewRecipe]);

  // 👇 권한 확인 useEffect - PermissionAPIService 사용
  // RecipeDetailScreen.tsx
  useEffect(() => {
    const checkPermissions = async () => {
      // 개인 레시피 - 모든 권한
      if (!isSharedRecipe) {
        console.log('✅ 개인 레시피 - 전체 권한');
        setCanEdit(true);
        setCanDelete(true);
        return;
      }

      // 공유 레시피인데 fridgeId가 없으면 권한 없음
      if (!fridgeId) {
        console.log('⚠️ 공유 레시피인데 fridgeId 없음');
        setCanEdit(false);
        setCanDelete(false);
        return;
      }

      // PermissionAPI로 권한 확인
      try {
        console.log(`🔍 냉장고 ${fridgeId} 권한 조회 시작...`);
        const permissions = await PermissionAPIService.getFridgePermissions(
          Number(fridgeId),
        );

        console.log('✅ 권한 조회 결과:', permissions);

        // 👇 공유 레시피 정책:
        // - 수정: 항상 불가
        // - 삭제: 방장만 가능 (canDelete || canEdit === true면 방장)
        const isOwner = permissions.canEdit || permissions.canDelete;

        setCanEdit(false); // 공유 레시피는 무조건 수정 불가
        setCanDelete(isOwner); // 방장만 삭제 가능

        console.log('✅ 최종 권한 설정:', {
          isOwner,
          canEdit: false,
          canDelete: isOwner,
        });
      } catch (error) {
        // console.error('❌ 권한 확인 실패:', error);
        setCanEdit(false);
        setCanDelete(false);
      }
    };

    checkPermissions();
  }, [isSharedRecipe, fridgeId]);
  // 👇 디버깅 로그
  console.log('🔍 권한 정보:', {
    isSharedRecipe,
    fridgeId,
    canEdit,
    canDelete,
  });

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

  const handleSave = async () => {
    if (!currentRecipe.title.trim()) {
      modalHandlers.setNoTitleVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isNewRecipe) {
        const createData = {
          title: currentRecipe.title,
          ingredients: getIngredientsArray(currentRecipe.ingredients)
            .filter(ing => ing.name && ing.name.trim())
            .map(ing => ({
              ingredientName: ing.name || '',
              quantity: Number(ing.quantity) || 0,
              unit: ing.unit || '',
            })),
          steps: Array.isArray(currentRecipe.steps)
            ? currentRecipe.steps.join('\n')
            : currentRecipe.steps || '',
          referenceUrl: currentRecipe.referenceUrl || '',
        };

        console.log('🔥 새 레시피 생성 데이터:', createData);

        const savedRecipe = await RecipeAPI.createRecipe(createData);

        console.log('✅ 저장된 레시피:', savedRecipe);

        setCurrentRecipe({
          id: savedRecipe.id,
          title: savedRecipe.title,
          createdAt:
            savedRecipe.createdAt || new Date().toISOString().split('T')[0],
          ingredients: (savedRecipe.ingredients || []).map(ing => ({
            id: ing.id,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
          steps: Array.isArray(savedRecipe.steps)
            ? savedRecipe.steps
            : typeof savedRecipe.steps === 'string'
            ? savedRecipe.steps.split('\n')
            : [],
          referenceUrl: savedRecipe.referenceUrl || '',
        });

        modalHandlers.setSaveSuccessVisible(true);
      } else {
        const updateData = {
          title: currentRecipe.title,
          ingredients: getIngredientsArray(currentRecipe.ingredients).map(
            ing => ({
              name: ing.name || ing.ingredientName || '',
              quantity: ing.quantity || 0,
              unit: ing.unit || '',
            }),
          ),
          steps: currentRecipe.steps,
          referenceUrl: currentRecipe.referenceUrl || '',
        };

        const updatedRecipe = await RecipeAPI.updateRecipe(
          currentRecipe.id,
          updateData,
        );

        setCurrentRecipe(updatedRecipe);
        modalHandlers.setUpdateSuccessVisible(true);
      }
      setIsEditMode(false);
    } catch (error) {
      // console.error('레시피 저장 실패:', error);
      if (isNewRecipe) {
        modalHandlers.setSaveErrorVisible(true);
      } else {
        modalHandlers.setUpdateErrorVisible(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!currentRecipe.id) {
      modalHandlers.setFavoriteOnlyForSavedVisible(true);
      return;
    }

    try {
      console.log('⭐ 즐겨찾기 토글:', currentRecipe.id);
      const result = await RecipeAPI.toggleFavorite(currentRecipe.id);
      setIsFavorite(result.favorite);
      console.log('✅ 즐겨찾기 상태:', result.favorite);
    } catch (error: any) {
      // console.error('❌ 즐겨찾기 토글 실패:', error);
      modalHandlers.setFavoriteErrorVisible(true);
    }
  };

  const handleEnhancedIngredientsChange = useCallback(
    (ingredients: EnhancedIngredient[]) => {
      setEnhancedIngredients(ingredients);
    },
    [],
  );

  const targetFridgeId = currentFridgeId || fridgeId;

  const navigateToUseRecipe = () => {
    if (!currentRecipe.ingredients || currentRecipe.ingredients.length === 0) {
      modalHandlers.setNoIngredientsVisible(true);
      return;
    }

    console.log('🔍 RecipeDetail 냉장고 정보:', {
      fridgeId,
      currentFridgeId,
      targetFridgeId,
    });

    navigation.navigate('UseRecipe', {
      recipe: currentRecipe,
      fridgeId: targetFridgeId,
      enhancedIngredients: enhancedIngredients,
    });
  };

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
      const currentSteps = Array.isArray(prev.steps) ? [...prev.steps] : [];
      currentSteps[index] = value;

      return {
        ...prev,
        steps: currentSteps,
      };
    });
  };

  const getCleanedSteps = (steps: string[]): string[] => {
    if (!Array.isArray(steps)) return [];

    return steps.map(step => {
      return step.replace(/^\d+\.\s*/, '').trim();
    });
  };

  const navigateToFridgeManagement = () => {
    navigation.navigate('SharedFolder' as any);
  };

  const openShareModal = async () => {
    if (!currentRecipe.id || isSharedRecipe) {
      modalHandlers.setShareOnlyPersonalVisible(true);
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
        currentUser.id,
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
      // console.error('냉장고 목록 로드 실패:', error);
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
      let successCount = 0;

      for (const fridge of selectedFridges) {
        try {
          await RecipeAPI.shareRecipe(fridge.id, currentRecipe.id);
          successCount++;
          console.log(`✅ 냉장고 ${fridge.id}에 공유 성공`);
        } catch (error: any) {
          if (error.message?.includes('이미')) {
            console.log(`⚠️ 냉장고 ${fridge.id}에 이미 공유됨`);
          } else {
            // console.error(`❌ 냉장고 ${fridge.id} 공유 실패:`, error);
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
      // console.error('레시피 공유 실패:', error);
      modalHandlers.setShareErrorVisible(true);
    }
  };

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
          canEdit={canEdit} // 👈 상태값 사용
          canDelete={canDelete} // 👈 상태값 사용
          onGoBack={() => navigation.goBack()}
          onSave={handleSave}
          onToggleFavorite={toggleFavorite}
          onEdit={() => setIsEditMode(true)}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isSharedRecipe && <SharedRecipeIndicator sharedBy={fridgeName} />}

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
              recipeId={currentRecipe.id}
              currentFridgeId={targetFridgeId}
              onUseRecipe={navigateToUseRecipe}
            />
          )}

          <IngredientsSection
            ingredients={getIngredientsArray(currentRecipe.ingredients)}
            isEditMode={isEditMode}
            isNewRecipe={isNewRecipe}
            fridgeId={targetFridgeId}
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

        {/* 기존 모달들 */}
        <ConfirmModal
          isAlert={false}
          visible={modals.noIngredientsVisible}
          title="알림"
          message="이 레시피에는 재료 정보가 없습니다."
          iconContainer={{ backgroundColor: '#e8f5e9' }}
          icon={{
            name: 'error-outline',
            color: 'rgba(47, 72, 88, 1)',
            size: 48,
          }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="general"
          onConfirm={() => modalHandlers.setNoIngredientsVisible(false)}
          onCancel={() => modalHandlers.setNoIngredientsVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.userNotFoundVisible}
          title="오류"
          message="사용자 정보를 찾을 수 없습니다."
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
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
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
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
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
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
          iconContainer={{ backgroundColor: '#e8f5e9' }}
          icon={{
            name: 'error-outline',
            color: 'rgba(47, 72, 88, 1)',
            size: 48,
          }}
          confirmText="취소"
          cancelText="삭제"
          confirmButtonStyle="general"
          onConfirm={() => modalHandlers.setSelectIngredientsVisible(false)}
          onCancel={() => modalHandlers.setSelectIngredientsVisible(false)}
        />

        <ConfirmModal
          isAlert={true}
          visible={modals.noSelectedFridgesVisible}
          title="알림"
          message="공유할 냉장고를 선택해주세요."
          iconContainer={{ backgroundColor: '#e8f5e9' }}
          icon={{
            name: 'error-outline',
            color: 'rgba(47, 72, 88, 1)',
            size: 48,
          }}
          confirmText="취소"
          cancelText="공유하기"
          confirmButtonStyle="general"
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
          iconContainer={{ backgroundColor: '#e8f5e9' }}
          icon={{ name: 'info', color: 'rgba(47, 72, 88, 1)', size: 48 }}
          confirmText="냉장고 관리"
          cancelText="확인"
          confirmButtonStyle="general"
          onConfirm={navigateToFridgeManagement}
          onCancel={() => modalHandlers.setNoFridgesVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.alreadySharedVisible}
          title="알림"
          message="선택한 냉장고에 이미 공유된 레시피입니다."
          iconContainer={{ backgroundColor: '#e8f5e9' }}
          icon={{ name: 'info', color: 'rgba(47, 72, 88, 1)', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="general"
          onConfirm={() => modalHandlers.setAlreadySharedVisible(false)}
          onCancel={() => modalHandlers.setAlreadySharedVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.noTitleVisible}
          title="오류"
          message="레시피 제목을 입력해주세요."
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => modalHandlers.setNoTitleVisible(false)}
          onCancel={() => modalHandlers.setNoTitleVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.saveSuccessVisible}
          title="성공"
          message="레시피가 저장되었습니다."
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'check', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => modalHandlers.setSaveSuccessVisible(false)}
          onCancel={() => modalHandlers.setSaveSuccessVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.saveErrorVisible}
          title="오류"
          message="레시피 저장에 실패했습니다."
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => modalHandlers.setSaveErrorVisible(false)}
          onCancel={() => modalHandlers.setSaveErrorVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.updateSuccessVisible}
          title="성공"
          message="레시피가 업데이트되었습니다."
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'check', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => modalHandlers.setUpdateSuccessVisible(false)}
          onCancel={() => modalHandlers.setUpdateSuccessVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.updateErrorVisible}
          title="오류"
          message="레시피 업데이트에 실패했습니다."
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => modalHandlers.setUpdateErrorVisible(false)}
          onCancel={() => modalHandlers.setUpdateErrorVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.favoriteOnlyForSavedVisible}
          title="알림"
          message="저장된 레시피만 즐겨찾기할 수 있습니다."
          iconContainer={{ backgroundColor: '#e8f5e9' }}
          icon={{ name: 'info', color: 'rgba(47, 72, 88, 1)', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="general"
          onConfirm={() => modalHandlers.setFavoriteOnlyForSavedVisible(false)}
          onCancel={() => modalHandlers.setFavoriteOnlyForSavedVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.favoriteErrorVisible}
          title="오류"
          message="즐겨찾기 설정에 실패했습니다."
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => modalHandlers.setFavoriteErrorVisible(false)}
          onCancel={() => modalHandlers.setFavoriteErrorVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={modals.shareOnlyPersonalVisible}
          title="오류"
          message="저장된 개인 레시피만 공유할 수 있습니다."
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => modalHandlers.setShareOnlyPersonalVisible(false)}
          onCancel={() => modalHandlers.setShareOnlyPersonalVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RecipeDetailScreen;
