import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {
  Recipe,
  RecipeStackParamList,
  RecipeIngredient,
} from '../../RecipeNavigator';
import {
  RecipeStorage,
  FavoriteStorage,
  SharedRecipeStorage,
} from '../../../../utils/AsyncStorageUtils';
import MockDataService from '../../../../utils/MockDataService';
import { styles } from './styles';

// 체크리스트용 타입 정의
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

interface RecipeDetailScreenProps {}

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = () => {
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

  // 🔧 Steps 안전 처리 함수
  const getStepsArray = (steps: string[] | string | undefined): string[] => {
    // steps가 없는 경우 빈 배열 반환
    if (!steps) {
      console.log('⚠️ recipe.steps가 없습니다:', steps);
      return [];
    }

    // 배열인 경우
    if (Array.isArray(steps)) {
      console.log('📋 steps가 배열입니다:', steps);
      return steps.filter(
        step => step && typeof step === 'string' && step.trim().length > 0,
      );
    }

    // 문자열인 경우
    if (typeof steps === 'string') {
      console.log('📋 steps가 문자열입니다:', steps);
      return steps
        .split('\n')
        .map(step => step.trim())
        .filter(step => step.length > 0);
    }

    // 그 외의 경우 (객체, 숫자 등)
    console.warn(
      '⚠️ recipe.steps가 예상치 못한 타입입니다:',
      typeof steps,
      steps,
    );
    return [];
  };

  // 🔧 Ingredients 안전 처리 함수
  const getIngredientsArray = (
    ingredients: RecipeIngredient[] | undefined,
  ): RecipeIngredient[] => {
    if (!ingredients) return [];
    if (Array.isArray(ingredients)) return ingredients;
    return [];
  };

  // AI 데이터/기존 레시피 데이터로 초기화
  const getInitialRecipe = (): Recipe => {
    if (aiGeneratedData) {
      return {
        id: '',
        title: aiGeneratedData.title || '',
        description: aiGeneratedData.description || '',
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
        description: '',
        createdAt: new Date().toISOString().split('T')[0],
        ingredients: [],
        steps: [],
        referenceUrl: '',
      };
    }
  };

  // 상태 관리
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(
    getInitialRecipe(),
  );
  const [isEditMode, setIsEditMode] = useState(
    isEditing || isNewRecipe || !!aiGeneratedData,
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 모달 상태
  const [showUseRecipeModal, setShowUseRecipeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [checkableIngredients, setCheckableIngredients] = useState<
    CheckableIngredient[]
  >([]);
  const [checkableFridges, setCheckableFridges] = useState<CheckableFridge[]>(
    [],
  );

  // 공유된 레시피인지 확인하는 helper 함수
  const isSharedRecipe = currentRecipe.isShared || false;

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      if (currentRecipe.id && !isSharedRecipe) {
        try {
          const favoriteIds = await FavoriteStorage.getFavoriteIds();
          setIsFavorite(favoriteIds.includes(currentRecipe.id));
        } catch (error) {
          console.error('즐겨찾기 상태 로드 실패:', error);
        }
      }
    };

    loadInitialData();
  }, [currentRecipe.id, isSharedRecipe]);

  // 레시피 저장 (개인/공유 레시피 구분)
  const handleSave = async () => {
    if (!currentRecipe.title.trim()) {
      Alert.alert('오류', '레시피 제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      if (isNewRecipe) {
        const newRecipe: Recipe = {
          ...currentRecipe,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };

        await RecipeStorage.addPersonalRecipe(newRecipe);
        setCurrentRecipe(newRecipe);

        Alert.alert('성공', '레시피가 저장되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.navigate('RecipeHome' as never),
          },
        ]);
      } else {
        const updatedRecipe: Recipe = {
          ...currentRecipe,
          updatedAt: new Date().toISOString().split('T')[0],
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

  // 즐겨찾기 토글
  const toggleFavorite = async () => {
    if (!currentRecipe.id || isSharedRecipe) return;

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

  // 🔧 UseRecipeScreen으로 네비게이션 (새로운 방식)
  const navigateToUseRecipe = () => {
    if (!currentRecipe.ingredients || currentRecipe.ingredients.length === 0) {
      Alert.alert('알림', '이 레시피에는 재료 정보가 없습니다.');
      return;
    }

    // UseRecipeScreen으로 직접 네비게이션
    navigation.navigate('UseRecipe', {
      recipe: currentRecipe,
      fridgeId: fridgeId,
      fridgeName: fridgeName,
    });
  };

  // 레시피 사용하기 모달 열기 (기존 방식 - 백업용으로 유지)
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

  // 재료 체크 토글
  const toggleIngredientCheck = (id: string) => {
    setCheckableIngredients(prev =>
      prev.map(ingredient =>
        ingredient.id === id
          ? { ...ingredient, isChecked: !ingredient.isChecked }
          : ingredient,
      ),
    );
  };

  // 체크된 재료들 냉장고에서 삭제
  const deleteCheckedIngredients = async () => {
    const checkedIngredients = checkableIngredients.filter(
      ingredient => ingredient.isChecked,
    );

    if (checkedIngredients.length === 0) {
      Alert.alert('알림', '삭제할 재료를 선택해주세요.');
      return;
    }

    try {
      // ERD 구조에 맞게 refrigeratorIngredients 테이블에서 조회
      // TODO: 실제 API 호출
      // const fridgeIngredients = await FridgeAPI.getRefrigeratorIngredients(fridgeId);

      // Mock 데이터 (ERD의 refrigeratorIngredients 테이블 구조 반영)
      const fridgeIngredients = [
        {
          id: 1,
          refrigeratorId: fridgeId,
          ingredientId: 1,
          name: '양파', // ingredients 테이블과 조인된 결과
          quantity: 2,
          expirationDate: '2024-08-20',
          categoryId: 1,
        },
        {
          id: 2,
          refrigeratorId: fridgeId,
          ingredientId: 2,
          name: '당근',
          quantity: 1,
          expirationDate: '2024-08-25',
          categoryId: 1,
        },
        {
          id: 3,
          refrigeratorId: fridgeId,
          ingredientId: 3,
          name: '감자',
          quantity: 3,
          expirationDate: '2024-08-30',
          categoryId: 1,
        },
        {
          id: 4,
          refrigeratorId: fridgeId,
          ingredientId: 4,
          name: '대파',
          quantity: 1,
          expirationDate: '2024-08-18',
          categoryId: 1,
        },
        {
          id: 5,
          refrigeratorId: fridgeId,
          ingredientId: 5,
          name: '마늘',
          quantity: 10,
          expirationDate: '2024-09-01',
          categoryId: 1,
        },
      ];

      // 체크된 재료가 냉장고에 있는지 확인
      const availableIngredients: (CheckableIngredient & {
        fridgeItemId: number;
      })[] = [];
      const unavailableIngredients: CheckableIngredient[] = [];

      checkedIngredients.forEach(checkedItem => {
        const fridgeItem = fridgeIngredients.find(
          fridgeIngredient =>
            fridgeIngredient.name.toLowerCase() ===
            checkedItem.name.toLowerCase(),
        );

        if (fridgeItem && fridgeItem.quantity > 0) {
          availableIngredients.push({
            ...checkedItem,
            fridgeItemId: fridgeItem.id, // ERD의 refrigeratorIngredients.id
          });
        } else {
          unavailableIngredients.push(checkedItem);
        }
      });

      // 결과에 따른 알림 메시지 구성
      let alertMessage = '';

      if (availableIngredients.length > 0) {
        alertMessage += `냉장고에서 차감될 재료:\n`;
        availableIngredients.forEach(item => {
          alertMessage += `• ${item.name} ${item.quantity}${item.unit}\n`;
        });
      }

      if (unavailableIngredients.length > 0) {
        if (alertMessage) alertMessage += '\n';
        alertMessage += `냉장고에 없는 재료 (차감되지 않음):\n`;
        unavailableIngredients.forEach(item => {
          alertMessage += `• ${item.name} ${item.quantity}${item.unit}\n`;
        });
      }

      if (availableIngredients.length === 0) {
        Alert.alert(
          '차감할 재료 없음',
          '선택한 재료가 냉장고에 없습니다.\n냉장고를 확인해주세요.',
          [{ text: '확인' }],
        );
        return;
      }

      // 삭제 확인 알림
      Alert.alert('재료 차감', alertMessage + '\n계속 진행하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '차감',
          style: 'destructive',
          onPress: async () => {
            try {
              // ERD 구조에 맞게 사용 내역(history) 테이블에 기록하고 수량 차감
              for (const item of availableIngredients) {
                // TODO: 실제 API 호출
                // 1. history 테이블에 사용 기록 추가
                // await HistoryAPI.createUsageHistory({
                //   refrigeratorIngredientId: item.fridgeItemId,
                //   userId: currentUserId,
                //   usedQuantity: parseInt(item.quantity) || 1,
                //   usedAt: new Date().toISOString()
                // });
                // 2. refrigeratorIngredients 테이블의 수량 차감
                // await FridgeAPI.updateIngredientQuantity(
                //   item.fridgeItemId,
                //   -parseInt(item.quantity) || -1
                // );
              }

              console.log('냉장고에서 차감된 재료들:', availableIngredients);

              let successMessage = `${availableIngredients.length}개의 재료가 냉장고에서 차감되었습니다.`;
              if (unavailableIngredients.length > 0) {
                successMessage += `\n\n${unavailableIngredients.length}개의 재료는 냉장고에 없어서 차감되지 않았습니다.`;
              }

              Alert.alert('완료', successMessage);
              setShowUseRecipeModal(false);
            } catch (error) {
              console.error('재료 차감 실패:', error);
              Alert.alert('오류', '재료 차감에 실패했습니다.');
            }
          },
        },
      ]);
    } catch (error) {
      console.error('냉장고 재료 확인 실패:', error);
      Alert.alert('오류', '냉장고 정보를 확인할 수 없습니다.');
    }
  };

  // 공유하기 모달 열기
  const openShareModal = async () => {
    if (!currentRecipe.id || isSharedRecipe) {
      Alert.alert('오류', '저장된 개인 레시피만 공유할 수 있습니다.');
      return;
    }

    try {
      // MockDataService를 통해 실제 사용자가 참여중인 냉장고 목록 가져오기
      const currentUserId = 1; // TODO: 실제 로그인한 사용자 ID로 변경
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

  // 냉장고 체크 토글
  const toggleFridgeCheck = (id: number) => {
    setCheckableFridges(prev =>
      prev.map(fridge =>
        fridge.id === id ? { ...fridge, isChecked: !fridge.isChecked } : fridge,
      ),
    );
  };

  // 선택된 냉장고들에 레시피 공유
  const shareToSelectedFridges = async () => {
    const selectedFridges = checkableFridges.filter(fridge => fridge.isChecked);

    if (selectedFridges.length === 0) {
      Alert.alert('알림', '공유할 냉장고를 선택해주세요.');
      return;
    }

    try {
      // 기존 공유 레시피 목록 가져오기
      const currentSharedRecipes = await SharedRecipeStorage.getSharedRecipes();
      console.log('현재 공유 레시피 목록:', currentSharedRecipes);

      // 각 냉장고에 레시피 공유
      let newRecipesAdded = 0;

      for (const fridge of selectedFridges) {
        // 공유 레시피 생성
        const sharedRecipe: Recipe = {
          ...currentRecipe,
          id: `shared-${fridge.id}-${currentRecipe.id}-${Date.now()}`,
          isShared: true,
          sharedBy: '나', // TODO: 실제 사용자 이름
        };

        // 중복 공유 확인 (같은 냉장고에 같은 제목의 레시피가 있는지)
        const alreadyShared = currentSharedRecipes.some(
          sr =>
            sr.title === currentRecipe.title &&
            sr.id.includes(`-${fridge.id}-`),
        );

        if (!alreadyShared) {
          currentSharedRecipes.unshift(sharedRecipe); // 맨 앞에 추가
          newRecipesAdded++;
          console.log(
            `✅ 레시피 "${currentRecipe.title}"가 냉장고 "${fridge.name}"에 공유되었습니다.`,
          );
        } else {
          console.log(
            `⚠️ 레시피 "${currentRecipe.title}"는 이미 냉장고 "${fridge.name}"에 공유되어 있습니다.`,
          );
        }
      }

      // 업데이트된 전체 목록을 AsyncStorage에 저장
      await SharedRecipeStorage.saveSharedRecipes(currentSharedRecipes);
      console.log('업데이트된 공유 레시피 목록:', currentSharedRecipes);

      // 저장 확인
      const verifySharedRecipes = await SharedRecipeStorage.getSharedRecipes();
      console.log(
        '저장 확인 - 현재 AsyncStorage의 공유 레시피 개수:',
        verifySharedRecipes.length,
      );

      Alert.alert(
        '공유 완료',
        `${newRecipesAdded}개의 냉장고에 레시피가 새로 공유되었습니다.\n\n공동 레시피 폴더에서 확인하실 수 있습니다.`,
      );
      setShowShareModal(false);
    } catch (error) {
      console.error('❌ 레시피 공유 실패:', error);
      Alert.alert('오류', '레시피 공유에 실패했습니다.');
    }
  };

  // 재료 관련 함수들 (기존과 동일)
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

  // 조리법 관련 함수들 (🔧 안전한 처리 적용)
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* header */}
        <View style={styles.header}>
          {isEditMode ? (
            <View style={styles.leftEditHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color="#444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.leftHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color="#444" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.centerHeader}>
            <Text style={styles.headerTitle}>
              {isNewRecipe
                ? '새 레시피'
                : isEditMode
                ? '레시피 편집'
                : '레시피 상세'}
            </Text>
          </View>

          {isEditMode ? (
            <View style={styles.rightEditHeader}>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <FontAwesome6
                    name="circle-check"
                    size={24}
                    color="limegreen"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.rightHeader}>
              {!isSharedRecipe ? (
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={toggleFavorite}
                  >
                    <Icon
                      name={isFavorite ? 'star' : 'star-border'}
                      size={24}
                      color={isFavorite ? '#ffd000' : '#999'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditMode(true)}
                  >
                    <Icon name="edit" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.headerActions} />
              )}
            </View>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Shared Recipe Message*/}
          {isSharedRecipe && (
            <View style={styles.sharedIndicator}>
              <Icon name="group" size={20} color="limegreen" />
              <Text style={styles.sharedText}>
                {currentRecipe.sharedBy}님이 공유한 레시피입니다
              </Text>
            </View>
          )}

          {/* Recipe Title */}
          <View style={styles.section}>
            {isEditMode ? (
              <TextInput
                style={styles.titleInput}
                value={currentRecipe.title}
                onChangeText={text =>
                  setCurrentRecipe(prev => ({ ...prev, title: text }))
                }
                placeholder="레시피 제목을 입력하세요"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.title}>{currentRecipe.title}</Text>
            )}
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>재료</Text>
              {isEditMode && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addIngredient}
                >
                  <Icon name="add" size={20} color="#29a448ff" />
                  <Text style={styles.addButtonText}>재료 추가</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 🔧 안전한 ingredients 처리 */}
            {getIngredientsArray(currentRecipe.ingredients).map(
              (ingredient, _index) => (
                <View key={ingredient.id} style={styles.ingredientItem}>
                  {isEditMode ? (
                    <View style={styles.ingredientEditRow}>
                      <TextInput
                        style={[styles.ingredientInput, styles.ingredientName]}
                        value={ingredient.name}
                        onChangeText={text =>
                          updateIngredient(ingredient.id, 'name', text)
                        }
                        placeholder="재료명"
                        placeholderTextColor="#999"
                      />
                      <TextInput
                        style={[
                          styles.ingredientInput,
                          styles.ingredientQuantity,
                        ]}
                        value={ingredient.quantity}
                        onChangeText={text =>
                          updateIngredient(ingredient.id, 'quantity', text)
                        }
                        placeholder="양"
                        placeholderTextColor="#999"
                      />
                      <TextInput
                        style={[styles.ingredientInput, styles.ingredientUnit]}
                        value={ingredient.unit}
                        onChangeText={text =>
                          updateIngredient(ingredient.id, 'unit', text)
                        }
                        placeholder="단위"
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeIngredient(ingredient.id)}
                      >
                        <Icon name="remove" size={20} color="tomato" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.ingredientText}>
                      • {ingredient.name} {ingredient.quantity}
                      {ingredient.unit}
                    </Text>
                  )}
                </View>
              ),
            )}
          </View>

          {/* Steps */}
          <View style={styles.section}>
            <View style={styles.sectionContour}>
              <></>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>조리법</Text>
              {isEditMode && (
                <TouchableOpacity style={styles.addButton} onPress={addStep}>
                  <Icon name="add" size={20} color="#29a448ff" />
                  <Text style={styles.addButtonText}>단계 추가</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 🔧 안전한 steps 처리 */}
            {getStepsArray(currentRecipe.steps).map((step, index) => (
              <View key={index} style={styles.stepItem}>
                {isEditMode ? (
                  <View style={styles.stepEditRow}>
                    <Text style={styles.stepNumber}>{index + 1}.</Text>
                    <TextInput
                      style={styles.stepInput}
                      value={step}
                      onChangeText={text => updateStep(index, text)}
                      placeholder={`${index + 1}번째 조리 과정을 입력하세요`}
                      placeholderTextColor="#999"
                      multiline
                    />
                    <TouchableOpacity
                      style={styles.removeStepsButton}
                      onPress={() => removeStep(index)}
                    >
                      <Icon name="remove" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.stepNumber}>{index + 1}.</Text>
                    <View style={styles.stepRow}>
                      <Text style={styles.stepText}>{step}</Text>
                      <View style={styles.stepsContour}>
                        <></>
                      </View>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>

          {/* URL */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>참고 URL</Text>
            {isEditMode ? (
              <TextInput
                style={styles.urlInput}
                value={currentRecipe.referenceUrl}
                onChangeText={text =>
                  setCurrentRecipe(prev => ({ ...prev, referenceUrl: text }))
                }
                placeholder="참고 URL을 입력하세요"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.url}>
                {currentRecipe.referenceUrl || '없음'}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          {!isEditMode && currentRecipe.id && (
            <View style={styles.actionButtonsContainer}>
              {/* 🔧 새로운 레시피 사용하기 버튼 - UseRecipeScreen으로 네비게이션 */}
              <TouchableOpacity
                style={styles.useRecipeButton}
                onPress={navigateToUseRecipe}
              >
                <Icon name="restaurant" size={20} color="#f8f8f8" />
                <Text style={styles.buttonText}>조리하기</Text>
              </TouchableOpacity>

              {/* 🔧 기존 방식 레시피 사용하기 버튼 (백업용) */}
              <TouchableOpacity
                style={[styles.useRecipeButton, { backgroundColor: '#666' }]}
                onPress={openUseRecipeModal}
              >
                <Icon name="checklist" size={20} color="#f8f8f8" />
                <Text style={styles.buttonText}>간단 차감</Text>
              </TouchableOpacity>

              {/* 공유하기 버튼 (개인 레시피만) */}
              {!isSharedRecipe && (
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={openShareModal}
                >
                  <Icon name="group" size={20} color="#f8f8f8" />
                  <Text style={styles.buttonText}>구성원과 공유하기</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* 레시피 사용하기 모달 */}
        <Modal
          visible={showUseRecipeModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowUseRecipeModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>레시피 사용하기</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>
                사용한 재료를 체크하면 냉장고에서 차감됩니다
              </Text>

              <FlatList
                data={checkableIngredients}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.checklistItem}
                    onPress={() => toggleIngredientCheck(item.id)}
                  >
                    <Icon
                      name={
                        item.isChecked ? 'check-box' : 'check-box-outline-blank'
                      }
                      size={24}
                      color={item.isChecked ? 'limegreen' : '#999'}
                    />
                    <Text
                      style={[
                        styles.checklistText,
                        item.isChecked && styles.checkedText,
                      ]}
                    >
                      {item.name} {item.quantity}
                      {item.unit}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.checklistContainer}
              />

              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={deleteCheckedIngredients}
              >
                <Text style={styles.modalActionButtonText}>차감하기</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* 공유하기 모달 */}
        <Modal
          visible={showShareModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>레시피 공유하기</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>
                공유할 냉장고를 선택해주세요
              </Text>

              <FlatList
                data={checkableFridges}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.checklistItem}
                    onPress={() => toggleFridgeCheck(item.id)}
                  >
                    <Icon
                      name={
                        item.isChecked ? 'check-box' : 'check-box-outline-blank'
                      }
                      size={24}
                      color={item.isChecked ? 'limegreen' : '#999'}
                    />
                    <Text style={styles.checklistText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                style={styles.checklistContainer}
              />

              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={shareToSelectedFridges}
              >
                <Text style={styles.modalActionButtonText}>공유하기</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RecipeDetailScreen;
