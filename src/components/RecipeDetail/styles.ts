import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
//const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
//const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
  container: {
    flex: 1,
  },

  // header ///////////////////////////////////////////////
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(16),
    paddingTop: scale(8),
    paddingBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: scale(60),
  },
  leftHeader: {
    width: scale(88),
    alignItems: 'flex-start',
  },
  centerHeader: {
    flex: 1,
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    width: scale(88),
    alignItems: 'flex-end',
  },
  leftEditHeader: {
    width: scale(96),
    alignItems: 'flex-start',
  },
  rightEditHeader: {
    width: scale(96),
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  backButton: {
    padding: scale(8),
  },
  favoriteButton: {
    padding: scale(8),
  },
  editButton: {
    padding: scale(8),
  },
  saveButton: {
    padding: scale(8),
  },

  // contents common style
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  section: {
    marginVertical: scale(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  sectionContour: {
    width: '100%',
    height: scale(40),
    borderTopWidth: scale(0.5),
    borderColor: '#999',
  },

  // Shared Recipe Message ////////////////////////////////
  sharedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    marginTop: scale(16),
  },
  sharedText: {
    marginLeft: scale(8),
    fontSize: scale(14),
    color: '#2F4858',
    fontWeight: '500',
  },
  sharedByText: {
    fontSize: scale(15),
    fontWeight: '700',
  },

  // Recipe Title /////////////////////////////////////////
  titleInputContainer: {
    backgroundColor: '#fff',
    borderRadius: scale(14),
    borderWidth: scale(1),
    borderColor: '#f8f8f8',
    marginHorizontal: scale(8),
    marginTop: scale(16),
  },
  titleInput: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#333',
    paddingVertical: scale(12),
    paddingHorizontal: scale(12),
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    color: '#333',
    margin: scale(8),
    marginTop: scale(24),
  },

  // Recipe Summary ///////////////////////////////////////
  sectionTitle: {
    fontSize: scale(20),
    fontWeight: '900',
    color: '#444',
    margin: scale(8),
  },

  // Ingredients //////////////////////////////////////////
  ingredientInfo: {
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(44),
    height: scale(44),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7FD1AE',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(10),
    gap: scale(2),
    marginHorizontal: scale(130),
    marginTop: scale(8),
  },
  addButtonText: {
    fontSize: scale(14),
    color: '#2F4858',
    fontWeight: '700',
  },
  ingredientItem: {
    marginHorizontal: scale(8),
    marginBottom: scale(8),
  },
  ingredientEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    backgroundColor: '#F3FBF3',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: scale(1),
    borderColor: '#D9F9DA',
  },
  ingredientInput: {
    borderWidth: scale(1),
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: scale(10),
    padding: scale(10),
    fontSize: scale(14),
    color: '#444',
  },
  ingredientName: {
    flex: 4,
  },
  ingredientQuantityUnit: {
    flex: 2,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(4),
    width: scale(44),
    height: scale(44),
  },

  // 조회 모드
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(12),
    paddingHorizontal: scale(12),
    backgroundColor: '#fff',
    borderRadius: scale(8),
    borderWidth: scale(1),
    borderColor: '#f0f0f0',
  },
  ingredientMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ingredientText: {
    fontSize: scale(15),
    color: '#333',
    lineHeight: scale(22),
    marginLeft: scale(8),
    fontWeight: '500',
  },
  availableIngredient: {
    fontWeight: '600',
    color: '#29a448ff',
  },

  // 대체재 섹션
  alternativesContainer: {
    marginTop: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(12),
    backgroundColor: '#f8f9fa',
    borderRadius: scale(8),
  },
  alternativesTitle: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#666',
    marginBottom: scale(8),
  },
  selectedAlternativeItem: {
    backgroundColor: '#E8F5E8',
    borderRadius: scale(6),
    marginBottom: scale(8),
  },
  alternativeInfo: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
  },
  alternativeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(4),
  },
  alternativeName: {
    fontSize: scale(14),
    color: '#333',
    flex: 1,
  },
  selectedAlternativeText: {
    fontWeight: '600',
    color: '#29a448ff',
  },
  selectedIcon: {
    marginLeft: scale(8),
  },
  alternativeReason: {
    fontSize: scale(12),
    color: '#666',
  },
  alternativeReasonExpiaryDate: {
    color: '#29a448ff',
    fontWeight: '500',
  },

  // Steps ////////////////////////////////////////////////
  stepItem: {
    marginBottom: scale(12),
  },
  stepEditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(8),
  },
  stepRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: scale(8),
    marginLeft: scale(8),
    marginTop: scale(4),
  },
  stepNumber: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#29a448ff',
    minWidth: scale(24),
    marginTop: scale(20),
    marginLeft: scale(8),
  },
  stepInput: {
    flex: 1,
    borderWidth: scale(1),
    borderColor: '#ddd',
    borderRadius: scale(6),
    padding: scale(8),
    fontSize: scale(14),
    minHeight: scale(60),
    textAlignVertical: 'top',
  },
  stepText: {
    flex: 1,
    fontSize: scale(16),
    color: '#333',
    lineHeight: scale(24),
  },
  stepsContour: {
    flex: 1,
    width: '97%',
    height: scale(10),
    borderTopWidth: scale(0.4),
    borderColor: '#999',
  },
  removeStepsButton: {
    marginTop: scale(20),
    marginLeft: scale(8),
  },

  // URL //////////////////////////////////////////////////
  // styles.ts
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(8),
  },
  urlIcon: {
    marginLeft: scale(8),
    marginRight: scale(8),
  },
  urlInputContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: scale(8),
    borderWidth: scale(1),
    borderColor: '#ddd',
    marginRight: scale(8),
  },
  urlInput: {
    fontSize: scale(14),
    color: 'limegreen',
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
  },
  url: {
    flex: 1,
    fontSize: scale(14),
    color: 'limegreen',
    marginRight: scale(8),
  },

  // Action Buttons ///////////////////////////////////////
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(24),
    marginTop: scale(8),
    marginHorizontal: scale(8),
    gap: scale(16),
  },
  useRecipeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'limegreen',
    paddingVertical: scale(14),
    borderRadius: scale(8),
    gap: scale(8),
  },
  fullWidthButton: {
    flex: 1,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    paddingVertical: scale(14),
    borderRadius: scale(8),
    gap: scale(8),
  },
  buttonText: {
    fontSize: scale(16),
    fontWeight: '900',
    color: '#f8f8f8',
  },
  bottomSpacer: {
    height: scale(20),
  },
  shareButtonText: {
    fontSize: scale(16),
    color: '#666',
    fontWeight: '600',
  },

  // Modal Styles /////////////////////////////////////////
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    gap: scale(16),
    padding: scale(8),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
    paddingLeft: scale(8),
    paddingVertical: scale(8),
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#444',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    margin: scale(20),
    borderRadius: scale(12),
    padding: scale(20),
    maxWidth: scale(300),
    width: '80%',
  },
  modalSubtitle: {
    fontSize: scale(16),
    color: '#666',
    marginBottom: scale(20),
    textAlign: 'center',
  },
  checklistContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(20),
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    backgroundColor: 'white',
    marginBottom: scale(8),
    borderRadius: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(1),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
    elevation: 2,
  },
  checklistText: {
    fontSize: scale(16),
    color: '#333',
    marginLeft: scale(12),
    flex: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  modalActionButton: {
    backgroundColor: 'limegreen',
    paddingVertical: scale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    marginBottom: scale(20),
  },
  modalActionButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: 'white',
  },

  ///////////////////////////////////////////////////

  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(10),
    paddingHorizontal: scale(8),
  },
  ingredientMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  availableIngredient: {
    color: '#000',
    fontWeight: '700',
  },

  alternativesContainer: {
    marginHorizontal: scale(8),
    marginTop: scale(4),
    marginBottom: scale(12),
    paddingLeft: scale(16),
    paddingRight: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#f8f8f8',
    borderRadius: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(3.84),
    elevation: 5,
  },
  alternativesTitle: {
    fontSize: scale(16),
    color: '#555',
    fontWeight: '700',
    marginBottom: scale(12),
  },
  alternativeInfo: {
    backgroundColor: '#eaeaead1',
    borderRadius: scale(8),
    padding: scale(16),
    marginBottom: scale(4),
    flex: 1,
    alignContent: 'center',
  },
  alternativeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alternativeName: {
    fontSize: scale(13),
    color: '#333',
    fontWeight: '500',
    marginBottom: scale(2),
    lineHeight: scale(16),
  },
  selectedIcon: {
    marginLeft: scale(4),
    paddingBottom: scale(2),
  },
  alternativeReason: {
    fontSize: scale(12),
    color: '#666',
    lineHeight: scale(20),
    fontWeight: '600',
  },
  alternativeReasonExpiaryDate: {
    fontStyle: 'italic',
  },
  ingredientLegend: {
    marginTop: scale(16),
    padding: scale(12),
    backgroundColor: '#f8f8f8',
    borderRadius: scale(8),
    gap: scale(8),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Status Icon
  statusCircle: {
    fontSize: scale(16),
    marginRight: scale(8),
  },
  legendCircle: {
    fontSize: scale(12),
    marginRight: scale(4),
  },
  selectedAlternativeItem: {},
  selectedAlternativeText: {
    color: '#444',
    fontSize: scale(14),
    fontWeight: '800',
  },
});

