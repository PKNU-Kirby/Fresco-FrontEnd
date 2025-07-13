import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 50,
  },

  // 콘텐츠
  content: {
    flex: 1,
  },

  // 섹션
  section: {
    marginTop: 35,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6d6d72',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 20,
    marginRight: 20,
  },

  // 냉장고 정보
  fridgeInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#c6c6c8',
  },
  fridgeName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#8e8e93',
  },

  // 메뉴 아이템
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#c6c6c8',
    borderTopWidth: 0.5,
    borderTopColor: '#c6c6c8',
    marginTop: -0.5, // 보더 겹침 방지
  },
  menuItemLast: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#c6c6c8',
  },
  menuItemText: {
    fontSize: 17,
    color: '#000',
    fontWeight: '400',
  },
  menuItemDanger: {
    color: '#ff3b30',
  },
  menuItemArrow: {
    fontSize: 14,
    color: '#c7c7cc',
    fontWeight: '400',
  },
});
