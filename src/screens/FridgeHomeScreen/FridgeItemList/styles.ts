import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
const baseHeight = 874;

// 반응형 함수
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

// List Style : './index.tsx'
export const listStyles = StyleSheet.create({
  content: {
    flex: 1,
    position: 'relative',
    marginTop: scale(10),
  },
  listContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(100),
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
