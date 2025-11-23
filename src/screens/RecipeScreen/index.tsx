// screens/RecipeScreen/index.tsx - API 연동 버전 (실제 API 사용)
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { styles } from './styles';
import { Recipe, RecipeStackParamList } from './RecipeNavigator';
import RecipeAPI from '../../services/API/RecipeAPI';
import { IngredientControllerAPI } from '../../services/API/ingredientControllerAPI';
import {
  calculateMultipleRecipeAvailability,
  RecipeAvailabilityInfo,
} from '../../utils/recipeAvailabilityUtils';
import RecipeHeader from '../../components/Recipe/RecipeHeader';
import FloatingButton from '../../components/Recipe/FloatingButton';
import SharedRecipeFolder from '../../components/Recipe/SharedRecipeFolder';
import RenderRecipeItem from '../../components/Recipe/RenderRecipeItem';
import { ListHeader, ListFooter } from '../../components/Recipe/ListComponents';

type RecipeHomeNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'RecipeHome'
>;

interface RecipeScreenProps {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
    };
  };
}

const RecipeScreen: React.FC<RecipeScreenProps> = ({ route }) => {
  const navigation = useNavigation<RecipeHomeNavigationProp>();
  const { fridgeId, fridgeName } = route.params;

  const [personalRecipes, setPersonalRecipes] = useState<Recipe[]>([]);
  const [sharedRecipes, setSharedRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<'all' | 'favorites'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [recipeAvailabilities, setRecipeAvailabilities] = useState<
    Map<string, RecipeAvailabilityInfo>
  >(new Map());

  // ConfirmModal 상태들
  const [favoriteErrorModalVisible, setFavoriteErrorModalVisible] =
    useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);
  const [deleteErrorVisible, setDeleteErrorVisible] = useState(false);
  const [orderChangeErrorVisible, setOrderChangeErrorVisible] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<any>(null);

  const ITEMS_PER_PAGE = 15;

  const calculateRecipeAvailabilities = async () => {
    try {
      if (personalRecipes.length > 0 && fridgeId) {
        console.log('🔍 조리 가능성 계산 시작...');
        console.log(`📊 전체 레시피: ${personalRecipes.length}개`);

        // ✅ 1단계: 재료 정보 확인 및 상세 정보 로드
        const recipesWithIngredients = await Promise.all(
          personalRecipes.map(async recipe => {
            if (!recipe.ingredients || recipe.ingredients.length === 0) {
              try {
                console.log(`📋 [${recipe.title}] 상세 정보 로드 중...`);
                const detailResponse = await RecipeAPI.getRecipeDetail(
                  recipe.id,
                );
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

        // ✅ 2단계: 조리 가능성 계산
        const availabilities = await calculateMultipleRecipeAvailability(
          recipesWithIngredients,
          fridgeId,
        );

        setRecipeAvailabilities(availabilities);

        console.log('✅ 조리 가능성 계산 완료');
        availabilities.forEach((value, key) => {
          console.log(
            `  - ${key}: ${value.availableIngredientsCount}/${value.totalIngredientsCount}`,
          );
        });
      }
    } catch (error) {
      console.error('❌ 레시피 가용성 계산 실패:', error);
      setRecipeAvailabilities(new Map());
    }
  };

  // Load Init Data
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [personalResult, favoriteResult, sharedResult] =
        await Promise.allSettled([
          RecipeAPI.getRecipeList(),
          RecipeAPI.getFavoriteRecipes(),
          RecipeAPI.getSharedRecipes(fridgeId),
        ]);

      if (personalResult.status === 'fulfilled') {
        setPersonalRecipes(personalResult.value);
      } else {
        setPersonalRecipes([]);
      }

      if (favoriteResult.status === 'fulfilled') {
        const favoriteIds = favoriteResult.value.map(recipe => recipe.id);
        setFavoriteRecipeIds(favoriteIds);
      } else {
        setFavoriteRecipeIds([]);
      }

      if (sharedResult.status === 'fulfilled') {
        setSharedRecipes(sharedResult.value);
      } else {
        setSharedRecipes([]);
      }
    } catch (error) {
      setPersonalRecipes([]);
      setSharedRecipes([]);
      setFavoriteRecipeIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadInitialData();
  }, []);

  React.useEffect(() => {
    if (personalRecipes.length > 0 && !isLoading) {
      calculateRecipeAvailabilities();
    }
  }, [personalRecipes, fridgeId]);

  useFocusEffect(
    React.useCallback(() => {
      setCurrentPage(1);
      loadInitialData();
    }, []),
  );

  const isFavorite = (recipeId: number) => {
    return favoriteRecipeIds.includes(recipeId);
  };

  const getFavoriteRecipes = () => {
    return personalRecipes.filter(recipe => isFavorite(recipe.id));
  };

  const getFilteredRecipes = () => {
    let recipes = personalRecipes;
    if (currentTab === 'favorites') {
      recipes = getFavoriteRecipes();
    }
    return recipes.slice(0, currentPage * ITEMS_PER_PAGE);
  };

  const filteredRecipes = getFilteredRecipes();

  const getAllRecipesCount = () => {
    if (currentTab === 'all') {
      return personalRecipes.length;
    } else {
      return getFavoriteRecipes().length;
    }
  };

  const allFilteredRecipes = getAllRecipesCount();
  const hasMoreRecipes = filteredRecipes.length < allFilteredRecipes;

  // 즐겨찾기 토글
  const toggleFavorite = async (recipeId: number) => {
    try {
      const result = await RecipeAPI.toggleFavorite(recipeId);

      if (result.favorite) {
        setFavoriteRecipeIds(prev => [...prev, recipeId]);
      } else {
        setFavoriteRecipeIds(prev => prev.filter(id => id !== recipeId));
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패', error);
      setFavoriteErrorModalVisible(true);
    }
  };

  // 레시피 삭제
  const deleteRecipe = (recipeId: number) => {
    setSelectedRecipeId(recipeId);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecipeId) return;

    try {
      await RecipeAPI.deleteRecipe(selectedRecipeId);

      setPersonalRecipes(prev => prev.filter(r => r.id !== selectedRecipeId));
      setFavoriteRecipeIds(prev => prev.filter(id => id !== selectedRecipeId));

      setDeleteConfirmVisible(false);
      setDeleteSuccessVisible(true);
      setSelectedRecipeId(null);
    } catch (error) {
      console.error('레시피 삭제 실패', error);
      setDeleteConfirmVisible(false);
      setDeleteErrorVisible(true);
      setSelectedRecipeId(null);
    }
  };

  // 드래그 엔드 핸들러
  const handleDragEnd = async ({ data }: { data: Recipe[] }) => {
    if (currentTab === 'all') {
      setPersonalRecipes(data);
    } else {
      setOrderChangeErrorVisible(true);
    }
  };

  // 스크롤 방향 기반 버튼 표시 로직
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const isScrollingUp = scrollY < lastScrollY;
    const isScrollingDown = scrollY > lastScrollY;
    const hasScrolledEnough = scrollY > 100;

    if (isScrollingUp && hasScrolledEnough) {
      setShowScrollToTop(true);
    } else if (isScrollingDown) {
      setShowScrollToTop(false);
    } else if (scrollY < 100) {
      setShowScrollToTop(false);
    }

    setLastScrollY(scrollY);
  };

  const scrollToTop = () => {
    if (filteredRecipes.length === 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F4858" />
          <Text style={styles.loadingText}>레시피 데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GestureHandlerRootView style={styles.container}>
        <RecipeHeader fridgeId={fridgeId} fridgeName={fridgeName} />

        {/* Tab */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'all' && styles.activeTab]}
            onPress={() => {
              setCurrentTab('all');
              setCurrentPage(1);
            }}
          >
            <Text
              style={[
                styles.tabText,
                currentTab === 'all' && styles.activeTabText,
              ]}
            >
              전체 레시피 ({personalRecipes.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, currentTab === 'favorites' && styles.activeTab]}
            onPress={() => {
              setCurrentTab('favorites');
              setCurrentPage(1);
            }}
          >
            <Text
              style={[
                styles.tabText,
                currentTab === 'favorites' && styles.activeTabText,
              ]}
            >
              즐겨찾기 ({getFavoriteRecipes().length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recipe Card List */}
        {filteredRecipes.length === 0 ? (
          <ScrollView
            ref={scrollViewRef}
            style={styles.content}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {currentTab === 'all' && (
              <SharedRecipeFolder
                recipeCount={sharedRecipes.length}
                onPress={() => {
                  setShowFloatingMenu(false);
                  navigation.navigate('SharedFolder', {
                    currentFridgeId: fridgeId,
                  });
                }}
              />
            )}

            <View style={styles.emptyContainer}>
              <Icon name="restaurant" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {currentTab === 'favorites'
                  ? '즐겨찾기한 레시피가 없습니다'
                  : '레시피가 없습니다'}
              </Text>
              <Text style={styles.emptySubText}>
                {currentTab === 'favorites'
                  ? '하트 버튼을 눌러 레시피를 즐겨찾기에 추가해보세요'
                  : '새 레시피를 추가해보세요'}
              </Text>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.content}>
            <DraggableFlatList
              ref={flatListRef}
              data={filteredRecipes}
              onDragEnd={handleDragEnd}
              keyExtractor={item => item.id}
              renderItem={({ item, drag, isActive }) => {
                const isDragEnabled = currentTab === 'all';
                const availability = recipeAvailabilities.get(item.id);

                return (
                  <RenderRecipeItem
                    item={item}
                    drag={drag}
                    isActive={isActive}
                    isDragEnabled={isDragEnabled}
                    onDelete={deleteRecipe}
                    onToggleFavorite={toggleFavorite}
                    onPress={recipe => {
                      setShowFloatingMenu(false);
                      navigation.navigate('RecipeDetail', {
                        recipe,
                        fridgeId,
                        fridgeName,
                        isSharedRecipe: true,
                      });
                    }}
                    isFavorite={isFavorite(item.id)}
                    availableIngredientsCount={
                      availability?.availableIngredientsCount || 0
                    }
                    totalIngredientsCount={
                      availability?.totalIngredientsCount ||
                      item.ingredients?.length ||
                      0
                    }
                    canMakeWithFridge={availability?.canMakeWithFridge || false}
                  />
                );
              }}
              onScrollOffsetChange={offset => {
                if (offset > 100) {
                  setShowScrollToTop(true);
                } else {
                  setShowScrollToTop(false);
                }
                setLastScrollY(offset);
              }}
              ListHeaderComponent={
                <ListHeader
                  shouldShow={currentTab === 'all'}
                  recipeCount={sharedRecipes.length}
                  onPress={() => {
                    setShowFloatingMenu(false);
                    navigation.navigate('SharedFolder', {
                      currentFridgeId: fridgeId,
                      currentFridgeName: fridgeName,
                    });
                  }}
                />
              }
              ListFooterComponent={
                <ListFooter
                  hasMoreRecipes={hasMoreRecipes}
                  onLoadMore={loadMore}
                  currentCount={filteredRecipes.length}
                  totalCount={allFilteredRecipes}
                />
              }
            />
          </View>
        )}

        {/* Floating Button */}
        <FloatingButton
          isMenuOpen={showFloatingMenu}
          onToggleMenu={() => setShowFloatingMenu(!showFloatingMenu)}
          onRecipeRegister={() => {
            setShowFloatingMenu(false);
            navigation.navigate('RecipeDetail', {
              isNewRecipe: true,
              fridgeId,
              fridgeName,
              isSharedRecipe: true,
            });
          }}
          onAIRecommend={() => {
            setShowFloatingMenu(false);
            navigation.navigate('AIRecipe');
          }}
          showScrollToTop={showScrollToTop}
          onScrollToTop={scrollToTop}
        />

        {/* 즐겨찾기 에러 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={favoriteErrorModalVisible}
          title="오류"
          message="즐겨찾기 설정에 실패했습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setFavoriteErrorModalVisible(false)}
          onCancel={() => setFavoriteErrorModalVisible(false)}
        />

        {/* 레시피 삭제 확인 모달 */}
        <ConfirmModal
          isAlert={true}
          visible={deleteConfirmVisible}
          title="레시피 삭제"
          message="이 레시피를 삭제하시겠습니까?"
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="삭제"
          cancelText="취소"
          confirmButtonStyle="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteConfirmVisible(false);
            setSelectedRecipeId(null);
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

        {/* 순서 변경 불가 알림 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={orderChangeErrorVisible}
          title="순서 변경 불가"
          message="전체 레시피 탭에서만 순서를 변경할 수 있습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setOrderChangeErrorVisible(false)}
          onCancel={() => setOrderChangeErrorVisible(false)}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default RecipeScreen;
