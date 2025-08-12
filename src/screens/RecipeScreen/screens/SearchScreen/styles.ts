import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },

  // 검색 헤더
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
  },

  backButton: {
    padding: 8,
    marginRight: 8,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },

  // 최근 검색어
  recentSearchContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  recentSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  recentSearchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  deleteAllText: {
    fontSize: 14,
    color: '#666',
  },

  historyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },

  historyText: {
    fontSize: 14,
    color: 'white',
    marginRight: 8,
  },

  removeHistoryButton: {
    padding: 2,
  },

  emptyHistoryContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },

  emptyHistoryText: {
    fontSize: 16,
    color: '#666',
  },
});
