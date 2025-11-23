import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ConfirmModal from '../../../components/modals/ConfirmModal';

import { User } from '../../../types/auth';
import RecipeAPI from '../../../services/API/RecipeAPI';
import { ApiService } from '../../../services/apiServices';
import {
  Recipe,
  RecipeIngredient,
  RecipeDetailResponse,
} from '../../../types/Recipe';
import {
  calculateMultipleRecipeAvailability,
  RecipeAvailabilityInfo,
} from '../../../utils/recipeAvailabilityUtils';
import { RecipeStackParamList } from '../RecipeNavigator';
import { AsyncStorageService } from '../../../services/AsyncStorageService';
import { IngredientControllerAPI } from '../../../services/API/ingredientControllerAPI';
import { styles, sharedRecipeStyles } from './styles';

// 냉장고 식재료 타입 정의
interface FridgeIngredient {
  id: number;
  ingredientId?: number;
  categoryId?: number;
  ingredientName?: string;
  name: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
  expiryDate?: string;
}

type SharedFolderScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'SharedFolder'
>;

interface UserFridge {
  fridge: {
    id: number;
    name: string;
    description?: string;
    ownerId: number;
    inviteCode: string;
    memberCount: number;
  };
  role: 'owner' | 'member';
  joinedAt: string;
  recipes: Recipe[];
  ingredients: FridgeIngredient[];
}

interface SharedFolderScreenProps {
  route: {
    params: {
      currentUserId?: string;
      currentFridgeId?: number;
    };
  };
}

