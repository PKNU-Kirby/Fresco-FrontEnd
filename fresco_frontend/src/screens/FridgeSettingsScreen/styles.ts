import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 40, // BackButton과 동일한 너비로 중앙 정렬
  },

  // 콘텐츠
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // 구성원 섹션
  membersSection: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },

  // 구성원 카드 (식재료 카드 스타일)
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberMainInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  memberCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  memberJoinDateText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // 기존 memberItem 스타일 제거하고 위 카드 스타일로 대체

  // 하단 버튼들
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  bottomButton: {
    flex: 1,
    alignItems: 'center',
  },
  bottomButtonText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
  dangerText: {
    color: 'tomato',
  },

  memberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ownerBadge: {
    backgroundColor: 'limegreen',
    borderRadius: 15,
    marginLeft: 12,
    flexDirection: 'row',
    padding: 7,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 4,
  },
});
