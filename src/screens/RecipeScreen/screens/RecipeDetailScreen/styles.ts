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

  // 헤더
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

  backButton: {
    padding: 8,
  },

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

  // 콘텐츠
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  // 제목
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },

  // 설명
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
    lineHeight: 24,
  },

  // 재료
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },

  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
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
    borderRadius: 6,
    padding: 8,
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

  // 조리법
  stepItem: {
    marginBottom: 12,
  },

  stepEditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    minWidth: 24,
    marginTop: 2,
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

  // URL
  urlInput: {
    fontSize: 14,
    color: '#007AFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },

  url: {
    fontSize: 14,
    color: '#007AFF',
  },

  // 공유 버튼
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 16,
    gap: 8,
  },

  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  bottomSpacer: {
    height: 20,
  },
  sharedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  sharedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
});
