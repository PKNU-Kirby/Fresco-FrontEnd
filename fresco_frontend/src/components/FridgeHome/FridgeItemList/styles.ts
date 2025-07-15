import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    position: 'relative',
    marginTop: 10,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  // 플러스 버튼 스타일
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    backgroundColor: '#ccc',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  addButtonHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#666',
    top: 9,
    left: 0,
  },
  addButtonVertical: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#666',
    top: 0,
    left: 9,
  },
});
