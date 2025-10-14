import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { User } from '../../../types/auth';
import RecipeAPI from '../../../services/API/RecipeAPI';
import { ApiService } from '../../../services/apiServices';
import {
  Recipe,
  RecipeIngredient,
  RecipeDetailResponse,
} from '../../../types/Recipe';
import { RecipeStackParamList } from '../RecipeNavigator';
import { AsyncStorageService } from '../../../services/AsyncStorageService';
import IngredientControllerAPI from '../../../services/API/ingredientControllerAPI';
import { styles } from './styles';

// 냉장고 식재료 타입 정의
interface FridgeIngredient {
  id: string;
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
    id: string;
    name: string;
    description?: string;
    ownerId: string;
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
    };
  };
}

// 식재료 매칭 결과 타입
interface IngredientMatchResult {
  recipeIngredient: RecipeIngredient;
  matched: boolean;
  fridgeIngredient?: FridgeIngredient;
  hasEnoughQuantity: boolean;
  instead?: string;
}

// 레시피 상태 타입
interface RecipeAvailabilityStatus {
  availableCount: number;
  totalCount: number;
  canMakeWithFridge: boolean;
  matchResults: IngredientMatchResult[];
}

// 백엔드 제공 대체재를 활용한 식재료 매칭
const findMatchingIngredient = (
  recipeIngredient: RecipeIngredient & { instead?: string },
  fridgeIngredients: FridgeIngredient[],
): FridgeIngredient | null => {
  const recipeName = recipeIngredient.name.toLowerCase().trim();

  console.log(
    `🔍 매칭 시도: "${recipeIngredient.name}" (대체: ${
      recipeIngredient.instead || '없음'
    })`,
  );

  // 정확한 이름 매칭
  let match = fridgeIngredients.find(
    ingredient => ingredient.name.toLowerCase().trim() === recipeName,
  );

  if (match) {
    console.log(`✅ 정확한 매칭: ${recipeIngredient.name} → ${match.name}`);
    return match;
  }

  // 백엔드가 제공한 대체 재료로 매칭 (instead 필드)
  if (recipeIngredient.instead) {
    const alternativeName = recipeIngredient.instead.toLowerCase().trim();

    match = fridgeIngredients.find(
      ingredient => ingredient.name.toLowerCase().trim() === alternativeName,
    );

    if (match) {
      console.log(
        `>> 대체 재료 매칭: ${recipeIngredient.name} → ${match.name} (instead: ${recipeIngredient.instead})`,
      );
      return match;
    }

    // 대체 재료 부분 매칭
    match = fridgeIngredients.find(
      ingredient =>
        ingredient.name.toLowerCase().includes(alternativeName) ||
        alternativeName.includes(ingredient.name.toLowerCase().trim()),
    );

    if (match) {
      console.log(
        `>> 대체 재료 부분 매칭: ${recipeIngredient.name} → ${match.name}`,
      );
      return match;
    }
  }

  // 부분 매칭 (폴백)
  match = fridgeIngredients.find(
    ingredient =>
      ingredient.name.toLowerCase().includes(recipeName) ||
      recipeName.includes(ingredient.name.toLowerCase().trim()),
  );

  if (match) {
    console.log(`>> 부분 매칭: ${recipeIngredient.name} → ${match.name}`);
    return match;
  }

  console.log(`X 매칭 실패: ${recipeIngredient.name}`);
  return null;
};

// 레시피 상세 정보 가져오기 (instead 포함)
const fetchRecipeDetailWithAlternatives = async (
  recipeId: string,
): Promise<RecipeDetailResponse | null> => {
  try {
    console.log(`📋 레시피 ${recipeId} 상세 정보 조회 (대체재 포함)`);

    // RecipeAPI.getRecipeDetail 호출
    const recipeDetail = await RecipeAPI.getRecipeDetail(recipeId);

    // RecipeDetailResponse 형식으로 변환
    return {
      recipeId: parseInt(recipeDetail.id, 10),
      title: recipeDetail.title,
      steps: recipeDetail.steps?.join('\n') || '',
      url: recipeDetail.referenceUrl || '',
      ingredients:
        recipeDetail.ingredients?.map(ing => ({
          ingredientId: parseInt(ing.id, 10),
          name: ing.name,
          quantity: ing.quantity,
          instead: (ing as any).instead || '',
        })) || [],
    };
  } catch (error) {
    console.error('레시피 상세 조회 실패:', error);
    return null;
  }
};

