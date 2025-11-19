import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RecipeAPI from '../../../services/API/RecipeAPI';
import {
  calculateMultipleRecipeAvailability,
  RecipeAvailabilityInfo,
} from '../../../utils/recipeAvailabilityUtils';
import { Recipe, RecipeStackParamList } from '../RecipeNavigator';
import { SearchHistoryStorage } from '../../../utils/AsyncStorageUtils';
import { styles } from './styles';

type SearchResultScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'SearchResult'
>;
type SearchResultScreenRouteProp = RouteProp<
  RecipeStackParamList,
  'SearchResult'
>;

interface SearchResultScreenProps {}

const SearchRecipeCard: React.FC<{
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onPress: (recipe: Recipe) => void;
  availableIngredientsCount?: number;
  totalIngredientsCount?: number;
  canMakeWithFridge?: boolean;
}> = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onPress,
  availableIngredientsCount = 0,
  totalIngredientsCount = 0,
  canMakeWithFridge = false,
}) => {
  // 재료 가용성 뱃지 렌더링
  const renderIngredientStatus = () => {
    if (totalIngredientsCount === 0) return null;

    return (
      <View style={styles.ingredientStatus}>
        <View
          style={[
            styles.statusIndicator,
            canMakeWithFridge
              ? styles.canMakeIndicator
              : styles.cannotMakeIndicator,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              canMakeWithFridge ? styles.canMakeText : styles.cannotMakeText,
            ]}
          >
            {availableIngredientsCount} / {totalIngredientsCount}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.recipeCard, canMakeWithFridge && styles.canMakeCard]}
      onPress={() => onPress(recipe)}
    >
      <View style={styles.recipeCardContent}>
        <Image
          source={require('../../../assets/icons/chef_hat_96dp.png')}
          style={styles.recipeIcon}
          resizeMode="contain"
        />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          {/* ✅ 가용성 뱃지 */}
          {renderIngredientStatus()}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite(recipe.id)}
          >
            <Icon
              name={isFavorite ? 'star' : 'star-outline'}
              size={28}
              color={isFavorite ? '#ffd000' : '#999'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SearchResultScreen: React.FC<SearchResultScreenProps> = () => {
  const navigation = useNavigation<SearchResultScreenNavigationProp>();
  const route = useRoute<SearchResultScreenRouteProp>();
  const { query: initialQuery, fridgeId, fridgeName } = route.params;

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [_searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [_isSearchFocused, setIsSearchFocused] = useState(false);
  const [_isInputActive, setIsInputActive] = useState(false);

  // ✅ 가용성 상태 추가
  const [recipeAvailabilities, setRecipeAvailabilities] = useState<
    Map<string, RecipeAvailabilityInfo>
  >(new Map());

  const scrollViewRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
      loadFavorites();
    }
  }, []);

  // 즐겨찾기 목록 로드 API
  const loadFavorites = async () => {
    try {
      const favorites = await RecipeAPI.getFavoriteRecipes();
      const favoriteIds = favorites.map(recipe => recipe.id);
      setFavoriteRecipeIds(favoriteIds);
    } catch (error) {
      setFavoriteRecipeIds([]);
    }
  };

  // is Stared Recipe
  const isFavorite = (recipeId: string): boolean => {
    return favoriteRecipeIds.includes(recipeId);
  };

  // ✅ 검색 결과의 레시피들에 대한 가용성 계산
  const calculateSearchResultAvailabilities = async (recipes: Recipe[]) => {
    if (!fridgeId || recipes.length === 0) {
      return;
    }

    try {
      console.log('🔍 검색 결과 가용성 계산 시작...');

      // 재료 정보가 없는 레시피는 상세 정보 먼저 로드
      const recipesWithIngredients = await Promise.all(
        recipes.map(async recipe => {
          if (!recipe.ingredients || recipe.ingredients.length === 0) {
            try {
              const detailResponse = await RecipeAPI.getRecipeDetail(recipe.id);
              return {
                ...recipe,
                ingredients: detailResponse.ingredients || [],
              };
            } catch (error) {
              console.error(`레시피 ${recipe.id} 상세 로드 실패:`, error);
              return recipe;
            }
          }
          return recipe;
        }),
      );

      const availabilities = await calculateMultipleRecipeAvailability(
        recipesWithIngredients,
        Number(fridgeId),
      );

      setRecipeAvailabilities(availabilities);
      console.log('✅ 검색 결과 가용성 계산 완료');
    } catch (error) {
      console.error('❌ 가용성 계산 실패:', error);
      setRecipeAvailabilities(new Map());
    }
  };

  // ✅ 검색 API (순서 수정)
  const handleSearch = React.useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 검색 시작:', searchQuery);

      // Update search history
      const newHistory = await SearchHistoryStorage.addSearchQuery(searchQuery);
      setSearchHistory(newHistory);

      // 레시피 검색 API
      const results = await RecipeAPI.searchRecipes(searchQuery);
      setSearchResults(results);
      setCurrentPage(1);

      // ✅ 가용성 계산
      if (results.length > 0) {
        await calculateSearchResultAvailabilities(results);
      }
    } catch (error) {
      setSearchResults([]);
      Alert.alert('검색 실패', '레시피 검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, fridgeId]);

  // 검색어 변경 시 실시간 검색
  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
  };

  // 검색어 제출 (키보드 완료 버튼)
  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    setIsSearchFocused(false);
    handleSearch();
  };

  // 검색어 지우기
  const clearSearchQuery = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsInputActive(true);
    searchInputRef.current?.focus();
  };

  // 즐겨찾기 토글 API
  const toggleFavorite = async (recipeId: string) => {
    try {
      console.log('>> 즐겨찾기 토글:', recipeId);

      // API 호출
      const result = await RecipeAPI.toggleFavorite(recipeId);

      // 로컬 상태 업데이트
      if (result.favorite) {
        setFavoriteRecipeIds(prev => [...prev, recipeId]);
        console.log('>> 즐겨찾기 추가');
      } else {
        setFavoriteRecipeIds(prev => prev.filter(id => id !== recipeId));
        console.log('>> 즐겨찾기 제거');
      }
    } catch (error) {
      console.error('X 즐겨찾기 토글 실패:', error);
      Alert.alert('오류', '즐겨찾기 설정에 실패했습니다.');
    }
  };

  // event : scroll
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(scrollY > 300);
  };

  // scroll to top
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // load more
  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const displayedResults = searchResults.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMoreResults = displayedResults.length < searchResults.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GestureHandlerRootView style={styles.container}>
        {/* Header */}
        <View style={styles.searchResultHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Search' as never)}
          >
            <Icon name="arrow-back" size={24} color="#444" />
          </TouchableOpacity>

          {/* Improved Search Bar */}
          <View style={styles.searchBarContainer}>
            <Icon
              name="search"
              size={20}
              color="#444"
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={text => {
                handleSearchQueryChange(text);
                setIsInputActive(text.length > 0);
              }}
              onSubmitEditing={handleSearchSubmit}
              onFocus={() => {
                setIsSearchFocused(true);
                setIsInputActive(true);
              }}
              onBlur={() => {
                setIsSearchFocused(false);
                setIsInputActive(searchQuery.length > 0);
              }}
              placeholder="레시피 제목을 검색해 보세요"
              placeholderTextColor="#999"
              selectionColor="#333"
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              blurOnSubmit={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearchQuery}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <View style={styles.clearButtonCircle}>
                  <Icon name="close" size={16} color="white" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Result */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
        >
          {/* header */}
          {searchResults.length > 0 && (
            <View style={styles.resultHeader}>
              <Text style={styles.resultCount}>
                "{searchQuery}" 검색 결과 {searchResults.length}개
              </Text>
            </View>
          )}

          {/* Loading */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          )}

          {/* No Result */}
          {!isLoading && searchResults.length === 0 && searchQuery && (
            <View style={styles.noResultContainer}>
              <Icon name="search-off" size={48} color="#ccc" />
              <Text style={styles.noResultText}>검색 결과가 없습니다</Text>
              <Text style={styles.noResultSubText}>
                다른 레시피를 검색해보세요
              </Text>
            </View>
          )}

          {/* Result List with Availability */}
          {!isLoading &&
            displayedResults.map(recipe => {
              const availability = recipeAvailabilities.get(recipe.id);

              return (
                <SearchRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={isFavorite(recipe.id)}
                  onToggleFavorite={toggleFavorite}
                  onPress={recipe =>
                    navigation.navigate('RecipeDetail', {
                      recipe,
                      fridgeId: Number(fridgeId) || 1,
                      fridgeName: fridgeName || '우리집 냉장고',
                      isSharedRecipe: true,
                    })
                  }
                  availableIngredientsCount={
                    availability?.availableIngredientsCount || 0
                  }
                  totalIngredientsCount={
                    availability?.totalIngredientsCount ||
                    recipe.ingredients?.length ||
                    0
                  }
                  canMakeWithFridge={availability?.canMakeWithFridge || false}
                />
              );
            })}

          {/* load more */}
          {hasMoreResults && !isLoading && (
            <View style={styles.loadMoreContainer}>
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMore}
              >
                <Text style={styles.loadMoreText}>
                  더보기 ({displayedResults.length}/{searchResults.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* scroll to top */}
        {showScrollToTop && (
          <TouchableOpacity
            style={styles.scrollToTopButton}
            onPress={scrollToTop}
            activeOpacity={0.8}
          >
            <Icon name="north" size={24} color="white" />
          </TouchableOpacity>
        )}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default SearchResultScreen;
