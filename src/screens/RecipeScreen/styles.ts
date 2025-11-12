import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
//const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
//const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
  none: {},

  container: {
    flex: 1,
  },

  // 헤더 영역
  header: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // 로딩 스타일
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: scale(12),
    fontSize: scale(16),
    color: '#666',
  },

  // 검색 관련
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    marginBottom: scale(16),
  },
  searchInput: {
    flex: 1,
    height: scale(44),
    fontSize: scale(16),
    color: '#333',
    paddingHorizontal: scale(8),
  },
  searchButton: {
    padding: scale(8),
  },

  searchHistoryContainer: {
    position: 'absolute',
    top: scale(76),
    left: scale(16),
    right: scale(16),
    backgroundColor: 'white',
    borderRadius: scale(12),
    paddingVertical: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  searchHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
  },
  searchHistoryText: {
    marginLeft: scale(8),
    fontSize: scale(16),
    color: '#333',
  },

  // 탭 관련
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    marginHorizontal: scale(16),
    marginTop: scale(16),
    marginBottom: scale(8),
    borderRadius: scale(12),
    padding: scale(4),
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.08,
    shadowRadius: scale(8),
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#666',
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(4),
    elevation: 3,
  },
  tabText: {
    fontSize: scale(15),
    fontWeight: '600',
    color: '#444',
  },
  activeTabText: {
    color: '#f8f8f8',
  },

  // 콘텐츠 영역
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
  },

  // 공동 레시피 폴더 카드
  sharedFolderCard: {
    backgroundColor: 'white',
    borderRadius: scale(16),
    marginBottom: scale(20),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(3),
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 6,
    borderLeftWidth: scale(4),
    borderLeftColor: '#34C759',
  },

  folderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  folderIconContainer: {
    position: 'relative',
    marginRight: scale(16),
  },

  folderBadge: {
    position: 'absolute',
    top: scale(-8),
    right: scale(-8),
    backgroundColor: '#FF6B6B',
    borderRadius: scale(12),
    minWidth: scale(24),
    height: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scale(2),
    borderColor: 'white',
  },

  folderBadgeText: {
    color: 'white',
    fontSize: scale(12),
    fontWeight: '700',
  },

  folderInfo: {
    flex: 1,
  },

  folderTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#333',
    marginBottom: scale(4),
  },

  folderDescription: {
    fontSize: scale(14),
    color: '#666',
    marginBottom: scale(6),
    lineHeight: scale(20),
  },

  folderSubInfo: {
    fontSize: scale(12),
    color: '#34C759',
    fontWeight: '500',
  },

  // 레시피 카드
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: scale(16),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },

  recipeCardContent: {
    flexDirection: 'row',
    padding: scale(16),
    alignItems: 'center',
  },

  recipeInfo: {
    flex: 1,
  },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dragHandle: {
    padding: scale(12),
    marginLeft: scale(4),
    backgroundColor: '#f5f5f5',
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: scale(60),
  },

  dragHint: {
    fontSize: scale(10),
    color: '#999',
    marginTop: scale(2),
  },

  // 드래그 관련 스타일
  draggingItem: {
    elevation: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },

  draggingCard: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
    borderWidth: scale(2),
  },

  noDragCard: {
    // 드래그 불가능한 상태일 때의 스타일 (현재는 기본과 동일)
  },

  recipeTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(4),
  },

  recipeDescription: {
    fontSize: scale(14),
    color: '#666',
    marginBottom: scale(8),
    lineHeight: scale(20),
  },

  recipeDate: {
    fontSize: scale(12),
    color: '#999',
  },

  favoriteButton: {
    padding: scale(8),
    marginLeft: scale(12),
  },

  // 삭제 버튼 (스와이프 시 나타남)
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(80),
    marginBottom: scale(12),
    borderTopRightRadius: scale(16),
    borderBottomRightRadius: scale(16),
  },

  deleteButtonText: {
    color: 'white',
    fontSize: scale(12),
    fontWeight: '500',
    marginTop: scale(4),
  },

  // 더보기 버튼
  loadMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(20),
    marginBottom: scale(100), // 플로팅 버튼과 겹치지 않도록
  },

  loadMoreText: {
    fontSize: scale(16),
    color: '#666',
    marginRight: scale(4),
  },

  // 플로팅 버튼들
  floatingButtonContainer: {
    position: 'absolute',
    bottom: scale(30),
    right: scale(20),
    alignItems: 'center',
  },

  scrollToTopButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  floatingMenu: {
    marginBottom: scale(12),
    alignItems: 'center',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: scale(24),
    marginBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  menuText: {
    color: 'white',
    fontSize: scale(14),
    fontWeight: '500',
    marginLeft: scale(8),
  },

  // 빈 상태 (empty state)
  emptyContainer: {
    paddingVertical: scale(60),
    alignItems: 'center',
  },

  emptyText: {
    fontSize: scale(18),
    fontWeight: '500',
    color: '#666',
    marginTop: scale(16),
    textAlign: 'center',
  },

  emptySubText: {
    fontSize: scale(14),
    color: '#999',
    marginTop: scale(8),
    textAlign: 'center',
    paddingHorizontal: scale(32),
    lineHeight: scale(20),
  },

  plusButton: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
