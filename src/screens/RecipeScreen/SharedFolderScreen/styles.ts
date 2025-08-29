import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: '#666',
  },
  container: {
    flex: 1,
  },

  header: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  content: {
    flex: 1,
    marginHorizontal: 4,
    paddingTop: 16,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  infoIcon: {
    marginLeft: 8,
    marginRight: 16,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
    lineHeight: 18,
  },

  // empty state
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
  scrollToTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  dragHandle: {
    padding: 4,
    marginLeft: 4,
  },

  // fridge folder card
  fridgeFolderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  folderIcon: {
    marginRight: 16,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  folderSubInfo: {
    fontSize: 14,
    color: '#666',
  },

  // recipe card
  fridgeRecipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  sharedByText: {
    fontSize: 14,
    color: '#666',
  },
  person: {
    color: 'limegreen',
    fontWeight: '800',
  },
  sharedRecipeIcon: {
    marginRight: 8,
  },
  sharedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ///

  recipeMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },

  // 삭제 버튼
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // 기존 fridgeRecipeCard 수정
  fridgeRecipeCard: {
    flexDirection: 'row', // 가로 방향으로 변경
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // 레시피 정보 스타일 조정
  recipeInfo: {
    flex: 1,
    marginLeft: 12,
  },

  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  sharedByText: {
    fontSize: 13,
    color: '#666',
  },

  recipeIcon: {
    width: 40,
    height: 40,
  },

  // 빈 상태 컨테이너 스타일 개선
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },

  // 로딩 컨테이너
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
  }, /////
  // styles.ts에 추가할 스타일들

  // 헤더 액션 버튼들
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerAction: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },

  // 소유자 뱃지
  ownerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 폴더 설명
  folderDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontStyle: 'italic',
  },

  createAction: {
    backgroundColor: '#4CAF50',
  },

  joinAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },

  emptyActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },

  // 레시피 카드 개선
  recipeMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },

  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#ffebee',
  },

  fridgeRecipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // 안내 텍스트 개선
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  // 로딩 화면 개선
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // 폴더 카드 개선
  fridgeFolderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  folderIcon: {
    position: 'relative',
    marginRight: 16,
  },

  folderInfo: {
    flex: 1,
  },

  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  folderSubInfo: {
    fontSize: 13,
    color: '#666',
    lineHeight: 16,
  },
});
