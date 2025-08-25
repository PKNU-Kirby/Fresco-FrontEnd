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
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  infoIcon: {
    flex: 1,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
    flex: 12,
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
});
