import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const floatingButtonStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: scale(30),
    right: scale(30),
    alignItems: 'center',
  },
  scrollToTopContainer: {
    position: 'absolute',
    bottom: scale(100),
    right: scale(30),
    zIndex: 999,
  },
  scrollToTopButton: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
    elevation: 8,
  },
  plusButton: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
    elevation: 8,
  },
  floatingMenuOpen: {
    marginBottom: scale(8),
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  floatingMenuClosed: {
    marginBottom: scale(8),
    alignItems: 'center',
    pointerEvents: 'none',
  },
  floatingMenu: {
    marginBottom: scale(8),
    alignItems: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: scale(18),
    marginBottom: scale(8),
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aiMenuItem: {
    backgroundColor: '#ff6bd5ff',
  },
  registerMenuItem: {
    backgroundColor: 'limegreen',
  },
  menuText: {
    color: '#f8f8f8',
    fontSize: scale(14),
    fontWeight: '500',
    marginLeft: scale(8),
  },
});

export const paginationButtonStyles = StyleSheet.create({
  loadMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(20),
    marginBottom: scale(100),
    backgroundColor: 'transparent',
  },
  loadMoreText: {
    fontSize: scale(16),
    color: '#666',
    marginRight: 4,
    fontWeight: '500',
  },
});

export const recipeCardStyles = StyleSheet.create({
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: scale(16),
    marginBottom: scale(12),
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
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

  // when Swiped
  swipeOpenCard: {
    borderRadius: 0,
    transform: [{ scale: 0.98 }],
  },
  swipeOpenTitle: {
    color: '#eb4e3d',
    fontWeight: '600',
  },

  // Drag style : delete Button
  draggingCard: {
    backgroundColor: '#f0f8ff',
    borderColor: '#d6d6d6',
    borderWidth: scale(2),
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: scale(12),
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(80),
    borderTopRightRadius: scale(16),
    borderBottomRightRadius: scale(16),
  },
  deleteActionButton: {
    backgroundColor: '#eb4e3d',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
});

export const renderRecipeItemStyles = StyleSheet.create({
  draggingItem: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export const recipeHeaderStyles = StyleSheet.create({
  header: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 0,
  },
  leftSection: {
    width: scale(56),
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(8),
  },
  rightSection: {
    width: scale(56),
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    maxWidth: '100%',
  },
  searchButton: {
    padding: scale(8),
    minWidth: scale(40),
    minHeight: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(8),
  },
});

export const sharedRecipeFolderStyles = StyleSheet.create({
  sharedFolderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#20b2ab8d',
    borderRadius: scale(12),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: scale(18),
  },
  folderIcon: {
    marginLeft: scale(4),
    marginRight: scale(16),
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: scale(18),
    fontWeight: '800',
    color: '#333333d6',
    marginBottom: scale(4),
  },
  folderSubInfo: {
    fontSize: scale(14),
    color: '#333333d6',
  },
  // contour
  contour: {
    height: scale(2),
    backgroundColor: '#c9ccceff',
    marginBottom: scale(16),
  },
});
