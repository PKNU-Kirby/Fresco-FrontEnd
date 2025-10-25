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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    backgroundColor: '#fff',
    borderBottomWidth: scale(1),
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: scale(40),
  },

  // 필터 바 (홈 화면 스타일)
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: scale(12),
    gap: scale(10),
  },
  filterButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    backgroundColor: 'lightgray',
    borderRadius: scale(16),
    minWidth: scale(80),
  },
  filterButtonActive: {
    backgroundColor: 'limegreen',
  },
  filterButtonText: {
    fontSize: scale(14),
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#333',
    fontWeight: '600',
  },

  // 리스트
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: scale(16),
  },

  // 섹션 헤더 (날짜)
  sectionHeader: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(4),
    marginTop: scale(16),
    marginBottom: scale(8),
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
  },

  // 사용 기록 카드 (넷플릭스 스타일)
  usageCard: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  usageAvatar: {
    fontSize: scale(24),
    marginRight: scale(12),
  },
  usageInfo: {
    flex: 1,
  },
  usageText: {
    fontSize: scale(16),
    color: '#333',
    lineHeight: scale(22),
    marginBottom: scale(6),
  },
  userName: {
    fontWeight: '600',
    color: 'limegreen',
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