export const shareRecipeModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: scale(8),
    maxHeight: scale(600),
    width: '85%',
  },
  // Modal Header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
    paddingLeft: scale(8),
    paddingVertical: scale(8),
  },
  modalTitleLeft: {
    width: 56,
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#444',
    marginTop: 20,
  },
  modalTitleRight: {
    padding: 16,
  },
  // Modal Subtitle
  modalSubtitle: {
    fontSize: scale(16),
    color: '#666',
    marginBottom: scale(24),
    textAlign: 'center',
  },
  // Check List styles
  checklistContainer: {
    marginBottom: scale(20),
    marginHorizontal: scale(24),
  },
  checklistItem: {
    flexDirection: 'row',
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    backgroundColor: '#f8f8f8',
    marginBottom: scale(8),
    borderRadius: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
    elevation: 2,
  },
  checklistText: {
    fontSize: scale(16),
    color: '#444',
    marginLeft: scale(12),
    flex: 1,
  },
  // Buttons
  modalActionButton: {
    backgroundColor: 'limegreen',
    paddingVertical: scale(16),
    marginHorizontal: scale(24),
    borderRadius: scale(10),
    alignItems: 'center',
    marginBottom: scale(20),
  },
  modalActionButtonText: {
    fontSize: scale(18),
    fontWeight: '800',
    color: '#f8f8f8',
  },
});

export const ingredientInfoModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: scale(20),
    borderRadius: scale(12),
    padding: scale(20),
    maxWidth: scale(300),
    width: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
    paddingLeft: scale(8),
    paddingVertical: scale(8),
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#444',
  },
  modalBody: {
    gap: scale(16),
    padding: scale(8),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: scale(16),
    color: '#666',
    marginLeft: scale(12),
    fontWeight: '600',
  },
});
