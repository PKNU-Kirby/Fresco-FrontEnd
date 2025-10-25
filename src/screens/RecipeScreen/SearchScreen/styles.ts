import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },

  // search header
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#e8f5e8',
  },
  backButton: {
    marginRight: scale(8),
  },
  // search container
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(25),
    paddingHorizontal: scale(16),
    paddingVertical: Platform.OS === 'android' ? scale(4) : scale(12),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: scale(16),
    color: '#444',
  },

  // Recent Search
  recentSearchContainer: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: scale(24),
  },
  recentSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  recentSearchTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#444',
  },
  deleteAllText: {
    fontSize: scale(14),
    color: '#666',
  },

  // history items
  historyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    borderRadius: scale(20),
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    marginBottom: scale(8),
  },
  historyText: {
    fontSize: scale(14),
    color: '#333',
    marginRight: scale(8),
  },
  removeHistoryButton: {
    padding: scale(2),
  },
  // when there's no history exist
  emptyHistoryContainer: {
    alignItems: 'center',
    paddingTop: scale(40),
  },
  emptyHistoryText: {
    fontSize: scale(16),
    color: '#666',
  },
});
