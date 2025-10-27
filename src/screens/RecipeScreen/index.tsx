// screens/RecipeScreen/index.tsx - API 연동 버전 (실제 API 사용)
import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';
import { Recipe, RecipeStackParamList } from './RecipeNavigator';

// API 서비스 import
import RecipeAPI from '../../services/API/RecipeAPI';
import { IngredientControllerAPI } from '../../services/API/ingredientControllerAPI';

// 조리 가능성 계산 유틸리티 import
import {
  calculateMultipleRecipeAvailability,
  RecipeAvailabilityInfo,
} from '../../utils/recipeAvailabilityUtils';

// 컴포넌트 imports
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
      fridgeId: string;
      fridgeName: string;
    };
  };
}

const RecipeScreen: React.FC<RecipeScreenProps> = ({ route }) => {
  const navigation = useNavigation<RecipeHomeNavigationProp>();
  const { fridgeId, fridgeName } = route.params;

  // State 관리
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

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<any>(null);
  const ITEMS_PER_PAGE = 15;

  // 조리 가능성 계산 함수 (API 기반)
  const calculateRecipeAvailabilities = async () => {
    try {
      if (personalRecipes.length > 0 && fridgeId) {
        console.log('🔍 조리 가능성 계산 시작...');

        // 냉장고 재료를 API에서 가져오기
        const fridgeItems =
          await IngredientControllerAPI.getRefrigeratorIngredients(fridgeId);

        // 기존 로직 재활용 (recipeAvailabilityUtils 사용)
        const availabilities = await calculateMultipleRecipeAvailability(
          personalRecipes,
          fridgeId,
        );
        setRecipeAvailabilities(availabilities);
        console.log('✅ 조리 가능성 계산 완료');
      }
    } catch (error) {
      console.error('❌ 레시피 가용성 계산 실패:', error);
      setRecipeAvailabilities(new Map());
    }
  };

  // 초기 데이터 로드 (실제 API 사용)
  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      console.log('🔄 레시피 초기 데이터 로드 시작...');
      console.log('📦 현재 냉장고 ID:', fridgeId);

      // 🔥 Promise.allSettled로 변경 (일부 실패해도 계속 진행)
      const [personalResult, favoriteResult, sharedResult] =
        await Promise.allSettled([
          RecipeAPI.getRecipeList(),
          RecipeAPI.getFavoriteRecipes(),
          RecipeAPI.getSharedRecipes(fridgeId),
        ]);

      // 🔥 각 결과별 처리
      if (personalResult.status === 'fulfilled') {
        console.log('✅ 개인 레시피 로드 성공:', personalResult.value.length);
        setPersonalRecipes(personalResult.value);
      } else {
        console.warn('⚠️ 개인 레시피 로드 실패:', personalResult.reason);
        setPersonalRecipes([]);
      }

      if (favoriteResult.status === 'fulfilled') {
        console.log('✅ 즐겨찾기 로드 성공:', favoriteResult.value.length);
        const favoriteIds = favoriteResult.value.map(recipe => recipe.id);
        setFavoriteRecipeIds(favoriteIds);
      } else {
        console.warn('⚠️ 즐겨찾기 로드 실패:', favoriteResult.reason);
        setFavoriteRecipeIds([]);
      }

      if (sharedResult.status === 'fulfilled') {
        console.log('✅ 공유 레시피 로드 성공:', sharedResult.value.length);
        setSharedRecipes(sharedResult.value);
      } else {
        console.warn('⚠️ 공유 레시피 로드 실패:', sharedResult.reason);
        setSharedRecipes([]);
      }

      // 조리 가능성 계산은 personalRecipes가 설정된 후 useEffect에서 처리
    } catch (error) {
      console.error('❌ 초기 데이터 로드 실패:', error);
      // 🔥 완전 실패 시에도 빈 상태로 표시
      setPersonalRecipes([]);
      setSharedRecipes([]);
      setFavoriteRecipeIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  React.useEffect(() => {
    loadInitialData();
  }, []);

  // personalRecipes가 변경될 때마다 조리 가능성 재계산
  React.useEffect(() => {
    if (personalRecipes.length > 0 && !isLoading) {
      console.log('🔍 personalRecipes 변경 감지, 조리 가능성 재계산...');
      calculateRecipeAvailabilities();
    }
  }, [personalRecipes, fridgeId]);

  // 화면 포커스 시 데이터 동기화
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 화면 포커스, 데이터 새로고침...');
      setCurrentPage(1);
      loadInitialData();
    }, []),
  );

  // 즐겨찾기 헬퍼 함수들
  const isFavorite = (recipeId: string) => {
    return favoriteRecipeIds.includes(recipeId);
  };

  const getFavoriteRecipes = () => {
    return personalRecipes.filter(recipe => isFavorite(recipe.id));
  };

  // 현재 표시할 레시피들 필터링
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

  // 즐겨찾기 토글 (API 기반)
  const toggleFavorite = async (recipeId: string) => {
    try {
      console.log('🔄 즐겨찾기 토글:', recipeId);
      const result = await RecipeAPI.toggleFavorite(recipeId);

      // 로컬 상태 업데이트
      if (result.favorite) {
        setFavoriteRecipeIds(prev => [...prev, recipeId]);
        console.log('✅ 즐겨찾기 추가:', recipeId);
      } else {
        setFavoriteRecipeIds(prev => prev.filter(id => id !== recipeId));
        console.log('✅ 즐겨찾기 제거:', recipeId);
      }
    } catch (error) {
      console.error('❌ 즐겨찾기 토글 실패:', error);
      Alert.alert('오류', '즐겨찾기 설정에 실패했습니다.');
    }
  };

  // 레시피 삭제 (API 기반)
  const deleteRecipe = (recipeId: number) => {
    Alert.alert('레시피 삭제', '이 레시피를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log('🔄 레시피 삭제:', recipeId);
            await RecipeAPI.deleteRecipe(recipeId);

            // 로컬 상태 업데이트
            setPersonalRecipes(prev => prev.filter(r => r.id !== recipeId));
            setFavoriteRecipeIds(prev => prev.filter(id => id !== recipeId));

            console.log('✅ 레시피 삭제 완료:', recipeId);
            Alert.alert('성공', '레시피가 삭제되었습니다.');
          } catch (error) {
            console.error('❌ 레시피 삭제 실패:', error);
            Alert.alert('오류', '레시피 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  // 드래그 엔드 핸들러 (순서 변경은 로컬에서만)
  const handleDragEnd = async ({ data }: { data: Recipe[] }) => {
    if (currentTab === 'all') {
      // TODO: 순서 변경 API가 있다면 여기서 호출
      setPersonalRecipes(data);
      console.log('✅ 레시피 순서 변경 완료');
    } else {
      Alert.alert(
        '순서 변경 불가',
        '전체 레시피 탭에서만 순서를 변경할 수 있습니다.',
        [{ text: '확인' }],
      );
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

  // 로딩 중일 때
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View
          style={[
            styles.container,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Text style={{ fontSize: 16, color: '#666' }}>
            레시피 데이터를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GestureHandlerRootView style={styles.container}>
        <RecipeHeader />

        {/* 탭 */}
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

        {/* 레시피 리스트 */}
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
                  navigation.navigate('SharedFolder');
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
                      });
                    }}
                    isFavorite={isFavorite(item.id)}
                    availableIngredientsCount={
                      availability?.availableIngredientsCount || 0
                    }
                    totalIngredientsCount={
                      availability?.totalIngredientsCount || 0
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
                    navigation.navigate('SharedFolder');
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

        {/* 플로팅 버튼 */}
        <FloatingButton
          isMenuOpen={showFloatingMenu}
          onToggleMenu={() => setShowFloatingMenu(!showFloatingMenu)}
          onRecipeRegister={() => {
            setShowFloatingMenu(false);
            navigation.navigate('RecipeDetail', {
              isNewRecipe: true,
              fridgeId,
              fridgeName,
            });
          }}
          onAIRecommend={() => {
            setShowFloatingMenu(false);
            navigation.navigate('AIRecipe');
          }}
          showScrollToTop={showScrollToTop}
          onScrollToTop={scrollToTop}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default RecipeScreen;
