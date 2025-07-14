import {StyleSheet} from 'react-native';

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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 40,
  },

  // 필터 바 (홈 화면 스타일)
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    minWidth: 80,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // 리스트
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },

  // 섹션 헤더 (날짜)
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // 사용 기록 카드 (넷플릭스 스타일)
  usageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
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
    fontSize: 24,
    marginRight: 12,
  },
  usageInfo: {
    flex: 1,
  },
  usageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 6,
  },
  userName: {
    fontWeight: '600',
    color: '#007AFF',
  },
  itemName: {
    fontWeight: '600',
    color: '#000',
  },
  quantity: {
    fontWeight: '600',
    color: '#FF6B35',
  },
  usageTime: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
});
