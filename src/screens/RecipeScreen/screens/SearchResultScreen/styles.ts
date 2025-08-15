import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8f5e8',
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
    backgroundColor: '#e8f5e8',
  },
  backButton: {
    marginRight: 8,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginRight: 0,
    position: 'relative',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    paddingLeft: 8,
    paddingRight: 40,
    height: 40,
  },

  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },

  clearButtonCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ===== 여기까지 새로 추가 =====

  content: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#e8f5e8',
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
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
  // favorite Button
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#29a448ff',
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
