import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const ingredientCardStyles = StyleSheet.create({
  ingredientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
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
  ingredientNameContainer: {},
  ingredientName: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#444',
  },
  optionBadge: {
    fontSize: 16,
    fontWeight: '600',
    color: 'limegreen',
  },
  optionDescription: {},
  recipeQuantity: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableIngredient: {},
  availableText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableIcon: {},
  haveOne: {
    fontSize: 14,
    color: 'limegreen',
    fontWeight: '500' as const,
  },
  needtext: {
    color: '#444',
  },
  quantityEditorContainer: {},
  quantityLabel: {},
  deductionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  deductButton: {
    padding: 8,
  },
  deductButtonCompleted: {
    opacity: 0.5,
  },
  deductButtonText: {},
  deductButtonTextCompleted: {},
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
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

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
    width: 88,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },

  recipeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#212529',
    margin: 32,
    textAlign: 'center' as const,
    marginVertical: 16,
    backgroundColor: 'black',
  },

  // 안내사항 스타일

  noticeHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },

  noticeTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'limegreen',
    marginLeft: 8,
  },

  noticeText: {
    fontSize: 12,
    color: '#444',
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
  recipeQuantity: {
    fontSize: 14,
    color: '#666',
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
  /////////////////////////////////////////////////////////////////////////////////////

  // 슬라이더 수량 조절기 관련 스타일
  quantityEditorContainer: {
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  deductButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deductButtonTextCompleted: {
    color: '#fff',
  },
  debugButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugButtonText: {
    fontSize: 12,
    color: '#666',
  },
  multipleOptionsContainer: {
    marginBottom: 12,
  },
  selectedOptionButton: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectedOptionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOptionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOptionItem: {
    backgroundColor: '#e8f5e8',
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDetails: {
    fontSize: 12,
    color: '#666',
  },
  ingredientNameContainer: {
    flex: 1,
  },
  optionBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quantityEditorContainer: {
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
});

// Slider Quantity Editor Style : './SliderQuantityEditor.tsx'
export const sliderQuantityStyles = StyleSheet.create({
  // Stepper and Input Section Styles
  quantityEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  inputText: {
    color: '#444',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  stepper: {
    flex: 0.7,
    flexDirection: 'row',
    backgroundColor: '#f6f6f6',
    paddingVertical: scale(4),
    borderRadius: scale(8),
    marginRight: scale(8),
  },
  quantityButton: {
    padding: scale(4),
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#444',
  },
  quantityUnit: {
    fontSize: scale(16),
    color: '#666',
    fontWeight: '700',
    marginRight: scale(4),
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: scale(6),
    borderRadius: scale(6),
    borderWidth: scale(1),
    borderColor: '#e3e3e3',
    backgroundColor: 'white',
    marginRight: scale(8),
  },
  // Toggle Button Styles
  isSliderButton: {
    position: 'absolute',
    right: 0,
    width: scale(36),
    height: scale(36),
    backgroundColor: '#f6f6f6',
    borderRadius: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  isNotSliderButton: {
    position: 'absolute',
    right: 0,
    width: scale(36),
    height: scale(36),
    backgroundColor: '#f6f6f6',
    borderRadius: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderQuantityContainer: {
    marginTop: scale(8),
    minWidth: scale(260),
  },
  maxQuantityInfo: {
    alignItems: 'center',
  },
  maxQuantityText: {
    fontSize: scale(10),
    color: '#999',
    fontStyle: 'italic',
  },
  // Slider Section Styles
  sliderSection: {
    marginTop: scale(18),
  },
  sliderContainer: {
    position: 'relative',
  },
  slider: {
    width: '100%',
    height: scale(12),
    backgroundColor: 'limegreen',
    borderRadius: scale(6),
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10),
    marginTop: scale(12),
  },
  sliderLabel: {
    fontSize: scale(14),
    color: '#666',
    fontWeight: '800',
  },
  availableQuantityInfo: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  availableQuantityText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    fontWeight: '500',
  },
  quantityInputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
    backgroundColor: '#fff5f5',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  availableQuantityInfo: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  availableQuantityText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    fontWeight: '500',
  },
  quantityInputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
    backgroundColor: '#fff5f5',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  availableQuantityInfo: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  availableQuantityText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    fontWeight: '500',
  },
  quantityInputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
    backgroundColor: '#fff5f5',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
});

export const infoModalStyles = StyleSheet.create({
  // ConfirmModal과 완전히 동일한 스타일
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#E8F5E8',
  },
  title: {
    fontSize: 21,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 4,
  },
  messageContainer: {
    marginBottom: 16,
    marginTop: 8,
    width: '100%',
  },

  // 안내사항 컨텐츠 스타일
  infoContainer: {
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 0, // ConfirmModal에 맞춰 패딩 제거
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginTop: 9,
    marginRight: 12,
    flexShrink: 0,
  },
  infoText: {
    fontSize: 16, // ConfirmModal message와 동일한 크기
    color: '#666', // ConfirmModal message와 동일한 색상
    fontWeight: '700', // ConfirmModal message와 동일한 굵기
    lineHeight: 24, // ConfirmModal message와 동일한 줄간격
    flex: 1,
  },

  // ConfirmModal과 완전히 동일한 버튼 스타일
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  confirmButton: {
    backgroundColor: 'limegreen', // ConfirmModal successButton와 완전히 동일
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8f8f8', // ConfirmModal successButtonText와 완전히 동일
  },
});
