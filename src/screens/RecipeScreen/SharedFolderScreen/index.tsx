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
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PaginationButton from '../../../components/Recipe/PaginationButton';
import { Recipe, RecipeStackParamList } from '../RecipeNavigator';
import { SharedRecipeStorage } from '../../../utils/AsyncStorageUtils';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../../../services/AsyncStorageService';
import { User } from '../../../types/auth';
import { styles } from './styles';

// 냉장고 식재료 타입 정의
interface FridgeIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiryDate: string;
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
  ingredients: FridgeIngredient[]; // 실제 냉장고 식재료
}

interface SharedFolderScreenProps {
  route: {
    params: {
      currentUserId?: string;
    };
  };
}

// 식재료 매칭 함수 - 이름 기반 매칭 및 대체 재료 고려
const findMatchingIngredient = (
  recipeIngredientName: string,
  fridgeIngredients: FridgeIngredient[],
): FridgeIngredient | null => {
  console.log(
    `🔍 매칭 시도: "${recipeIngredientName}" vs 냉장고 재료:`,
    fridgeIngredients.map(i => i.name),
  );

  // 1. 정확한 이름 매칭
  let match = fridgeIngredients.find(
    ingredient =>
      ingredient.name.toLowerCase().trim() ===
      recipeIngredientName.toLowerCase().trim(),
  );

  if (match) {
    console.log(
      `✅ 정확한 매칭 발견: ${recipeIngredientName} -> ${match.name}`,
    );
    return match;
  }

  // 2. 부분 매칭 (레시피 재료 이름이 냉장고 재료에 포함되는 경우)
  match = fridgeIngredients.find(ingredient =>
    ingredient.name
      .toLowerCase()
      .includes(recipeIngredientName.toLowerCase().trim()),
  );

  if (match) {
    console.log(`✅ 부분 매칭 발견: ${recipeIngredientName} -> ${match.name}`);
    return match;
  }

  // 3. 역 부분 매칭 (냉장고 재료 이름이 레시피 재료에 포함되는 경우)
  match = fridgeIngredients.find(ingredient =>
    recipeIngredientName
      .toLowerCase()
      .includes(ingredient.name.toLowerCase().trim()),
  );

  if (match) {
    console.log(
      `✅ 역 부분 매칭 발견: ${recipeIngredientName} -> ${match.name}`,
    );
    return match;
  }

  // 4. 대체 재료 매칭
  const substitutions: { [key: string]: string[] } = {
    소시지: ['부어스트 소시지', '소세지', '훈제소시지', '비엔나소시지'],
    양상추: ['양배추', '상추', '샐러드', '채소'],
    스리라차: ['저당 스리라차', '칠리소스', '매운소스'],
    우유: ['저지방우유', '무지방우유', '두유'],
    설탕: ['황설탕', '흑설탕', '올리고당'],
    간장: ['진간장', '양조간장', '국간장'],
    된장: ['쌈장', '고추장'],
    고기: ['소고기', '돼지고기', '닭고기'],
    양파: ['대파', '쪽파'],
  };

  // 레시피 재료명으로 대체재료 찾기
  for (const [key, alternatives] of Object.entries(substitutions)) {
    if (recipeIngredientName.toLowerCase().includes(key.toLowerCase())) {
      match = fridgeIngredients.find(ingredient =>
        alternatives.some(alt =>
          ingredient.name.toLowerCase().includes(alt.toLowerCase()),
        ),
      );
      if (match) {
        console.log(
          `✅ 대체 재료 매칭 발견: ${recipeIngredientName} -> ${match.name} (${key} 대체)`,
        );
        return match;
      }
    }
  }

  // 냉장고 재료명으로 대체재료 찾기
  for (const fridgeIngredient of fridgeIngredients) {
    for (const [key, alternatives] of Object.entries(substitutions)) {
      if (
        alternatives.some(alt =>
          fridgeIngredient.name.toLowerCase().includes(alt.toLowerCase()),
        )
      ) {
        if (recipeIngredientName.toLowerCase().includes(key.toLowerCase())) {
          console.log(
            `✅ 역 대체 재료 매칭 발견: ${recipeIngredientName} -> ${fridgeIngredient.name} (${key} 대체)`,
          );
          return fridgeIngredient;
        }
      }
    }
  }

  console.log(`❌ 매칭 실패: ${recipeIngredientName}`);
  return null;
};

