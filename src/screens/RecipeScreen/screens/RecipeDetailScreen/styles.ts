// RecipeDetailScreen/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },

  // header ///////////////////////////////////////////////
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftHeader: { width: 75, alignItems: 'flex-start' },
  centerHeader: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  rightHeader: {
    flexDirection: 'row',
    width: 75,
    alignItems: 'flex-end',
  },
  leftEditHeader: { width: 56, alignItems: 'flex-start' },
  rightEditHeader: { width: 56, alignItems: 'flex-end' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    margin: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#666',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  description: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#edededff',
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    lineHeight: 24,
  },

  // Ingredients //////////////////////////////////////////
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
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },

  // Steps
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

  // URL
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

  // Share Button
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'limegreen',
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 32,
    marginHorizontal: 110,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8f8f8',
  },
  bottomSpacer: {
    height: 20,
  },
});
