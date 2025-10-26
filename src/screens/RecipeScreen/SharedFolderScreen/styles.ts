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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // gap: scale(16),
  },
  loadingText: {
    fontSize: scale(16),
    color: '#666',
    // textAlign: 'center',
  },
  container: {
    flex: 1,
  },

  header: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    marginRight: scale(16),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: scale(14),
    color: '#666',
    marginTop: scale(2),
  },

  content: {
    flex: 1,
    marginHorizontal: scale(4),
    paddingTop: scale(16),
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(8),
    paddingVertical: scale(12),
    paddingHorizontal: scale(4),
    marginBottom: scale(12),
  },
  infoIcon: {
    marginLeft: scale(8),
    marginRight: scale(16),
  },
  infoText: {
    fontSize: scale(13),
    color: '#666',
    lineHeight: scale(18),
  },

  // empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(60),
    paddingHorizontal: scale(40),
  },

  emptyText: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: scale(16),
    marginBottom: scale(8),
  },

  emptySubText: {
    fontSize: scale(14),
    color: '#999',
    textAlign: 'center',
    lineHeight: scale(20),
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: scale(20),
    right: scale(20),
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
    elevation: 5,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  favoriteButton: {
    padding: scale(4),
  },
  dragHandle: {
    padding: scale(4),
    marginLeft: scale(4),
  },

  // fridge folder card
  fridgeFolderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: scale(16),
    marginVertical: scale(8),
    paddingVertical: scale(20),
    paddingHorizontal: scale(20),
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  folderIcon: {
    marginRight: scale(16),
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(4),
  },
  folderSubInfo: {
    fontSize: scale(13),
    color: '#666',
    lineHeight: scale(16),
  },

  // recipe card
  fridgeRecipeCard: {
    flexDirection: 'row', // 가로 방향으로 변경
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: scale(16),
    marginVertical: scale(6),
    paddingVertical: scale(16),
    paddingHorizontal: scale(16),
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recipeIcon: {
    width: scale(40),
    height: scale(40),
  },

  recipeInfo: {
    flex: 1,
    marginLeft: scale(12),
  },

  recipeTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(4),
  },

  sharedByText: {
    fontSize: scale(13),
    color: '#666',
  },
  person: {
    color: 'limegreen',
    fontWeight: '800',
  },
  sharedRecipeIcon: {
    marginRight: scale(8),
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
    paddingRight: scale(8),
  },

  // 삭제 버튼
  deleteButton: {
    padding: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(8),
    //

    borderRadius: scale(6),
    backgroundColor: '#ffebee',
  },

  // 헤더 액션 버튼들
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },

  headerAction: {
    padding: scale(8),
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },

  // 소유자 뱃지
  ownerBadge: {
    position: 'absolute',
    top: scale(-4),
    right: scale(-4),
    backgroundColor: '#FFD700',
    borderRadius: scale(8),
    width: scale(16),
    height: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 폴더 설명
  folderDescription: {
    fontSize: scale(12),
    color: '#888',
    marginTop: scale(2),
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
    fontSize: scale(14),
    fontWeight: '500',
    color: 'white',
  },
  // 레시피 카드 관련 스타일
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: scale(16),
    marginVertical: scale(8),
    padding: scale(16),
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  recipeDescription: {
    fontSize: scale(14),
    color: '#666',
    marginBottom: scale(4),
  },
  recipeMetadata: {
    fontSize: scale(12),
    color: '#999',
  },
});

export const sharedRecipeStyles = StyleSheet.create({
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: scale(16),
    marginBottom: scale(12),
    marginHorizontal: scale(16),
    shadowColor: '#333',
    shadowOffset: { width: scale(0), height: scale(5) },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  canMakeCard: {
    borderWidth: scale(2),
    borderColor: '#4CAF50',
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
  ingredientStatus: {
    marginTop: scale(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    borderWidth: scale(1),
  },
  canMakeIndicator: {
    backgroundColor: '#E8F5E8',
    borderColor: 'limegreen',
  },
  cannotMakeIndicator: {
    backgroundColor: '#eee',
    borderColor: '#aaa',
  },
  statusText: {
    fontSize: scale(12),
    fontWeight: '600',
  },
  canMakeText: {
    color: '#2E7D32',
  },
  cannotMakeText: {
    color: '#aaa',
  },
  detailButton: {
    marginLeft: scale(8),
    padding: scale(4),
  },
  missingIngredientsContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: scale(12),
    padding: scale(12),
    marginHorizontal: scale(16),
    marginTop: scale(-8),
    marginBottom: scale(12),
    borderWidth: scale(1),
    borderColor: '#FFE082',
  },
  missingTitle: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: scale(8),
  },
  missingItem: {
    marginBottom: scale(8),
  },
  missingName: {
    fontSize: scale(12),
    color: '#666',
    fontWeight: '500',
  },
  alternativeText: {
    fontSize: scale(11),
    color: '#2E7D32',
    fontStyle: 'italic',
    marginLeft: scale(12),
    marginTop: scale(2),
  },
  notFoundText: {
    fontSize: scale(11),
    color: '#D32F2F',
    marginLeft: scale(12),
    marginTop: scale(2),
  },
  insufficientText: {
    fontSize: scale(11),
    color: '#FF9800',
    marginLeft: scale(12),
    marginTop: scale(2),
  },
});
