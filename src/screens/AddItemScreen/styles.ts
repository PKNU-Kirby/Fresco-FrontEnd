import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
//const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
//const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

const shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.5,
    shadowRadius: scale(8),
    elevation: 5,
  },
};

// AddItemScreen styles
export const addItemStyles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f7f2ff',
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#f2f7f2ff',
    borderBottomWidth: scale(1),
    borderBottomColor: '#E0E0E0',
    ...shadows.small,
  },
  backbutton: {
    width: scale(50),
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: '800',
    color: '#444',
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(8),
    backgroundColor: '#333',
    borderRadius: scale(8),
    width: scale(50),
    alignItems: 'center',
    ...shadows.small,
  },
  headerButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  headerButtonText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // content
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(16),
  },
  scrollContentWithOverlay: {
    paddingBottom: scale(120),
  },
  scrollContentWithOverlayEditMode: {
    paddingBottom: scale(30),
  },
  fixedBottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
  },

  // Add Item Card Button Style
  addButtonContainer: {
    position: 'absolute',
    bottom: scale(20),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingVertical: scale(12),
    backgroundColor: '#32cd32e1',
    borderRadius: scale(10),
    gap: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(6),
    },
    shadowOpacity: 0.5,
    shadowRadius: scale(12),
    elevation: 12,
  },
  addButtonText: {
    fontSize: scale(16),
    fontWeight: '900',
    color: '#444',
  },

  // Edit Button Style
  editModeContainer: {
    position: 'absolute',
    bottom: scale(20),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  backToEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingVertical: scale(12),
    backgroundColor: '#444',
    borderRadius: scale(10),
    gap: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(6),
    },
    shadowOpacity: 0.5,
    shadowRadius: scale(12),
    elevation: 12,
  },
  backToEditButtonText: {
    fontSize: scale(16),
    fontWeight: '500',
    color: '#f8f8f8',
  },

  // Items Summary Style
  summaryContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: scale(12),
    ...shadows.medium,
  },
  summaryTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#222222',
    marginBottom: scale(8),
    padding: scale(16),
    paddingBottom: 0,
  },
  summaryText: {
    fontSize: scale(14),
    color: '#666666',
    lineHeight: scale(20),
    padding: scale(16),
    paddingTop: 0,
  },
  bottomPadding: {
    height: scale(50),
  },
  bottomBlurSection: {
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
  },
});

// AddItemCard styles
export const cardStyles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(12),
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

  // Image styles
  imageContainer: {
    marginRight: scale(16),
  },
  itemImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(8),
  },
  imagePlaceholder: {
    width: scale(60),
    height: scale(60),
    backgroundColor: '#e0e0e0',
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // name styles
  nameInput: {
    width: scale(200),
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scale(4),
    paddingVertical: scale(4),
    paddingHorizontal: scale(8),
    borderWidth: scale(1),
    borderColor: '#E0E0E0',
    borderRadius: scale(6),
    backgroundColor: '#F9F9F9',
    minHeight: scale(40),
  },
  itemName: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scale(4),
  },

  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  quantityText: {
    fontSize: scale(14),
    color: '#666',
    marginRight: scale(12),
  },

  // date styles
  dateButton: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    backgroundColor: '#F0F0F0',
    borderRadius: scale(6),
    borderWidth: scale(1),
    borderColor: '#DDD',
    minHeight: scale(32),
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: scale(14),
    color: '#666',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  expiryText: {
    fontSize: scale(14),
    color: '#666',
  },

  // state styles
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: scale(12),
    color: '#999',
    fontStyle: 'italic',
  },
  categoryButton: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    backgroundColor: '#F0F0F0',
    borderRadius: scale(4),
    minHeight: scale(24),
    justifyContent: 'center',
  },
  categoryButtonText: {
    fontSize: scale(12),
    color: '#666',
    fontWeight: '600',
  },
  separator: {
    fontSize: scale(12),
    color: '#999',
    marginHorizontal: scale(8),
  },
});
