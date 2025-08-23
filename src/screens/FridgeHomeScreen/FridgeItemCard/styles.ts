import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

// Delete Button Styles : './DeleteButton.tsx'
export const deleteButtonStyles = StyleSheet.create({
  deleteItemButton: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    backgroundColor: '#999',
    width: scale(24),
    height: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
});

// Item Card Styles : './index.tsx'
export const cardStyles = StyleSheet.create({
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
    position: 'relative',
  },
  itemImageContainer: {
    marginRight: scale(16),
  },
  itemImagePlaceholder: {
    width: scale(60),
    height: scale(60),
    backgroundColor: '#e0e0e0',
    borderRadius: scale(8),
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemExpiry: {
    fontSize: scale(14),
    color: '#666',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: scale(14),
    color: '#666',
    marginRight: scale(12),
  },
  expiaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.97,
  },
  editableExpiry: {
    marginLeft: scale(10),
    fontWeight: '500',
    marginRight: scale(24),
    color: 'limegreen',
  },
  itemStatus: {
    fontSize: scale(12),
    color: '#999',
    fontStyle: 'italic',
  },
  editableitemStatus: {},

  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  emphmessage: {
    fontSize: 16,
    color: 'tomato',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

// Quantity Edit Style : './QuantityEditor.tsx'
export const quantityStyles = StyleSheet.create({
  quantityEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: scale(12),
    backgroundColor: '#f8f8f8',
    borderRadius: scale(8),
    paddingHorizontal: scale(4),
    width: scale(172),
  },
  quantityButton: {
    margin: scale(3),
    opacity: 0.5,
  },
  quantityInput: {
    flex: 1,
    minWidth: scale(30),
    textAlign: 'center',
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: scale(8),
  },
  quantityUnit: {
    fontSize: scale(14),
    color: '#666',
    marginRight: scale(4),
  },
  unitSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(6),
    paddingVertical: scale(4),
    backgroundColor: '#fff',
    borderRadius: scale(6),
    borderWidth: scale(1),
    borderColor: '#ddd',
    marginRight: scale(4),
  },
  unitDropdownIcon: {
    fontSize: scale(10),
    color: '#666',
    marginLeft: scale(2),
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
    borderRadius: scale(16),
    padding: scale(24),
    width: '80%',
    maxHeight: scale(300),
    alignItems: 'center',
  },
  unitModalTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: scale(20),
  },
  unitOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
    marginBottom: scale(20),
  },
  unitOption: {
    paddingVertical: scale(10),
    backgroundColor: '#f0f0f0',
    borderRadius: scale(16),
    minWidth: scale(46),
    alignItems: 'center',
  },
  unitOptionSelected: {
    backgroundColor: '#333',
  },
  unitOptionText: {
    fontSize: scale(16),
    color: '#333',
    fontWeight: '500',
  },
  unitOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unitModalCloseButton: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(12),
    backgroundColor: '#f0f0f0',
    borderRadius: scale(8),
    alignItems: 'center',
  },
  unitModalCloseText: {
    fontSize: scale(16),
    color: '#333',
    fontWeight: '600',
  },
});

// Slider Quantity Editor Style : './SliderQuantityEditor.tsx'
export const sliderQuantityStyles = StyleSheet.create({
  // Stepper and Input Section Styles
  quantityEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 230,
  },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f6f6f6',
    paddingVertical: scale(4),
    borderRadius: scale(8),
    marginRight: scale(8),
  },
  quantityButton: {
    padding: scale(4),
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#444',
  },
  quantityUnit: {
    fontSize: scale(14),
    color: '#666',
    fontWeight: '700',
    marginRight: scale(4),
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: scale(6),
    borderRadius: scale(6),
    borderWidth: scale(1),
    borderColor: '#e3e3e3',
    backgroundColor: 'white',
    marginRight: scale(8),
  },
  unitDropdownIcon: {
    fontSize: scale(10),
    color: '#666',
    marginLeft: scale(2),
  },
  // Toggle Button Styles
  isSlidderButton: {
    width: scale(28),
    height: scale(28),
    marginLeft: scale(8),
    backgroundColor: '#444',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  isNotSlidderButton: {
    width: scale(28),
    height: scale(28),
    marginLeft: scale(8),
    backgroundColor: '#999',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderQuantityContainer: {
    marginTop: scale(8),
    minWidth: scale(260),
  },
  maxQuantityInfo: {
    alignItems: 'center',
  },
  maxQuantityText: {
    fontSize: scale(10),
    color: '#999',
    fontStyle: 'italic',
  },
  // Slider Section Styles
  sliderSection: {
    marginTop: scale(18),
  },
  sliderContainer: {
    position: 'relative',
  },
  slider: {
    width: '100%',
    height: scale(12),
    backgroundColor: 'limegreen',
    borderRadius: scale(6),
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10),
    marginTop: scale(12),
  },
  sliderLabel: {
    fontSize: scale(14),
    color: '#666',
    fontWeight: '800',
  },
});
