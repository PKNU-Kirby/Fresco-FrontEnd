// RecipeDetailScreen/styles.ts
import { StyleSheet } from 'react-native';

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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 60,
  },
  leftHeader: {
    width: 88,
    alignItems: 'flex-start',
  },
  centerHeader: {
    flex: 1,
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    width: 88,
    alignItems: 'flex-end',
  },
  leftEditHeader: {
    width: 96,
    alignItems: 'flex-start',
  },
  rightEditHeader: {
    width: 96,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },

  // contents common style
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionContour: {
    width: '100%',
    height: 40,
    borderTopWidth: 0.5,
    borderColor: '#999',
  },

  // Shared Recipe Message ////////////////////////////////
  sharedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sharedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#29a448ff',
    fontWeight: '500',
  },

  // Recipe Title /////////////////////////////////////////
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    margin: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    margin: 8,
    marginTop: 24,
  },

  // Recipe Summary ///////////////////////////////////////
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#444',
    margin: 8,
  },

  // Ingredients //////////////////////////////////////////
  ingredientInfo: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b9edb9ff',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#29a448ff',
    fontWeight: '500',
  },
  ingredientItem: {
    marginBottom: 8,
  },
  ingredientEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredientInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f2f2f2ff',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
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
    padding: 4,
  },
  ingredientText: {
    fontSize: 17,
    color: '#555',
    lineHeight: 24,
    marginLeft: 8,
    fontWeight: '600',
  },

  // Steps ////////////////////////////////////////////////
  stepItem: {
    marginBottom: 12,
  },
  stepEditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stepRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    marginLeft: 8,
    marginTop: 4,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#29a448ff',
    minWidth: 24,
    marginTop: 20,
    marginLeft: 8,
  },
  stepInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  stepsContour: {
    flex: 1,
    width: '97%',
    height: 10,
    borderTopWidth: 0.4,
    borderColor: '#999',
  },
  removeStepsButton: {
    marginTop: 20,
    marginLeft: 8,
  },

  // URL //////////////////////////////////////////////////
  urlInput: {
    fontSize: 14,
    color: 'limegreen',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  url: {
    fontSize: 14,
    color: 'limegreen',
    paddingVertical: 8,
    marginHorizontal: 8,
  },

  // Action Buttons ///////////////////////////////////////
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
    marginHorizontal: 8,
    gap: 16,
  },
  useRecipeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'limegreen',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#f8f8f8',
  },
  bottomSpacer: {
    height: 20,
  },
  shareButtonText: {
    fontSize: 16,
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
    gap: 16,
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 8,
    paddingVertical: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#444',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxWidth: 300,
    width: '80%',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  checklistContainer: {
    flex: 1,
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checklistText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  modalActionButton: {
    backgroundColor: 'limegreen',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  ///////////////////////////////////////////////////

  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
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
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },

  alternativesTitle: {
    fontSize: 16,
    color: '#555',
    fontWeight: '700',
    marginBottom: 12,
  },

  alternativeInfo: {
    backgroundColor: '#eaeaead1',
    borderRadius: 8,
    padding: 16,
    marginBottom: 4,
    flex: 1,
    alignContent: 'center',
  },
  alternativeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alternativeName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
    lineHeight: 16,
  },
  selectedIcon: {
    marginLeft: 4,
    paddingBottom: 2,
  },

  alternativeReason: {
    fontSize: 12,
    color: '#666',
    lineHeight: 20,
    fontWeight: '600',
  },
  alternativeReasonExpiaryDate: {
    fontStyle: 'italic',
  },
  ingredientLegend: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    gap: 8,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  ///

  statusCircle: {
    fontSize: 16,
    marginRight: 8,
  },

  // 범례의 동그라미
  legendCircle: {
    fontSize: 12,
    marginRight: 4,
  },

  // 선택된 대체재 아이템 스타일
  selectedAlternativeItem: {},

  selectedAlternativeText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '800',
  },

  ///////////////////////////////////////////////
});
