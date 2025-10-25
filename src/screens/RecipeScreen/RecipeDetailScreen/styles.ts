import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
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
      width: scale(0),
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
    backgroundColor: '#E8F5E8',
    padding: scale(12),
    marginTop: scale(16),
    marginBottom: scale(16),
    borderRadius: scale(8),
  },
  sharedText: {
    marginLeft: scale(8),
    fontSize: scale(14),
    color: '#29a448ff',
    fontWeight: '500',
  },

  // Recipe Title /////////////////////////////////////////
  titleInput: {
    fontSize: scale(24),
    fontWeight: '700',
    color: '#333',
    borderBottomWidth: scale(1),
    borderBottomColor: '#ddd',
    paddingVertical: scale(8),
    margin: scale(8),
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
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
    margin: scale(8),
  },
  descriptionInput: {
    fontSize: scale(16),
    color: '#666',
    borderWidth: scale(1),
    borderColor: '#ddd',
    borderRadius: scale(8),
    padding: scale(12),
    minHeight: scale(80),
    textAlignVertical: 'top',
  },
  description: {
    fontSize: scale(16),
    color: '#666',
    backgroundColor: '#edededff',
    marginTop: scale(8),
    paddingVertical: scale(16),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    lineHeight: scale(24),
  },

  // Ingredients //////////////////////////////////////////
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(6),
    borderWidth: scale(1),
    borderColor: '#b9edb9ff',
    gap: scale(4),
  },
  addButtonText: {
    fontSize: scale(14),
    color: '#29a448ff',
    fontWeight: '500',
  },
  ingredientItem: {
    marginBottom: scale(8),
  },
  ingredientEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  ingredientInput: {
    borderWidth: scale(1),
    borderColor: '#ddd',
    backgroundColor: '#f2f2f2ff',
    borderRadius: scale(6),
    padding: scale(10),
    fontSize: scale(14),
  },
  ingredientName: {
    flex: 2,
  },
  ingredientQuantity: {
    flex: 1,
  },
  ingredientUnit: {
    flex: 1,
  },
  removeButton: {
    padding: scale(4),
  },
  ingredientText: {
    fontSize: scale(16),
    color: '#333',
    lineHeight: scale(24),
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
  urlInput: {
    fontSize: scale(14),
    color: 'limegreen',
    borderBottomWidth: scale(1),
    borderBottomColor: '#ddd',
    paddingVertical: scale(8),
    marginHorizontal: scale(8),
  },
  url: {
    fontSize: scale(14),
    color: 'limegreen',
    paddingVertical: scale(8),
    marginHorizontal: scale(8),
  },

  // Action Buttons ///////////////////////////////////////
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: scale(32),
    gap: scale(12),
  },
  useRecipeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: scale(14),
    borderRadius: scale(12),
    gap: scale(8),
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'limegreen',
    paddingVertical: scale(14),
    borderRadius: scale(12),
    gap: scale(8),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8f8f8',
  },
  bottomSpacer: {
    height: scale(20),
  },

  // Modal Styles /////////////////////////////////////////
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: 'white',
    borderBottomWidth: scale(1),
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
  },
  modalSubtitle: {
    fontSize: scale(16),
    color: '#666',
    marginBottom: scale(20),
    textAlign: 'center',
  },
  checklistContainer: {
    flex: 1,
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
      width: scale(0),
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
});
