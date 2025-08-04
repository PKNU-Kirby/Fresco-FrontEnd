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
  // header
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
  leftSection: {
    width: 80,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    width: 80,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    maxWidth: '100%',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  editButtonText: {
    fontSize: 13,
  },
});

export const Cardstyles = StyleSheet.create({
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
  editableItemName: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: '#999',
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
    width: 150,
    minHeight: 32,
  },
  checkedText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  simpleQuantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  simpleUnitText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  // delete button
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    opacity: 0.6,
  },

  // quantity & unit
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  // edit mode : quantity container
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    width: 130,
  },
  quantityButton: {
    padding: 4,
    opacity: 0.7,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  quantityInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    flex: 1,
    marginHorizontal: 4,
  },

  // edit mode : unit select section
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

  // item category
  itemCategory: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // modal style : unit select
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxHeight: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  unitOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
  unitOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedUnitOption: {
    backgroundColor: '#333',
  },
  unitOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedUnitOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