// 레시피 식재료 매칭 상태 계산
const calculateIngredientStatus = (
  recipe: Recipe,
  fridgeIngredients: FridgeIngredient[],
) => {
  console.log(`🍳 레시피 "${recipe.title}" 식재료 매칭 시작`);
  console.log(`📋 레시피 재료:`, recipe.ingredients);
  console.log(`🥫 냉장고 재료:`, fridgeIngredients);

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    console.log(`❌ 레시피에 재료가 없음`);
    return {
      availableCount: 0,
      totalCount: 0,
      canMakeWithFridge: false,
    };
  }

  let availableCount = 0;
  let totalCount = recipe.ingredients.length;

  console.log(`🔍 총 ${totalCount}개 재료 매칭 시작`);

  for (const recipeIngredient of recipe.ingredients) {
    console.log(`\n--- 재료 "${recipeIngredient.name}" 매칭 중 ---`);

    const matchingFridgeIngredient = findMatchingIngredient(
      recipeIngredient.name,
      fridgeIngredients,
    );

    if (matchingFridgeIngredient) {
      // 수량 체크 (단위가 다를 수 있으므로 유연하게 처리)
      const fridgeQuantity = parseFloat(matchingFridgeIngredient.quantity) || 0;
      const requiredQuantity = parseFloat(recipeIngredient.quantity) || 1;

      console.log(
        `📊 수량 비교: 냉장고 ${fridgeQuantity}${matchingFridgeIngredient.unit} vs 필요 ${requiredQuantity}${recipeIngredient.unit}`,
      );

      if (fridgeQuantity >= requiredQuantity) {
        availableCount++;
        console.log(
          `✅ 재료 충분: ${recipeIngredient.name} (${availableCount}/${totalCount})`,
        );
      } else {
        console.log(
          `⚠️ 재료 부족: ${recipeIngredient.name} - 냉장고 ${fridgeQuantity} < 필요 ${requiredQuantity}`,
        );
      }
    } else {
      console.log(`❌ 매칭되는 재료 없음: ${recipeIngredient.name}`);
    }
  }

  const canMakeWithFridge = availableCount === totalCount && totalCount > 0;

  console.log(
    `🎯 최종 결과: ${availableCount}/${totalCount}, 조리가능: ${canMakeWithFridge}`,
  );

  return {
    availableCount,
    totalCount,
    canMakeWithFridge,
  };
};

