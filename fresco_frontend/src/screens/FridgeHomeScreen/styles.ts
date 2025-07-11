import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // 사용하지 않는 스타일 (혹시 나중에 필요할 수도 있어서 남겨둠)
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeNavTabText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
});
