import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  closeButton: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#212529',
  },

  menuButton: {
    padding: 8,
  },

  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  recipeTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#212529',
    margin: 16,
    textAlign: 'center' as const,
  },

  // 안내사항 스타일
  noticeContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },

  noticeHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },

  noticeTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1976D2',
    marginLeft: 8,
  },

  noticeText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 16,
  },

  section: {
    margin: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#212529',
    marginBottom: 12,
  },

  // 재료 카드 스타일
  ingredientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  ingredientHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },

  ingredientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#212529',
  },

  recipeQuantity: {
    fontSize: 14,
    color: '#666',
  },

  availableIngredient: {
    gap: 8,
  },

  availableText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500' as const,
  },

  deductionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },

  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },

  deductButton: {
    padding: 8,
  },

  deductButtonCompleted: {
    opacity: 0.5,
  },

  deductedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic' as const,
  },

  unavailableIngredient: {
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },

  unavailableText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500' as const,
  },

  // Steps 스타일 (이전과 동일)
  stepsContainer: {
    gap: 12,
  },

  stepCard: {
    flexDirection: 'row' as const,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#29a448ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  stepCardCompleted: {
    backgroundColor: '#e8f5e8',
    borderLeftColor: '#4CAF50',
    opacity: 0.8,
  },

  stepCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#29a448ff',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
    flexShrink: 0,
  },

  stepCheckboxCompleted: {
    backgroundColor: '#4CAF50',
  },

  stepNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },

  stepContent: {
    flex: 1,
    justifyContent: 'center' as const,
  },

  stepText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  stepTextCompleted: {
    color: '#666',
    textDecorationLine: 'line-through' as const,
  },

  progressContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },

  progressText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },

  progressBar: {
    height: 6,
    backgroundColor: '#e3f2fd',
    borderRadius: 3,
    overflow: 'hidden' as const,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#1976d2',
    borderRadius: 3,
  },

  // 완료 버튼
  completeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },

  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },

  bottomSpacer: {
    height: 20,
  },
});