const SharedRecipeCard: React.FC<{
  recipe: Recipe;
  onPress: () => void;
  availableIngredientsCount: number;
  totalIngredientsCount: number;
  canMakeWithFridge: boolean;
}> = ({
  recipe,
  onPress,
  availableIngredientsCount,
  totalIngredientsCount,
  canMakeWithFridge,
}) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);

  return (
    <TouchableOpacity
      style={[
        sharedRecipeStyles.recipeCard,
        isSwipeOpen && sharedRecipeStyles.swipeOpenCard,
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
          <Text
            style={[
              sharedRecipeStyles.recipeTitle,
              isSwipeOpen && sharedRecipeStyles.swipeOpenTitle,
            ]}
          >
            {recipe.title}
          </Text>
          {/* 실제 재료 상태 표시 */}
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
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const sharedRecipeStyles = StyleSheet.create({
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 5,
    },
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  swipeOpenCard: {
    borderRadius: 0,
    transform: [{ scale: 0.98 }],
  },
  swipeOpenTitle: {
    color: '#eb4e3d',
    fontWeight: '600',
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  deleteActionButton: {
    backgroundColor: '#eb4e3d',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  ingredientStatus: {
    marginTop: 4,
    alignItems: 'flex-start',
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
  const scrollViewRef = useRef<ScrollView>(null);

  // 냉장고 식재료 로드 함수 - fridgeStorage 방식 사용
  const loadFridgeIngredients = async (
    fridgeId: string,
  ): Promise<FridgeIngredient[]> => {
    try {
      console.log(`🔍 냉장고 ${fridgeId} 식재료 로드 시도`);

      // fridgeStorage의 getFridgeItemsByFridgeId 방식과 동일한 로직
      const FRIDGE_ITEMS_KEY = 'fridgeItems';
      const itemsJson = await AsyncStorage.getItem(FRIDGE_ITEMS_KEY);

      if (!itemsJson) {
        console.log(`⚠️ fridgeItems 키에 데이터가 없음`);
        return [];
      }

      const allItems = JSON.parse(itemsJson);
      console.log(`📦 전체 냉장고 아이템 개수: ${allItems.length}`);

      const fridgeItems = allItems.filter((item: any) => {
        const itemFridgeId = item.fridgeId;
        const targetFridgeId = fridgeId;
        // string과 string 비교
        const stringMatch =
          itemFridgeId.toString() === targetFridgeId.toString();
        // number와 number 비교 (둘 다 변환 가능한 경우)
        const numberMatch = Number(itemFridgeId) === Number(targetFridgeId);
        return stringMatch || numberMatch;
      });

      console.log(
        `✅ 냉장고 ${fridgeId} 식재료 ${fridgeItems.length}개 로드 성공:`,
        fridgeItems.map(
          (item: any) => `${item.name}(${item.quantity}${item.unit})`,
        ),
      );

      return fridgeItems;
    } catch (error) {
      console.error(`❌ 냉장고 ${fridgeId} 식재료 로드 실패:`, error);
      return [];
    }
  };

  // 공유 레시피를 냉장고별로 분류
  const getSharedRecipesByFridge = async (): Promise<{
    [fridgeId: string]: Recipe[];
  }> => {
    try {
      const allSharedRecipes = await SharedRecipeStorage.getSharedRecipes();
      const recipesByFridge: { [fridgeId: string]: Recipe[] } = {};

      console.log('모든 공유 레시피:', allSharedRecipes);

      allSharedRecipes.forEach(recipe => {
        const idParts = recipe.id.split('-');
        if (idParts.length >= 3 && idParts[0] === 'shared') {
          const fridgeId = idParts[1];
          if (!recipesByFridge[fridgeId]) {
            recipesByFridge[fridgeId] = [];
          }
          recipesByFridge[fridgeId].push(recipe);
        }
      });

      console.log('냉장고별 레시피 분류 결과:', recipesByFridge);
      return recipesByFridge;
    } catch (error) {
      console.error('공유 레시피 조회 실패:', error);
      return {};
    }
  };

  // 사용자 냉장고 목록과 공유 레시피, 실제 식재료 결합
  const loadUserFridgesWithRecipes = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('=== 냉장고 데이터 로드 시작 ===');

      // 현재 사용자 ID 조회
      const currentUserId = await AsyncStorageService.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('현재 사용자 ID를 찾을 수 없습니다.');
      }

      // 사용자 정보 조회
      const user = await AsyncStorageService.getUserById(currentUserId);
      setCurrentUser(user);
      console.log('현재 사용자:', user);

      if (!user) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      // 사용자가 참여한 냉장고 목록 조회
      const userFridges = await AsyncStorageService.getUserRefrigerators(
        parseInt(user.id, 10),
      );
      console.log('사용자 냉장고 목록:', userFridges);

      // 공유 레시피를 냉장고별로 분류
      const sharedRecipesByFridge = await getSharedRecipesByFridge();
      console.log('냉장고별 공유 레시피:', sharedRecipesByFridge);

      // 각 냉장고의 식재료 정보 로드 및 결합
      const fridgesWithRecipes: UserFridge[] = await Promise.all(
        userFridges.map(async fridge => {
          // 냉장고 식재료 로드
          const fridgeIngredients = await loadFridgeIngredients(fridge.id);

          return {
            fridge: {
              id: fridge.id,
              name: fridge.name,
              ownerId: fridge.isOwner ? parseInt(user.id, 10) : 0,
              inviteCode: fridge.inviteCode || '',
              memberCount: fridge.memberCount,
            },
            role: fridge.role,
            joinedAt: fridge.createdAt,
            recipes: sharedRecipesByFridge[fridge.id] || [],
            ingredients: fridgeIngredients, // 실제 냉장고 식재료
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

  // 레시피 카드 클릭 핸들러 - 향상된 데이터 전달
  const handleRecipePress = (recipe: Recipe) => {
    console.log('레시피 선택:', recipe);
    if (!selectedFridge) return;

    // RecipeDetail 화면으로 이동하면서 냉장고 ID와 실제 식재료 정보 전달
    navigation.navigate('RecipeDetail', {
      recipe,
      fridgeId: selectedFridge.fridge.id,
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
            await SharedRecipeStorage.deleteSharedRecipe(recipe.id);
            // 데이터 새로고침
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

  // 즐겨찾기 토글 핸들러 (공유 레시피는 즐겨찾기 기능 제한)
  const handleToggleFavorite = (recipe: Recipe) => {
    Alert.alert('알림', '공유 레시피는 즐겨찾기 기능을 사용할 수 없습니다.', [
      { text: '확인' },
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
              {/* 안내 메시지 */}
              <View style={styles.infoContainer}>
                <View style={styles.infoIcon}>
                  <Icon name="info" size={20} color="#888" />
                </View>
                <Text style={styles.infoText}>
                  참여 중인 냉장고별 공유 레시피를 확인해 보세요!
                  {'\n'}길게 눌러서 냉장고 설정을 변경할 수 있습니다.
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
                    onLongPress={() => {}} // 길게 누르기 기능 일시 제거
                  />
                ))
              )}
            </>
          ) : (
            // 선택된 냉장고의 레시피 목록 보기
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
                  {/* 레시피 목록 - 실제 냉장고 식재료와 비교하여 상태 계산 */}
                  {selectedFridge.recipes.map(recipe => {
                    const ingredientStatus = calculateIngredientStatus(
                      recipe,
                      selectedFridge.ingredients,
                    );

                    return (
                      <SharedRecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onPress={() => handleRecipePress(recipe)}
                        availableIngredientsCount={
                          ingredientStatus.availableCount
                        }
                        totalIngredientsCount={ingredientStatus.totalCount}
                        canMakeWithFridge={ingredientStatus.canMakeWithFridge}
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
