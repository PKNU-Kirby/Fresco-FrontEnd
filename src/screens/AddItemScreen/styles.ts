import { StyleSheet } from 'react-native';

const shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// AddItemScreen styles
export const addItemStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...shadows.small,
  },
  backbutton: {
    width: 50,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#222222',
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 8,
    width: 50,
    alignItems: 'center',
    ...shadows.small,
  },
  headerButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  headerButtonText: {
    fontSize: 14,
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
    padding: 16,
  },
  scrollContentWithOverlay: {
    paddingBottom: 120,
  },
  scrollContentWithOverlayEditMode: {
    paddingBottom: 30,
  },
  fixedBottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // Add Item Card Button Style
  addButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f8f8f8',
  },

  // Edit Button Style
  editModeContainer: {
    position: 'absolute',
    bottom: 117,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  backToEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  backToEditButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f8f8f8',
  },

  // Items Summary Style
  summaryContainer: {
    backgroundColor: '#effce9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'limegreen',
    ...shadows.medium,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 8,
    padding: 16,
    paddingBottom: 0,
  },
  summaryText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    padding: 16,
    paddingTop: 0,
  },
  bottomPadding: {
    height: 50,
  },
  bottomBlurSection: {
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

// AddItemCard styles
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

  // Image styles
  imageContainer: {
    marginRight: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // name styles
  nameInput: {
    width: 200,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    backgroundColor: '#F9F9F9',
    minHeight: 40,
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
  quantityText: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },

  // date styles
  dateButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    minHeight: 32,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  expiryText: {
    fontSize: 14,
    color: '#666',
  },

  // state styles
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  categoryButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    minHeight: 24,
    justifyContent: 'center',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 8,
  },
});
