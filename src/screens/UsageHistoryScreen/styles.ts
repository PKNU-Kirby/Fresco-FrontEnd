import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },

  // Header Style
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scale(60),
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(16),
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
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

  // Loading Style
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

  // Empty Style
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    marginTop: scale(200),
  },
  emptyText: {
    marginTop: 16,
    fontSize: scale(18),
    color: '#666',
    fontWeight: '800',
  },
  emptySubText: {
    marginTop: scale(8),
    fontSize: scale(16),
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  emptyListContent: {
    paddingHorizontal: scale(16),
  },

  // 필터 바 (홈 화면 스타일)
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingTop: scale(16),
    paddingBottom: scale(6),
    gap: scale(8),
    backgroundColor: '#e8f5e875',
  },
  filterButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    backgroundColor: 'lightgray',
    borderRadius: scale(16),
    minWidth: scale(56),
  },
  filterButtonActive: {
    backgroundColor: '#2F4858',
  },
  filterButtonText: {
    fontSize: scale(14),
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#f8f8f8',
    fontWeight: '600',
  },

  // 리스트
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: scale(16),
  },

  // 섹션 헤더 (날짜)
  sectionHeader: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(4),
    marginTop: scale(16),
    marginBottom: scale(6),
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
  },

  // 사용 기록 카드
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  usageCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: scale(12),
    paddingVertical: scale(16),
    paddingHorizontal: scale(12),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  userIconContainer: {
    fontSize: scale(24),
    marginRight: scale(12),
  },
  usageInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  usageText: {
    fontSize: scale(16),
    color: '#333',
    lineHeight: scale(22),
    marginBottom: scale(6),
  },
  userName: {
    fontWeight: '800',
    color: '#2F4858',
  },
  itemName: {
    fontWeight: '900',
    color: '#333',
  },
  quantity: {
    fontWeight: '600',
    color: 'tomato',
  },
  usageTime: {
    fontSize: scale(13),
    color: '#999',
    fontStyle: 'italic',
  },
});
