import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header Section /////////////////////////////////////////////////////////////////
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftSection: {
    width: 56,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    width: 56,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    maxWidth: '100%',
  },
  backButton: {
    padding: 8,
  },
  // Recipe Info header
  newRequestButtonContainer: {
    padding: 8,
  },

  // Body Section
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Prompt Input Section ///////////////////////////////////////////////////////////
  promptSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#f5f5f5ff',
  },
  generateButton: {
    backgroundColor: 'limegreen',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateButtonDisabled: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#e2e2e2ff',
  },
  generateButtonText: {
    color: '#f8f8f8',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  generateButtonTextDisabled: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Recent History Section /////////////////////////////////////////////////////////
  historySection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#eaeaeaff',
    borderRadius: 8,
    marginBottom: 8,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },

  // Tip Section ////////////////////////////////////////////////////////////////////
  tipSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 8,
  },
  tipSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  tipItem: {
    paddingVertical: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Loading State //////////////////////////////////////////////////////////////////
  loadingContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },

  // Generated Recipe ///////////////////////////////////////////////////////////////
  recipeContainer: {
    marginBottom: 20,
  },
  // Recipe Summary /////////////////////////////////////////////////////////////////
  recipeHeader: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  // Ingredients ////////////////////////////////////////////////////////////////////
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ingredientText: {
    paddingLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

  // Steps //////////////////////////////////////////////////////////////////////////
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#f8f8f8',
    fontSize: 14,
    fontWeight: '600',
  },
  stepTextContainer: {
    flex: 1,
    borderBottomWidth: 0.2,
    paddingBottom: 10,
    borderColor: '#999',
  },
  stepText: {
    paddingLeft: '5%',
    width: '90%',
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },

  // Buttons ////////////////////////////////////////////////////////////////////////
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  regenerateButton: {
    backgroundColor: 'lightgray',
    borderWidth: 1,
    borderColor: '#999',
  },
  regenerateButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: 'limegreen',
  },
  saveButtonText: {
    color: '#f8f8f8',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
