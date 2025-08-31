import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';
import { Recipe, RecipeStackParamList } from './RecipeNavigator';

// AsyncStorage 유틸리티 import
import {
  RecipeStorage,
  FavoriteStorage,
  SharedRecipeStorage,
} from '../../utils/AsyncStorageUtils';

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

// Mock 공동 레시피 데이터 (초기값)
const mockSharedRecipes: Recipe[] = [];

// Mock 데이터 생성 함수 (초기 데이터용)
const generateInitialMockRecipes = (count: number): Recipe[] => {
  const baseRecipes = [{ title: '레시피 이름' }];

  return Array.from({ length: count }, (_, index) => {
    const baseRecipe = baseRecipes[index % baseRecipes.length];
    return {
      id: (index + 1).toString(),
      title: `${baseRecipe.title} ${
        Math.floor(index / baseRecipes.length) + 1
      }`,
      createdAt: `2024-01-${String(15 - (index % 15)).padStart(2, '0')}`,
    };
  });
};

// 메인 컴포넌트 props 인터페이스
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
  // 새로 추가: 조리 가능성 정보
  const [recipeAvailabilities, setRecipeAvailabilities] = useState<
    Map<string, RecipeAvailabilityInfo>
  >(new Map());

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<any>(null);
  const ITEMS_PER_PAGE = 15;

  // 조리 가능성 계산 함수
  const calculateRecipeAvailabilities = async () => {
    try {
      if (personalRecipes.length > 0 && fridgeId) {
        const availabilities = await calculateMultipleRecipeAvailability(
          personalRecipes,
          fridgeId,
        );
        setRecipeAvailabilities(availabilities);
      }
    } catch (error) {
      console.error('레시피 가용성 계산 실패:', error);
      setRecipeAvailabilities(new Map());
    }
  };

  // 초기 데이터 로드
  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // 병렬로 모든 데이터 로드
      const [storedPersonalRecipes, storedFavoriteIds, storedSharedRecipes] =
        await Promise.all([
          RecipeStorage.getPersonalRecipes(),
          FavoriteStorage.getFavoriteIds(),
          SharedRecipeStorage.getSharedRecipes(),
        ]);

      // 개인 레시피 설정 (없으면 초기 mock 데이터 사용)
      if (storedPersonalRecipes.length > 0) {
        setPersonalRecipes(storedPersonalRecipes);
      } else {
        // 첫 실행 시 초기 데이터 생성 및 저장
        const initialRecipes = generateInitialMockRecipes(20);
        setPersonalRecipes(initialRecipes);
        await RecipeStorage.savePersonalRecipes(initialRecipes);
      }

      // 공유 레시피 설정 (없으면 mock 데이터 사용)
      if (storedSharedRecipes.length > 0) {
        setSharedRecipes(storedSharedRecipes);
      } else {
        setSharedRecipes(mockSharedRecipes);
        await SharedRecipeStorage.saveSharedRecipes(mockSharedRecipes);
      }

      // 즐겨찾기 설정
      setFavoriteRecipeIds(storedFavoriteIds);

      // 조리 가능성 계산 (데이터 로드 후 잠시 대기)
      setTimeout(() => {
        calculateRecipeAvailabilities();
      }, 100);
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
      // 에러 시 기본값 설정
      setPersonalRecipes(generateInitialMockRecipes(20));
      setSharedRecipes(mockSharedRecipes);
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
      calculateRecipeAvailabilities();
    }
  }, [personalRecipes, fridgeId]);

  // 화면 포커스 시 데이터 동기화
  useFocusEffect(
    React.useCallback(() => {
      // 검색에서 돌아올 때 상태 초기화
      setCurrentPage(1);

      // 데이터 다시 로드 (다른 화면에서 변경될 수 있으므로)
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

  const toggleFavorite = async (recipeId: string) => {
    try {
      const isNowFavorite = await FavoriteStorage.toggleFavorite(recipeId);

      // 로컬 상태 업데이트
      if (isNowFavorite) {
        setFavoriteRecipeIds(prev => [...prev, recipeId]);
      } else {
        setFavoriteRecipeIds(prev => prev.filter(id => id !== recipeId));
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      Alert.alert('오류', '즐겨찾기 설정에 실패했습니다.');
    }
  };

  const deleteRecipe = (recipeId: string) => {
    Alert.alert('레시피 삭제', '이 레시피를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            // AsyncStorage에서 삭제
            await RecipeStorage.deletePersonalRecipe(recipeId);

            // 로컬 상태 업데이트
            setPersonalRecipes(prev => prev.filter(r => r.id !== recipeId));

            // 즐겨찾기에서도 제거
            if (favoriteRecipeIds.includes(recipeId)) {
              await FavoriteStorage.removeFavorite(recipeId);
              setFavoriteRecipeIds(prev => prev.filter(id => id !== recipeId));
            }
          } catch (error) {
            console.error('레시피 삭제 실패:', error);
            Alert.alert('오류', '레시피 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleDragEnd = async ({ data }: { data: Recipe[] }) => {
    if (currentTab === 'all') {
      try {
        // AsyncStorage에 새로운 순서 저장
        await RecipeStorage.savePersonalRecipes(data);
        setPersonalRecipes(data);
      } catch (error) {
        console.error('레시피 순서 저장 실패:', error);
        Alert.alert('오류', '레시피 순서 변경에 실패했습니다.');
      }
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

    // 스크롤 방향 계산
    const isScrollingUp = scrollY < lastScrollY;
    const isScrollingDown = scrollY > lastScrollY;
    const hasScrolledEnough = scrollY > 100;

    // 위로 스크롤 중이고 충분히 스크롤했을 때 버튼 표시
    if (isScrollingUp && hasScrolledEnough) {
      setShowScrollToTop(true);
    }
    // 아래로 스크롤 중일 때 버튼 숨김
    else if (isScrollingDown) {
      setShowScrollToTop(false);
    }
    // 맨 위에 거의 도달했을 때도 버튼 숨김
    else if (scrollY < 100) {
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
            {/* 공동 레시피 폴더 */}
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
                const availability = recipeAvailabilities.get(item.id); // 조리 가능성 정보 가져오기

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
                    // 조리 가능성 정보 전달
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
                // 간단한 스크롤 로직: 100px 이상 스크롤하면 버튼 표시
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
