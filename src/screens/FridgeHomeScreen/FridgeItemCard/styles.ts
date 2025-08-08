import { StyleSheet } from 'react-native';

// Item Card Styles : './index.tsx'
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
    position: 'relative',
  },
  itemImageContainer: {
    marginRight: 16,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  itemExpiry: {
    fontSize: 14,
    color: '#666',
  },
  editableExpiry: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  itemStatus: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

// Quantity Edit Style : './QuantityEditor.tsx'
export const quantityStyles = StyleSheet.create({
  quantityEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    margin: 3,
    opacity: 0.5,
  },
  quantityInput: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 8,
  },
  quantityUnit: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 4,
  },
  unitDropdownIcon: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
});

// Unit Select Modal Style : './UnitSelector.tsx'
export const modalStyles = StyleSheet.create({
  unitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxHeight: 300,
    alignItems: 'center',
  },
  unitModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  unitOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  unitOption: {
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    minWidth: 46,
    alignItems: 'center',
  },
  unitOptionSelected: {
    backgroundColor: '#333',
  },
  unitOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  unitOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unitModalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  unitModalCloseText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
