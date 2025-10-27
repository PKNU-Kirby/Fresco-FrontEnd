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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header Section /////////////////////////////////////////////////////////////////
  header: {
    backgroundColor: 'white',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftSection: {
    width: scale(56),
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(8),
  },
  rightSection: {
    width: scale(56),
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    maxWidth: '100%',
  },
  backButton: {
    padding: scale(8),
  },
  // Recipe Info header
  newRequestButtonContainer: {
    padding: scale(8),
  },

  // Body Section
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
  },

  // Prompt Input Section ///////////////////////////////////////////////////////////
  promptSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: scale(16),
    shadowColor: '#333',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(8),
  },
  sectionSubtitle: {
    fontSize: scale(14),
    color: '#666',
    marginBottom: scale(16),
    lineHeight: scale(20),
  },
  promptInput: {
    borderWidth: scale(1),
    borderColor: '#E0E0E0',
    borderRadius: scale(12),
    padding: scale(16),
    fontSize: scale(16),
    minHeight: scale(100),
    textAlignVertical: 'top',
    marginBottom: scale(16),
    backgroundColor: '#f5f5f5ff',
  },
  generateButton: {
    backgroundColor: 'limegreen',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(16),
    borderRadius: scale(12),
  },
  generateButtonDisabled: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(16),
    borderRadius: scale(12),
    backgroundColor: '#e2e2e2ff',
  },
  generateButtonText: {
    color: '#f8f8f8',
    fontSize: scale(16),
    fontWeight: '600',
    marginLeft: scale(8),
  },
  generateButtonTextDisabled: {
    color: '#666',
    fontSize: scale(16),
    fontWeight: '600',
    marginLeft: scale(8),
  },

  // Recent History Section /////////////////////////////////////////////////////////
  historySection: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: scale(16),
    shadowColor: '#333',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    backgroundColor: '#eaeaeaff',
    borderRadius: scale(8),
    marginBottom: scale(8),
  },
  historyText: {
    fontSize: scale(14),
    color: '#333',
    marginLeft: scale(8),
    flex: 1,
  },

  // Tip Section ////////////////////////////////////////////////////////////////////
  tipSection: {
    backgroundColor: 'white',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: scale(16),
    shadowColor: '#333',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  tipIcon: {
    marginRight: scale(8),
  },
  tipSectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
  },
  tipItem: {
    paddingVertical: scale(4),
  },
  tipText: {
    fontSize: scale(14),
    color: '#666',
    lineHeight: scale(20),
  },

  // Loading State //////////////////////////////////////////////////////////////////
  loadingContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: scale(16),
    padding: scale(40),
    alignItems: 'center',
    marginBottom: scale(16),
    shadowColor: '#333',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  loadingTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
    marginTop: scale(16),
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: scale(14),
    color: '#666',
    marginTop: scale(8),
    textAlign: 'center',
  },

  // Generated Recipe ///////////////////////////////////////////////////////////////
  recipeContainer: {
    marginBottom: scale(20),
  },
  // Recipe Summary /////////////////////////////////////////////////////////////////
  recipeHeader: {
    backgroundColor: 'white',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: scale(16),
    shadowColor: '#333',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  recipeTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#333',
    marginBottom: scale(8),
  },
  recipeDescription: {
    fontSize: scale(16),
    color: '#666',
    lineHeight: scale(24),
  },
  // Ingredients ////////////////////////////////////////////////////////////////////
  section: {
    backgroundColor: 'white',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: scale(16),
    shadowColor: '#333',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(8),
  },
  ingredientText: {
    paddingLeft: scale(10),
    fontSize: scale(16),
    fontWeight: '500',
    color: '#333',
  },

  // Steps //////////////////////////////////////////////////////////////////////////
  stepItem: {
    flexDirection: 'row',
    marginBottom: scale(16),
    alignItems: 'flex-start',
    paddingVertical: scale(8),
  },
  stepNumber: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
    marginTop: scale(2),
  },
  stepNumberText: {
    color: '#f8f8f8',
    fontSize: scale(14),
    fontWeight: '600',
  },
  stepTextContainer: {
    flex: 1,
    borderBottomWidth: scale(0.2),
    paddingBottom: scale(10),
    borderColor: '#999',
  },
  stepText: {
    paddingLeft: '5%',
    width: '90%',
    fontSize: scale(16),
    color: '#333',
    lineHeight: scale(22),
  },

  // Buttons ////////////////////////////////////////////////////////////////////////
  actionButtons: {
    flexDirection: 'row',
    marginBottom: scale(20),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(16),
    borderRadius: scale(12),
    marginHorizontal: scale(4),
  },
  regenerateButton: {
    backgroundColor: 'lightgray',
    borderWidth: scale(1),
    borderColor: '#999',
  },
  regenerateButtonText: {
    color: '#666',
    fontSize: scale(16),
    fontWeight: '600',
    marginLeft: scale(8),
  },
  saveButton: {
    backgroundColor: 'limegreen',
  },
  saveButtonText: {
    color: '#f8f8f8',
    fontSize: scale(16),
    fontWeight: '600',
    marginLeft: scale(8),
  },
});
