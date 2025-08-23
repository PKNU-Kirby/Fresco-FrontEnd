import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
//const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
//const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

// List Style : './index.tsx'
export const listStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
  },
  listContainer: {
    paddingTop: scale(56),
    paddingBottom: scale(88),
  },
  floatingContainer: {},
});

export const filterBarStyles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    top: scale(16),
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingBottom: scale(10),
    backgroundColor: '#e8f5e875',
  },
  leftTabGroup: {
    flexDirection: 'row',
    gap: scale(10),
    flex: 1,
  },
  rightTabGroup: {
    flexDirection: 'row',
    gap: scale(8),
  },
});

// Item Add Button Style : './ItemAddButton.tsx'
export const itemAddButtonStyles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: scale(30),
    right: scale(30),
    width: scale(56),
    height: scale(56),
    backgroundColor: '#666',
    borderRadius: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#333',
    shadowOffset: {
      width: scale(0),
      height: scale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
    elevation: scale(8),
  },
});
