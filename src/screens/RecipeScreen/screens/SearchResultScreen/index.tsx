import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GestureHandlerRootView,
  Swipeable,
} from 'react-native-gesture-handler';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Recipe, RecipeStackParamList } from '../../RecipeNavigator';
import { styles } from './styles';

// utility funcs
import {
  RecipeStorage,
  FavoriteStorage,
  SearchHistoryStorage,
} from '../../../../utils/AsyncStorageUtils';

type SearchResultScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'SearchResult'
>;
type SearchResultScreenRouteProp = RouteProp<
  RecipeStackParamList,
  'SearchResult'
>;

interface SearchResultScreenProps {}

const SearchResultScreen: React.FC<SearchResultScreenProps> = () => {
  const navigation = useNavigation<SearchResultScreenNavigationProp>();
  const route = useRoute<SearchResultScreenRouteProp>();
  const { query: initialQuery } = route.params;

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [_searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isInputActive, setIsInputActive] = useState(false); // 입력 활성 상태 추가

  const scrollViewRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);
  const ITEMS_PER_PAGE = 15;

  // 초기 검색 실행
  useEffect(() => {
    if (initialQuery) {
      handleSearch();
      loadFavorites();
    }
  }, [initialQuery]);

  // 즐겨찾기 목록 로드
  const loadFavorites = async () => {
    try {
      const favorites = await FavoriteStorage.getFavoriteIds();
      setFavoriteRecipeIds(favorites);
    } catch (error) {
      console.error('즐겨찾기 로드 실패:', error);
    }
  };

  // is Stared Recipe
  const isFavorite = (recipeId: string): boolean => {
    return favoriteRecipeIds.includes(recipeId);
  };

  const handleSearch = React.useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // 검색 히스토리 업데이트
      const newHistory = await SearchHistoryStorage.addSearchQuery(searchQuery);
      setSearchHistory(newHistory);

      // 실제 레시피 데이터에서 검색
      const allRecipes = await RecipeStorage.getPersonalRecipes();
      const results = allRecipes.filter(
        recipe =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      setSearchResults(results);
      setCurrentPage(1);
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // 검색어 변경 시 실시간 검색
  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);

    // 디바운싱을 위한 타이머 (선택사항)
    // clearTimeout(searchTimer.current);
    // searchTimer.current = setTimeout(() => {
    //   if (text.trim()) {
    //     handleSearch();
    //   } else {
    //     setSearchResults([]);
    //   }
    // }, 300);
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
    setIsInputActive(true); // X 버튼 클릭 시에도 활성 상태 유지
    searchInputRef.current?.focus();
  };

  // 검색 히스토리 항목 클릭
  const handleHistoryItemPress = (item: string) => {
    setSearchQuery(item);
    handleSearch();
  };

  // 검색 히스토리 항목 삭제
  const removeHistoryItem = async (item: string) => {
    try {
      const newHistory = await SearchHistoryStorage.removeSearchQuery(item);
      setSearchHistory(newHistory);
    } catch (error) {
      console.error('검색 히스토리 항목 삭제 실패:', error);
    }
  };

  // 검색 히스토리 전체 삭제
  const clearAllHistory = async () => {
    try {
      await SearchHistoryStorage.clearSearchHistory();
      setSearchHistory([]);
    } catch (error) {
      console.error('검색 히스토리 전체 삭제 실패:', error);
    }
  };

  // toggle Star
  const toggleFavorite = async (recipeId: string) => {
    try {
      const isNowFavorite = await FavoriteStorage.toggleFavorite(recipeId);

      // Update local state
      if (isNowFavorite) {
        setFavoriteRecipeIds(prev => [...prev, recipeId]);
      } else {
        setFavoriteRecipeIds(prev => prev.filter(id => id !== recipeId));
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    }
  };

  // Delete Recipe
  const deleteRecipe = async (recipeId: string) => {
    try {
      // from asyncstorage
      await RecipeStorage.deletePersonalRecipe(recipeId);

      // from research result
      setSearchResults(prev => prev.filter(r => r.id !== recipeId));

      // from stared recipe
      if (favoriteRecipeIds.includes(recipeId)) {
        await FavoriteStorage.removeFavorite(recipeId);
        setFavoriteRecipeIds(prev => prev.filter(id => id !== recipeId));
      }
    } catch (error) {
      console.error('레시피 삭제 실패:', error);
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

  // Component : Recipe Card
  const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteRecipe(recipe.id)}
      >
        <Icon name="delete" size={24} color="white" />
        <Text style={styles.deleteButtonText}>삭제</Text>
      </TouchableOpacity>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          style={styles.recipeCard}
          onPress={() =>
            navigation.navigate('RecipeDetail', {
              recipe,
              fridgeId: 1,
              fridgeName: '우리집 냉장고',
            })
          }
        >
          <View style={styles.recipeCardContent}>
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Text style={styles.recipeDescription}>{recipe.description}</Text>
              <Text style={styles.recipeDate}>{recipe.createdAt}</Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(recipe.id)}
            >
              <Icon
                name={isFavorite(recipe.id) ? 'star' : 'star-border'}
                size={24}
                color={isFavorite(recipe.id) ? '#ffd000' : '#999'}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GestureHandlerRootView style={styles.container}>
        {/* Header */}
        <View style={styles.searchResultHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('RecipeHome' as never)}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          {/* Improved Search Bar */}
          <View
            style={[
              styles.searchBarContainer,
              (isSearchFocused || isInputActive) && styles.searchBarFocused,
            ]}
          >
            <Icon
              name="search"
              size={20}
              color="#333"
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={text => {
                handleSearchQueryChange(text);
                setIsInputActive(text.length > 0); // 텍스트 있으면 활성 상태
              }}
              onSubmitEditing={handleSearchSubmit}
              onFocus={() => {
                console.log('포커스됨');
                setIsSearchFocused(true);
                setIsInputActive(true);
              }}
              onBlur={() => {
                console.log('블러됨');
                setIsSearchFocused(false);
                // 텍스트가 있으면 활성 상태 유지, 없으면 비활성
                setIsInputActive(searchQuery.length > 0);
              }}
              placeholder="Title, text, hashtag"
              placeholderTextColor="#999"
              selectionColor="#29a448ff"
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

          {/* Result List */}
          {!isLoading &&
            displayedResults.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}

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
            <Icon name="keyboard-arrow-up" size={28} color="white" />
          </TouchableOpacity>
        )}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default SearchResultScreen;
