import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export const buttonsStyles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingTop: 10,
    minHeight: 40,
  },
  leftButtonGroup: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  rightButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
});

export const headerStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
    minHeight: 56,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    maxWidth: '100%',
  },
});

export const addItemStyles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d6d6d6',
    borderRadius: '50%',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 10,
    alignSelf: 'center',
  },
});

export const cardStyles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
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
    alignItems: 'center',
  },
  checkedItemCard: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  activeItemCard: {
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },

  // checkbox section
  checkboxContainer: {
    marginRight: 18,
  },
  itemImagePlaceholder: {
    width: 30,
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedImagePlaceholder: {
    backgroundColor: 'limegreen',
  },

  // item data
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 32,
    width: 200,
  },
  checkedText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },

  // quantity & unit
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  // 일반 모드 - 간단한 수량 표시
  simpleQuantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },

  // 편집 모드 - 단위 선택
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    marginRight: 2,
  },

  // Show Unit
  simpleUnitText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  // Delete Button
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    opacity: 0.6,
  },
});

export const newItemCardStyles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
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
    alignItems: 'center',
  },
  newItemCard: {
    borderColor: '#4fbb53',
    borderWidth: 1,
    backgroundColor: '#f9fff9',
  },
  itemInfo: {
    flex: 1,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#4fbb53',
    paddingVertical: 4,
    marginBottom: 8,
    marginLeft: 8,
    width: 200,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },

  // New item actions
  newItemActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  cancelButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#d5d5d5',
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#cbe8cb',
  },
});
