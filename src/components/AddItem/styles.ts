import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

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

// AddItemActions.tsx
export const addItemStyles = StyleSheet.create({
  /////////////////////////////////////////////////
  container: {
    flex: 1,
    backgroundColor: '#f2f7f2ff',
  },

  content: {
    flex: 1,
  },
  fixedBottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
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

// AddItemActions styles
export const addItemActionsStyles = StyleSheet.create({
  // Edit Mode Style
  addButtonContainer: {
    position: 'absolute',
    bottom: scale(36),
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
    backgroundColor: 'rgba(47, 72, 88, 0.7)',
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
    color: '#f8f8f8',
  },

  // Edit Button Style
  editModeContainer: {
    position: 'absolute',
    bottom: scale(36),
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
    backgroundColor: 'rgba(47, 72, 88, 0.7)',
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
});

// AddItemCard styles
export const addItemCardStyles = StyleSheet.create({
  nameInputContainer: {
    position: 'relative',
    zIndex: 9999,
    marginRight: scale(24),
  },
  nameInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  nameInput: {
    width: scale(250),
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scale(4),
    paddingVertical: scale(4),
    paddingHorizontal: scale(8),
    paddingRight: scale(35),
    borderWidth: scale(1),
    borderColor: '#E0E0E0',
    borderRadius: scale(6),
    backgroundColor: '#F9F9F9',
    minHeight: scale(40),
  },
  searchLoadingIndicator: {
    position: 'absolute',
    right: scale(8),
    top: scale(8),
    zIndex: 10000,
  },

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

  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
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
    marginVertical: scale(6),
    gap: scale(12),
  },
  quantityText: {
    fontSize: scale(14),
    color: '#666',
    marginRight: scale(12),
  },

  // date styles
  dateButton: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    backgroundColor: '#f8f8f8',
    borderRadius: scale(6),
    borderColor: '#DDD',
    minHeight: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dateButtonIcon: {
    marginRight: scale(8),
  },
  dateButtonText: {
    marginTop: scale(1),
    fontSize: scale(15),
    color: '#2F4858',
    fontWeight: '700',
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
    color: '#2F4858',
    fontWeight: '600',
  },
  separator: {
    fontSize: scale(12),
    color: '#2F4858',
    marginHorizontal: scale(8),
  },
});

// AddItemContent styles
export const addItemContentStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    position: 'relative',
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
  confirmationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  confirmationHeader: {
    marginBottom: 12,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    margin: 4,
  },
  confirmationContent: {
    gap: 8,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmationLabel: {
    fontSize: 16,
    color: '#666',
    width: 80,
    fontWeight: '500',
    marginLeft: 4,
    marginTop: 2,
  },
  confirmationUserInput: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    paddingRight: 8,
  },
  confirmationApiResult: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  confirmationDetail: {
    fontSize: 15,
    color: '#2F4858',
    flex: 1,
    fontWeight: '600',
  },
  confirmationArrow: {
    alignItems: 'center',
    marginVertical: 4,
  },
  arrowText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  confirmationDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
    marginLeft: 4,
  },
  bottomPadding: {
    height: scale(50),
  },
});

// AddItemHeader styles
export const addItemHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scale(60),
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(16),
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  leftSection: {
    width: scale(72),
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(8),
  },
  rightSection: {
    width: scale(72),
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    maxWidth: '100%',
  },
  headerButton: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#f8f8f8',
    padding: scale(8),
    backgroundColor: '#333',
    borderRadius: scale(8),
    marginLeft: scale(28),
  },
  headerButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
});

export const ingredientSearchStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scale(16),
  },

  // Search Component styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: '#ddd',
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    height: scale(44),
    fontSize: scale(16),
  },
  loadingIndicator: {
    marginLeft: scale(8),
  },

  // Search Results styles
  resultsContainer: {
    marginTop: scale(4),
    borderWidth: scale(1),
    borderColor: '#ddd',
    borderTopWidth: scale(0),
    borderRadius: scale(8),
    borderTopLeftRadius: scale(0),
    borderTopRightRadius: scale(0),
    backgroundColor: '#fff',
    maxHeight: scale(200),
  },
  resultsList: {
    maxHeight: scale(200),
  },
  resultItem: {
    padding: scale(12),
    borderBottomWidth: scale(1),
    borderBottomColor: '#f0f0f0',
  },
  resultContent: {
    flexDirection: 'column',
  },
  ingredientName: {
    fontSize: scale(16),
    fontWeight: '500',
    color: '#333',
  },
  categoryName: {
    fontSize: scale(14),
    color: '#666',
    marginTop: scale(2),
  },
  noResults: {
    padding: scale(16),
    alignItems: 'center',
  },
  noResultsText: {
    color: '#999',
    fontSize: scale(14),
  },
});

export const ingredientSearchDropdownStyles = StyleSheet.create({
  searchResultItem: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    borderBottomWidth: scale(1),
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  searchResultName: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(2),
  },
  searchResultCategory: {
    fontSize: scale(12),
    color: '#666',
    fontStyle: 'italic',
  },
  // 마지막 아이템은 borderBottom 제거
  'searchResultItem:last-child': {
    borderBottomWidth: 0,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: scale(1),
    borderColor: '#E0E0E0',
    borderTopWidth: 0,
    borderBottomLeftRadius: scale(6),
    borderBottomRightRadius: scale(6),
    maxHeight: scale(150),
    maxWidth: scale(250),
    zIndex: 99999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
  },
  searchErrorItem: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    backgroundColor: '#fff',
  },
  searchErrorText: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: scale(4),
  },
  searchErrorSubText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#999',
  },
});
