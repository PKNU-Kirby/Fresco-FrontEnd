import { StyleSheet } from 'react-native';

// List Style : './index.tsx'
export const listStyles = StyleSheet.create({
  content: {
    flex: 1,
    position: 'relative',
    marginTop: 10,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});

// Item Add Button Style : './ItemAddButton.tsx'
export const itemAddButtonStyles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    backgroundColor: '#666',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
