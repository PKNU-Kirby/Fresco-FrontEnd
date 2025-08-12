import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  container: {
    flex: 1,
  },

  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  backButton: {
    padding: 8,
    marginRight: 8,
  },

  searchContainer: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
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
  },
});
