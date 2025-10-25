import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

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
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#e8f5e8',
  },
  backButton: {
    marginRight: scale(8),
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: scale(25),
    paddingHorizontal: scale(16),
    marginHorizontal: scale(8),
    marginRight: scale(0),
    position: 'relative',
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: scale(16),
    color: '#444',
    paddingLeft: scale(8),
    paddingRight: scale(40),
    height: scale(40),
  },

  clearButton: {
    position: 'absolute',
    right: scale(12),
    top: '50%',
    transform: [{ translateY: -10 }],
  },

  clearButtonCircle: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ===== 여기까지 새로 추가 =====

  content: {
    flex: 1,
    paddingHorizontal: scale(16),
    backgroundColor: '#e8f5e8',
  },
  resultHeader: {
    paddingVertical: scale(16),
  },
  resultCount: {
    fontSize: scale(16),
    fontWeight: '500',
    color: '#333',
  },
  loadingContainer: {
    paddingVertical: scale(40),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scale(16),
    color: '#666',
  },
  noResultContainer: {
    paddingVertical: scale(60),
    alignItems: 'center',
  },
  noResultText: {
    fontSize: scale(18),
    fontWeight: '500',
    color: '#666',
    marginTop: scale(16),
  },
  noResultSubText: {
    fontSize: scale(14),
    color: '#999',
    marginTop: scale(8),
  },
  // 레시피 카드 스타일들
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: scale(16),
    marginBottom: scale(12),
    shadowColor: '#333',
    shadowOffset: {
      width: scale(0),
      height: scale(5),
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  recipeCardContent: {
    flexDirection: 'row',
    padding: scale(16),
    alignItems: 'center',
  },
  recipeIcon: {
    width: scale(30),
    height: scale(30),
    marginRight: scale(16),
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(4),
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // favorite Button
  favoriteButton: {
    padding: scale(8),
    marginLeft: scale(8),
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: scale(30),
    right: scale(30),
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#333',
    shadowOffset: {
      width: scale(0),
      height: scale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  loadMoreContainer: {
    paddingVertical: scale(20),
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#29a448ff',
    paddingHorizontal: scale(24),
    paddingVertical: scale(12),
    borderRadius: scale(8),
  },
  loadMoreText: {
    color: 'white',
    fontSize: scale(16),
    fontWeight: '500',
  },
});
