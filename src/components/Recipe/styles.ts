import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

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
    bottom: 30,
    right: 30,
    alignItems: 'center',
  },
  scrollToTopContainer: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    zIndex: 999,
  },
  scrollToTopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  plusButton: {
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
  floatingMenuOpen: {
    marginBottom: 8,
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  floatingMenuClosed: {
    marginBottom: 8,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  floatingMenu: {
    marginBottom: 8,
    alignItems: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 8,
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 2,
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
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export const paginationButtonStyles = StyleSheet.create({
  loadMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 100,
    backgroundColor: 'transparent',
  },
  loadMoreText: {
    fontSize: 16,
    color: '#666',
    marginRight: 4,
    fontWeight: '500',
  },
});

export const recipeCardStyles = StyleSheet.create({
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
    borderWidth: 2,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
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
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export const recipeHeaderStyles = StyleSheet.create({
  header: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 0,
  },
  leftSection: {
    width: 56,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    width: 56,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    maxWidth: '100%',
  },
  searchButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});

export const sharedRecipeFolderStyles = StyleSheet.create({
  sharedFolderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#20b2ab8d',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 18,
  },
  folderIcon: {
    marginLeft: 4,
    marginRight: 16,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333333d6',
    marginBottom: 4,
  },
  folderSubInfo: {
    fontSize: 14,
    color: '#333333d6',
  },
  // contour
  contour: {
    height: 2,
    backgroundColor: '#c9ccceff',
    marginBottom: 16,
  },
});
