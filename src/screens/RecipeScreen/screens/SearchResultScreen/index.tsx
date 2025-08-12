import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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

// 🔧 AsyncStorage 유틸리티 import
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
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const ITEMS_PER_PAGE = 15;

  // 즐겨찾기 여부 확인 함수
  const isFavorite = (recipeId: string): boolean => {
    return favoriteRecipeIds.includes(recipeId);
  };

  // 🔧 함수들을 useCallback으로 정의 (호이스팅 문제 해결)
  const handleSearch = React.useCallback(async () => {
    if (!searchQuery.trim()) return;

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

  // 검색 히스토리 항목 클릭
  const handleHistoryItemPress = (item: string) => {
    setSearchQuery(item);
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

  // 🔧 즐겨찾기 토글 (AsyncStorage 연결)
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
    }
  };

  // 🔧 레시피 삭제 (AsyncStorage 연결)
  const deleteRecipe = async (recipeId: string) => {
    try {
      // AsyncStorage에서 삭제
      await RecipeStorage.deletePersonalRecipe(recipeId);

      // 검색 결과에서도 제거
      setSearchResults(prev => prev.filter(r => r.id !== recipeId));

      // 즐겨찾기에서도 제거
      if (favoriteRecipeIds.includes(recipeId)) {
        await FavoriteStorage.removeFavorite(recipeId);
        setFavoriteRecipeIds(prev => prev.filter(id => id !== recipeId));
      }
    } catch (error) {
      console.error('레시피 삭제 실패:', error);
    }
  };

  // 스크롤 이벤트 처리
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(scrollY > 300);
  };

  // 맨 위로 스크롤
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // 더보기
  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const displayedResults = searchResults.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMoreResults = displayedResults.length < searchResults.length;

  // 레시피 카드 컴포넌트
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
                name={isFavorite(recipe.id) ? 'favorite' : 'favorite-border'}
                size={24}
                color={isFavorite(recipe.id) ? '#FF6B6B' : '#999'}
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
        {/* 검색 결과 헤더 */}
        <View style={styles.searchResultHeader}>
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('RecipeHome' as never)}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* 검색창 (클릭하면 검색 화면으로) */}
          <TouchableOpacity
            style={styles.searchBarContainer}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <Text style={styles.searchText}>
              {searchQuery || 'Title, text, hashtag'}
            </Text>
          </TouchableOpacity>

          {/* X 버튼 (검색 화면으로) */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="close" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 검색 결과 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* 검색 결과 헤더 */}
          {searchResults.length > 0 && (
            <View style={styles.resultHeader}>
              <Text style={styles.resultCount}>
                "{searchQuery}" 검색 결과 {searchResults.length}개
              </Text>
            </View>
          )}

          {/* 로딩 상태 */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          )}

          {/* 검색 결과 없음 */}
          {!isLoading && searchResults.length === 0 && searchQuery && (
            <View style={styles.noResultContainer}>
              <Icon name="search-off" size={48} color="#ccc" />
              <Text style={styles.noResultText}>검색 결과가 없습니다</Text>
              <Text style={styles.noResultSubText}>
                다른 키워드로 검색해보세요
              </Text>
            </View>
          )}

          {/* 검색 결과 리스트 */}
          {!isLoading &&
            displayedResults.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}

          {/* 더보기 버튼 */}
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

        {/* 맨 위로 버튼 */}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },

  container: {
    flex: 1,
  },

  // 검색 결과 헤더 스타일
  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
  },

  backButton: {
    padding: 8,
    marginRight: 8,
  },

  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },

  closeButton: {
    padding: 8,
    marginLeft: 8,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
  },

  resultHeader: {
    paddingVertical: 16,
  },

  resultCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
  },

  noResultContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  noResultText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
  },

  noResultSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },

  // 레시피 카드 스타일들
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },

  recipeCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
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

  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },

  recipeDate: {
    fontSize: 12,
    color: '#999',
  },

  favoriteButton: {
    padding: 8,
    marginLeft: 12,
  },

  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },

  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },

  scrollToTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  loadMoreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  loadMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SearchResultScreen;