// SharedRecipeCard 컴포넌트
const SharedRecipeCard: React.FC<{
  recipe: Recipe;
  onPress: () => void;
  availabilityStatus: RecipeAvailabilityInfo;
}> = ({ recipe, onPress, availabilityStatus }) => {
  const [showDetails, setShowDetails] = useState(false);

  const {
    availableIngredientsCount,
    totalIngredientsCount,
    canMakeWithFridge,
    missingIngredients,
    availableIngredients,
  } = availabilityStatus;

  return (
    <View>
      <TouchableOpacity
        style={[
          sharedRecipeStyles.recipeCard,
          canMakeWithFridge && sharedRecipeStyles.canMakeCard,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={sharedRecipeStyles.recipeCardContent}>
          <Image
            source={require('../../../assets/icons/chef_hat_96dp.png')}
            style={sharedRecipeStyles.recipeIcon}
            resizeMode="contain"
          />
          <View style={sharedRecipeStyles.recipeInfo}>
            <Text style={sharedRecipeStyles.recipeTitle}>{recipe.title}</Text>

            {/* 재료 상태 표시 */}
            <View style={sharedRecipeStyles.ingredientStatus}>
              <View
                style={[
                  sharedRecipeStyles.statusIndicator,
                  canMakeWithFridge
                    ? sharedRecipeStyles.canMakeIndicator
                    : sharedRecipeStyles.cannotMakeIndicator,
                ]}
              >
                <Text
                  style={[
                    sharedRecipeStyles.statusText,
                    canMakeWithFridge
                      ? sharedRecipeStyles.canMakeText
                      : sharedRecipeStyles.cannotMakeText,
                  ]}
                >
                  {availableIngredientsCount} / {totalIngredientsCount}
                </Text>
              </View>

              {!canMakeWithFridge && missingIngredients.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowDetails(!showDetails)}
                  style={sharedRecipeStyles.detailButton}
                >
                  <Icon
                    name={showDetails ? 'expand-less' : 'expand-more'}
                    size={16}
                    color="#666"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* 부족한 재료 상세 표시 */}
      {showDetails && missingIngredients.length > 0 && (
        <View style={sharedRecipeStyles.missingIngredientsContainer}>
          <Text style={sharedRecipeStyles.missingTitle}>부족한 재료:</Text>
          {missingIngredients.map((ingredientName, index) => (
            <View key={index} style={sharedRecipeStyles.missingItem}>
              <Text style={sharedRecipeStyles.missingName}>
                • {ingredientName}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// 냉장고 폴더 카드 컴포넌트
const FridgeFolderCard: React.FC<{
  userFridge: UserFridge;
  onPress: (userFridge: UserFridge) => void;
  onLongPress: (userFridge: UserFridge) => void;
}> = ({ userFridge, onPress, onLongPress }) => (
  <TouchableOpacity
    style={styles.fridgeFolderCard}
    onPress={() => onPress(userFridge)}
    onLongPress={() => onLongPress(userFridge)}
    activeOpacity={0.7}
  >
    <View style={styles.folderIcon}>
      <Icon name="kitchen" size={36} color="#444" />
    </View>
    <View style={styles.folderInfo}>
      <Text style={styles.folderName}>{userFridge.fridge.name}</Text>
      <Text style={styles.folderSubInfo}>
        멤버 {userFridge.fridge.memberCount}명 • 레시피{' '}
        {userFridge.recipes.length}개
      </Text>
    </View>
    <Icon name="chevron-right" size={32} color="#444" />
  </TouchableOpacity>
);

// 메인 컴포넌트
const SharedFolderScreen: React.FC<SharedFolderScreenProps> = ({ route }) => {
  const navigation = useNavigation<SharedFolderScreenNavigationProp>();

  const currentFridgeId = route.params?.currentFridgeId;
  const currentUserId = route.params?.currentUserId || 1;

  const [fridgeList, setFridgeList] = useState<UserFridge[]>([]);
  const [selectedFridge, setSelectedFridge] = useState<UserFridge | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [_currentUser, setCurrentUser] = useState<User | null>(null);

  const [recipeAvailabilities, setRecipeAvailabilities] = useState<
    Map<string, RecipeAvailabilityInfo>
  >(new Map());

  const [recipeDetails, setRecipeDetails] = useState<
    Map<string, RecipeDetailResponse>
  >(new Map());

  // ConfirmModal 상태들
  const [loadErrorModalVisible, setLoadErrorModalVisible] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);
  const [deleteErrorVisible, setDeleteErrorVisible] = useState(false);
  const [selectedRecipeForDelete, setSelectedRecipeForDelete] =
    useState<Recipe | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // 냉장고 식재료 로드 함수
  const loadFridgeIngredients = async (
    fridgeId: number,
  ): Promise<FridgeIngredient[]> => {
    try {
      console.log(`🔍 냉장고 ${fridgeId} 식재료 API 로드 시도`);

      const response = await IngredientControllerAPI.getRefrigeratorIngredients(
        fridgeId,
      );

      const content = response.content || [];
      return content.map((ing: any) => ({
        id: ing.id,
        ingredientId:
          ing.ingredientId !== undefined && ing.ingredientId !== null
            ? Number(ing.ingredientId)
            : undefined,
        categoryId:
          ing.categoryId !== undefined && ing.categoryId !== null
            ? Number(ing.categoryId)
            : undefined,
        ingredientName: ing.ingredientName || ing.name || '',
        name: (ing.name || ing.ingredientName || '').toString(),
        quantity:
          ing.quantity !== undefined && ing.quantity !== null
            ? Number(ing.quantity)
            : 0,
        unit: ing.unit || '',
        expirationDate: ing.expirationDate || ing.expiryDate || undefined,
        expiryDate: ing.expiryDate || ing.expirationDate || undefined,
      }));
    } catch (error) {
      console.error(`❌ 냉장고 ${fridgeId} 식재료 로드 실패:`, error);
      return [];
    }
  };

  // 사용자 냉장고 목록과 공유 레시피, 실제 식재료 결합
  const loadUserFridgesWithRecipes = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('=== 냉장고 데이터 로드 시작 (API) ===');

      const currentUserId = await AsyncStorageService.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('현재 사용자 ID를 찾을 수 없습니다.');
      }

      const user = await AsyncStorageService.getUserById(currentUserId);
      setCurrentUser(user);

      if (!user) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      const userFridgesResponse = await ApiService.getUserFridges();
      console.log('사용자 냉장고 목록 (API):', userFridgesResponse);

      const fridgesWithRecipes: UserFridge[] = await Promise.all(
        userFridgesResponse.map(async fridge => {
          const sharedRecipes = await RecipeAPI.getSharedRecipes(
            Number(fridge.id),
          );
          const fridgeIngredients = await loadFridgeIngredients(
            Number(fridge.id),
          );

          return {
            fridge: {
              id: fridge.id,
              name: fridge.name,
              description: fridge.description,
              ownerId: fridge.userRole === 'owner' ? user.id : '',
              inviteCode: '',
              memberCount: fridge.memberCount,
            },
            role: fridge.userRole,
            joinedAt: fridge.createdAt,
            recipes: sharedRecipes,
            ingredients: fridgeIngredients,
          };
        }),
      );

      setFridgeList(fridgesWithRecipes);
      console.log('=== 최종 냉장고 + 레시피 + 식재료 ===:', fridgesWithRecipes);
    } catch (error: any) {
      console.error('데이터 로드 실패:', error);
      setLoadErrorMessage(
        '냉장고 정보를 불러오는데 실패했습니다.\n\n' + (error.message || ''),
      );
      setLoadErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRecipeAvailabilities = async () => {
    if (!selectedFridge || selectedFridge.recipes.length === 0) {
      return;
    }

    if (!currentFridgeId) {
      console.warn(
        '⚠️ 현재 접속 중인 냉장고 ID가 없어 가용성 계산을 건너뜁니다.',
      );
      setRecipeAvailabilities(new Map());
      return;
    }

    try {
      console.log('🔍 레시피 조리 가능성 계산 시작...');
      console.log(`📍 현재 접속 냉장고: ${currentFridgeId}`);
      console.log(`📂 선택된 냉장고: ${selectedFridge.fridge.id}`);
      console.log(`📋 레시피 개수: ${selectedFridge.recipes.length}개`);

      const recipesWithIngredients = await Promise.all(
        selectedFridge.recipes.map(async recipe => {
          if (!recipe.ingredients || recipe.ingredients.length === 0) {
            try {
              console.log(`📋 [${recipe.title}] 상세 정보 로드 중...`);
              const detailResponse = await RecipeAPI.getRecipeDetail(recipe.id);

              const updatedRecipe = {
                ...recipe,
                ingredients: detailResponse.ingredients || [],
              };

              console.log(
                `✅ [${recipe.title}] 재료 ${updatedRecipe.ingredients.length}개 로드됨`,
              );
              return updatedRecipe;
            } catch (error) {
              console.error(`❌ [${recipe.title}] 상세 로드 실패:`, error);
              return recipe;
            }
          }
          return recipe;
        }),
      );

      const availabilities = await calculateMultipleRecipeAvailability(
        recipesWithIngredients,
        currentFridgeId,
      );

      setRecipeAvailabilities(availabilities);

      console.log('✅ 조리 가능성 계산 완료');
      availabilities.forEach((value, key) => {
        const recipe = recipesWithIngredients.find(r => r.id === key);
        if (recipe && value.totalIngredientsCount > 0) {
          console.log(
            `  - ${recipe.title}: ${value.availableIngredientsCount}/${value.totalIngredientsCount}`,
          );
        }
      });
    } catch (error) {
      console.error('❌ 조리 가능성 계산 실패:', error);
      setRecipeAvailabilities(new Map());
    }
  };

  useEffect(() => {
    if (selectedFridge) {
      calculateRecipeAvailabilities();
    }
  }, [selectedFridge]);

  // 레시피 카드 클릭 핸들러
  const handleRecipePress = (recipe: Recipe) => {
    if (!selectedFridge) return;

    navigation.navigate('RecipeDetail', {
      recipe,
      fridgeId: selectedFridge.fridge.id,
      fridgeName: selectedFridge.fridge.name,
      currentFridgeId: currentFridgeId,
      fridgeIngredients: selectedFridge.ingredients,
      fromSharedFolder: true,
      isSharedRecipe: true,
    });
  };

  // 레시피 삭제 핸들러
  const handleRecipeDelete = async (recipe: Recipe) => {
    setSelectedRecipeForDelete(recipe);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecipeForDelete) return;

    try {
      setDeleteConfirmVisible(false);
      await RecipeAPI.deleteRecipe(selectedRecipeForDelete.id);
      await loadUserFridgesWithRecipes();
      setDeleteSuccessVisible(true);
      setSelectedRecipeForDelete(null);
    } catch (error) {
      console.error('레시피 삭제 실패:', error);
      setDeleteConfirmVisible(false);
      setDeleteErrorVisible(true);
      setSelectedRecipeForDelete(null);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadUserFridgesWithRecipes();
  }, [currentUserId]);

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadUserFridgesWithRecipes();
      setSelectedFridge(null);
    }, [currentUserId]),
  );

  const handleFridgePress = (userFridge: UserFridge) => {
    console.log('냉장고 선택:', userFridge);
    setSelectedFridge(userFridge);
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(scrollY > 300);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>냉장고를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GestureHandlerRootView style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (selectedFridge) {
                setSelectedFridge(null);
              } else {
                navigation.goBack();
              }
            }}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {selectedFridge ? selectedFridge.fridge.name : '공동 레시피'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {selectedFridge
                ? `${selectedFridge.recipes.length}개의 공유 레시피`
                : `참여 중인 냉장고 ${fridgeList.length}개`}
            </Text>
          </View>
        </View>

        {/* 컨텐츠 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {!selectedFridge ? (
            // 냉장고 목록 보기
            <>
              <View style={styles.infoContainer}>
                <View style={styles.infoIcon}>
                  <Icon name="info" size={20} color="#888" />
                </View>
                <Text style={styles.infoText}>
                  참여 중인 냉장고별 공유 레시피를 확인해 보세요!
                </Text>
              </View>

              {fridgeList.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="kitchen" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    참여 중인 냉장고가 없습니다
                  </Text>
                  <Text style={styles.emptySubText}>
                    새 냉장고를 만들거나 초대 코드로 참여해보세요
                  </Text>
                </View>
              ) : (
                fridgeList.map(userFridge => (
                  <FridgeFolderCard
                    key={userFridge.fridge.id}
                    userFridge={userFridge}
                    onPress={handleFridgePress}
                    onLongPress={() => {}}
                  />
                ))
              )}
            </>
          ) : (
            // 선택된 냉장고의 레시피 목록 보기
            <>
              {selectedFridge.recipes.map(recipe => {
                const availabilityStatus = recipeAvailabilities.get(
                  recipe.id,
                ) || {
                  availableIngredientsCount: 0,
                  totalIngredientsCount: recipe.ingredients?.length || 0,
                  canMakeWithFridge: false,
                  missingIngredients: [],
                  availableIngredients: [],
                };

                return (
                  <SharedRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onPress={() => handleRecipePress(recipe)}
                    availabilityStatus={availabilityStatus}
                  />
                );
              })}
            </>
          )}
        </ScrollView>

        {/* 위로 스크롤 버튼 */}
        {showScrollToTop && (
          <TouchableOpacity
            style={styles.scrollToTopButton}
            onPress={scrollToTop}
          >
            <Icon name="keyboard-arrow-up" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* 데이터 로드 에러 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={loadErrorModalVisible}
          title="오류"
          message={loadErrorMessage}
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setLoadErrorModalVisible(false)}
          onCancel={() => setLoadErrorModalVisible(false)}
        />

        {/* 레시피 삭제 확인 모달 */}
        <ConfirmModal
          isAlert={true}
          visible={deleteConfirmVisible}
          title="레시피 삭제"
          message={`"${selectedRecipeForDelete?.title}" 레시피를 삭제하시겠습니까?`}
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="삭제"
          cancelText="취소"
          confirmButtonStyle="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteConfirmVisible(false);
            setSelectedRecipeForDelete(null);
          }}
        />

        {/* 레시피 삭제 성공 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={deleteSuccessVisible}
          title="성공"
          message="레시피가 삭제되었습니다."
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'check', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setDeleteSuccessVisible(false)}
          onCancel={() => setDeleteSuccessVisible(false)}
        />

        {/* 레시피 삭제 실패 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={deleteErrorVisible}
          title="오류"
          message="레시피 삭제에 실패했습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setDeleteErrorVisible(false)}
          onCancel={() => setDeleteErrorVisible(false)}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default SharedFolderScreen;