// 레시피 조리 가능성 계산 (대체재 정보 포함)
const calculateIngredientStatus = (
  recipe: Recipe,
  fridgeIngredients: FridgeIngredient[],
  recipeDetail?: RecipeDetailResponse | null, // instead 정보가 있는 상세 데이터
): RecipeAvailabilityStatus => {
  console.log(`>> 레시피 "${recipe.title}" 식재료 매칭 시작`);

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    console.log(`X 레시피에 재료가 없음`);
    return {
      availableCount: 0,
      totalCount: 0,
      canMakeWithFridge: false,
      matchResults: [],
    };
  }

  const matchResults: IngredientMatchResult[] = [];
  let availableCount = 0;
  const totalCount = recipe.ingredients.length;

  for (const recipeIngredient of recipe.ingredients) {
    console.log(`\n--- 재료 "${recipeIngredient.name}" 매칭 중 ---`);

    const detailIngredient = recipeDetail?.ingredients.find(
      ing => ing.ingredientId === recipeIngredient.ingredientId,
    );

    const instead = detailIngredient?.instead;

    // 매칭 시도 (대체재 포함)
    const matchingFridgeIngredient = findMatchingIngredient(
      { ...recipeIngredient, instead },
      fridgeIngredients,
    );

    const matched = !!matchingFridgeIngredient;
    let hasEnoughQuantity = false;

    if (matchingFridgeIngredient) {
      const fridgeQuantity = matchingFridgeIngredient.quantity || 0;
      const requiredQuantity = recipeIngredient.quantity || 1;

      console.log(
        `📊 수량 비교: 냉장고 ${fridgeQuantity}${matchingFridgeIngredient.unit} vs 필요 ${requiredQuantity}`,
      );

      hasEnoughQuantity = fridgeQuantity >= requiredQuantity;

      if (hasEnoughQuantity) {
        availableCount++;
        console.log(`>> 재료 충분: ${recipeIngredient.name}`);
      } else {
        console.log(`!! 재료 부족: ${recipeIngredient.name}`);
      }
    } else {
      console.log(`X 매칭되는 재료 없음: ${recipeIngredient.name}`);
    }

    matchResults.push({
      recipeIngredient,
      matched,
      fridgeIngredient: matchingFridgeIngredient || undefined,
      hasEnoughQuantity,
      instead,
    });
  }

  const canMakeWithFridge = availableCount === totalCount && totalCount > 0;

  console.log(
    `🎯 최종 결과: ${availableCount}/${totalCount}, 조리가능: ${canMakeWithFridge}`,
  );

  return {
    availableCount,
    totalCount,
    canMakeWithFridge,
    matchResults,
  };
};

