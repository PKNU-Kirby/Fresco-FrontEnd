import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  container: {
    flex: 1,
  },

  // 헤더 영역
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // 검색 관련
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
  },

  searchButton: {
    padding: 8,
  },

  searchHistoryContainer: {
    position: 'absolute',
    top: 76,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },

  searchHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  searchHistoryText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },

  // 탭 관련
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },

  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },

  activeTabText: {
    color: '#007AFF',
  },

  // 콘텐츠 영역
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // 공동 레시피 폴더 카드
  sharedFolderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },

  folderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  folderIconContainer: {
    position: 'relative',
    marginRight: 16,
  },

  folderBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },

  folderBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },

  folderInfo: {
    flex: 1,
  },

  folderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  folderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },

  folderSubInfo: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },

  // 레시피 카드
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

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dragHandle: {
    padding: 12,
    marginLeft: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },

  dragHint: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },

  // 드래그 관련 스타일
  draggingItem: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },

  draggingCard: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
    borderWidth: 2,
  },

  noDragCard: {
    // 드래그 불가능한 상태일 때의 스타일 (현재는 기본과 동일)
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

  // 삭제 버튼 (스와이프 시 나타남)
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

  // 더보기 버튼
  loadMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 100, // 플로팅 버튼과 겹치지 않도록
  },

  loadMoreText: {
    fontSize: 16,
    color: '#666',
    marginRight: 4,
  },

  // 플로팅 버튼들
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
  },

  scrollToTopButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  floatingMenu: {
    marginBottom: 12,
    alignItems: 'center',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  menuText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },

  // 빈 상태 (empty state)
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },

  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },

  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
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
});