// SharedRecipeCard 컴포넌트 (대체재 정보 표시)
const SharedRecipeCard: React.FC<{
  recipe: Recipe;
  onPress: () => void;
  availabilityStatus: RecipeAvailabilityStatus;
}> = ({ recipe, onPress, availabilityStatus }) => {
  const [showDetails, setShowDetails] = useState(false);

  const { availableCount, totalCount, canMakeWithFridge, matchResults } =
    availabilityStatus;

  // 부족한 재료만 필터링
  const missingIngredients = matchResults.filter(
    result => !result.matched || !result.hasEnoughQuantity,
  );

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
                  {availableCount} / {totalCount}
                </Text>
              </View>

              {/* 부족한 재료가 있으면 상세 보기 버튼 */}
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

      {/* 부족한 재료 상세 표시 (대체 재료 포함) */}
      {showDetails && missingIngredients.length > 0 && (
        <View style={sharedRecipeStyles.missingIngredientsContainer}>
          <Text style={sharedRecipeStyles.missingTitle}>부족한 재료:</Text>
          {missingIngredients.map((result, index) => (
            <View key={index} style={sharedRecipeStyles.missingItem}>
              <Text style={sharedRecipeStyles.missingName}>
                • {result.recipeIngredient.name} (
                {result.recipeIngredient.quantity})
              </Text>
              {result.instead && (
                <Text style={sharedRecipeStyles.alternativeText}>
                  → 대체 가능: {result.instead}
                </Text>
              )}
              {!result.matched && (
                <Text style={sharedRecipeStyles.notFoundText}>
                  냉장고에 없음
                </Text>
              )}
              {result.matched &&
                !result.hasEnoughQuantity &&
                result.fridgeIngredient && (
                  <Text style={sharedRecipeStyles.insufficientText}>
                    현재: {result.fridgeIngredient.quantity}
                    {result.fridgeIngredient.unit}
                  </Text>
                )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const sharedRecipeStyles = StyleSheet.create({
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  canMakeCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  recipeCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  recipeIcon: {
    width: 30,
    height: 30,
    marginRight: 16,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ingredientStatus: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  canMakeIndicator: {
    backgroundColor: '#E8F5E8',
    borderColor: 'limegreen',
  },
  cannotMakeIndicator: {
    backgroundColor: '#eee',
    borderColor: '#aaa',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  canMakeText: {
    color: '#2E7D32',
  },
  cannotMakeText: {
    color: '#aaa',
  },
  detailButton: {
    marginLeft: 8,
    padding: 4,
  },
  missingIngredientsContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  missingTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 8,
  },
  missingItem: {
    marginBottom: 8,
  },
  missingName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  alternativeText: {
    fontSize: 11,
    color: '#2E7D32',
    fontStyle: 'italic',
    marginLeft: 12,
    marginTop: 2,
  },
  notFoundText: {
    fontSize: 11,
    color: '#D32F2F',
    marginLeft: 12,
    marginTop: 2,
  },
  insufficientText: {
    fontSize: 11,
    color: '#FF9800',
    marginLeft: 12,
    marginTop: 2,
  },
});

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
        구성원 {userFridge.fridge.memberCount}명 • 레시피{' '}
        {userFridge.recipes.length}개
      </Text>
    </View>
    <Icon name="chevron-right" size={32} color="#444" />
  </TouchableOpacity>
);

// 메인 컴포넌트
const SharedFolderScreen: React.FC<SharedFolderScreenProps> = ({ route }) => {
  const navigation = useNavigation<SharedFolderScreenNavigationProp>();
  const currentUserId = route.params?.currentUserId || 1;

  const [fridgeList, setFridgeList] = useState<UserFridge[]>([]);
  const [selectedFridge, setSelectedFridge] = useState<UserFridge | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [_currentUser, setCurrentUser] = useState<User | null>(null);

  // ✅ 레시피별 조리 가능성 상태
  const [recipeAvailabilities, setRecipeAvailabilities] = useState<
    Map<string, RecipeAvailabilityStatus>
  >(new Map());

  // ✅ 레시피 상세 정보 (instead 포함)
  const [recipeDetails, setRecipeDetails] = useState<
    Map<string, RecipeDetailResponse>
  >(new Map());

  const scrollViewRef = useRef<ScrollView>(null);

  // 냉장고 식재료 로드 함수
  const loadFridgeIngredients = async (
    fridgeId: string,
  ): Promise<FridgeIngredient[]> => {
    try {
      console.log(`🔍 냉장고 ${fridgeId} 식재료 API 로드 시도`);

      const response = await IngredientControllerAPI.getRefrigeratorIngredients(
        fridgeId,
        { page: 0, size: 100 },
      );

      const ingredients: FridgeIngredient[] = response.content.map(item => ({
        id: item.id,
        ingredientId: item.ingredientId,
        categoryId: item.categoryId,
        name: item.ingredientName,
        ingredientName: item.ingredientName,
        quantity: item.quantity,
        unit: item.unit || '개',
        expirationDate: item.expirationDate,
        expiryDate: item.expirationDate,
      }));

      console.log(
        `✅ 냉장고 ${fridgeId} 식재료 ${ingredients.length}개 로드 성공`,
      );

      return ingredients;
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
          const sharedRecipes = await RecipeAPI.getSharedRecipes(fridge.id);
          const fridgeIngredients = await loadFridgeIngredients(fridge.id);

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
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      Alert.alert(
        '오류',
        '냉장고 정보를 불러오는데 실패했습니다.\n\n' + error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 선택된 냉장고의 레시피 조리 가능성 계산
  const calculateRecipeAvailabilities = async () => {
    if (!selectedFridge || selectedFridge.recipes.length === 0) {
      return;
    }

    try {
      console.log('🔍 레시피 조리 가능성 계산 시작...');

      const availabilities = new Map<string, RecipeAvailabilityStatus>();
      const details = new Map<string, RecipeDetailResponse>();

      // ✅ 각 레시피의 상세 정보 가져오기 (instead 포함)
      for (const recipe of selectedFridge.recipes) {
        const recipeDetail = await fetchRecipeDetailWithAlternatives(recipe.id);

        if (recipeDetail) {
          details.set(recipe.id, recipeDetail);
        }

        // 조리 가능성 계산
        const status = calculateIngredientStatus(
          recipe,
          selectedFridge.ingredients,
          recipeDetail,
        );

        availabilities.set(recipe.id, status);
      }

      setRecipeDetails(details);
      setRecipeAvailabilities(availabilities);
      console.log('✅ 조리 가능성 계산 완료');
    } catch (error) {
      console.error('❌ 조리 가능성 계산 실패:', error);
    }
  };

  // ✅ 냉장고 선택 시 조리 가능성 계산
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
      fridgeIngredients: selectedFridge.ingredients,
      fromSharedFolder: true,
    });
  };

  // 레시피 삭제 핸들러
  const handleRecipeDelete = async (recipe: Recipe) => {
    Alert.alert('레시피 삭제', `"${recipe.title}" 레시피를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await RecipeAPI.deleteRecipe(recipe.id);
            await loadUserFridgesWithRecipes();
            Alert.alert('성공', '레시피가 삭제되었습니다.');
          } catch (error) {
            console.error('레시피 삭제 실패:', error);
            Alert.alert('오류', '레시피 삭제에 실패했습니다.');
          }
        },
      },
    ]);
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
            // 선택된 냉장고의 레시피 목록 보기// 선택된 냉장고의 레시피 목록 보기
            <>
              {selectedFridge.recipes.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="restaurant" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>공유된 레시피가 없습니다</Text>
                  <Text style={styles.emptySubText}>
                    첫 번째 레시피를 공유해보세요
                  </Text>
                </View>
              ) : (
                <>
                  {/* ✅ 레시피 목록 - 대체재 정보 포함 */}
                  {selectedFridge.recipes.map(recipe => {
                    const availabilityStatus = recipeAvailabilities.get(
                      recipe.id,
                    ) || {
                      availableCount: 0,
                      totalCount: recipe.ingredients?.length || 0,
                      canMakeWithFridge: false,
                      matchResults: [],
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
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default SharedFolderScreen;
