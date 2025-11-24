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
  alternativeInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scale(24),
    marginBottom: scale(4),
  },
  alternativeInfoText: {
    marginLeft: scale(4),
    fontSize: scale(15),
    color: '#666',
    fontWeight: '800',
  },
  ingredientCard: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    paddingBottom: scale(0),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: scale(3),
  },
  ingredientHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: scale(8),
  },
  ingredientNameContainer: {},
  ingredientName: {
    fontSize: scale(18),
    fontWeight: '800' as const,
    color: '#444',
  },
  optionBadge: {
    fontSize: scale(16),
    fontWeight: '600',
    color: 'limegreen',
  },
  optionDescription: {},
  recipeQuantity: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableIcon: {
    marginRight: scale(2),
  },
  alternativeOne: {
    fontSize: scale(14),
    color: '#FF9800',
    fontWeight: '500' as const,
  },
  haveOne: {
    fontSize: scale(14),
    color: 'limegreen',
    fontWeight: '500' as const,
  },
  needtext: {
    color: '#444',
  },
  quantityEditorContainer: {
    marginBottom: scale(16),
  },
  quantityLabel: {
    fontSize: scale(14),
    fontWeight: '500',
    color: '#333',
    marginBottom: scale(8),
  },
  deductionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: scale(12),
  },
  deductButton: {
    padding: scale(8),
  },
  deductButtonCompleted: {
    opacity: 0.5,
  },
  deductButtonText: {},
  deductButtonTextCompleted: {},
  deductedText: {
    fontSize: scale(12),
    color: '#4CAF50',
    fontStyle: 'italic' as const,
  },
  unavailableIngredient: {
    padding: scale(8),
    backgroundColor: '#FFEBEE',
    borderRadius: scale(8),
  },
  unavailableText: {
    fontSize: scale(14),
    color: '#F44336',
    fontWeight: '500' as const,
  },
});
export const unavailableStyles = StyleSheet.create({
  unavailableSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingTop: scale(8),
    paddingBottom: scale(16),
  },
  unavailableInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    gap: scale(6),
  },
  unavailableText: {
    fontSize: scale(14),
    color: '#FF6B6B',
    fontWeight: '500' as const,
  },
  addToCartButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: scale(8),
    paddingVertical: scale(8),
    borderRadius: scale(6),
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  addToCartText: {
    color: 'white',
    fontSize: scale(13),
    fontWeight: '600' as const,
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
    paddingHorizontal: scale(16),
    paddingTop: scale(8),
    paddingBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
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
    width: scale(88),
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: '600',
    color: '#333',
  },
  menuButton: {
    padding: scale(8),
  },
  content: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },

  recipeTitle: {
    fontSize: scale(24),
    fontWeight: '700' as const,
    color: '#212529',
    margin: scale(32),
    textAlign: 'center' as const,
    marginVertical: scale(16),
    backgroundColor: 'black',
  },

  // 안내사항 스타일

  noticeHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: scale(8),
  },

  noticeTitle: {
    fontSize: scale(14),
    fontWeight: '600' as const,
    color: 'limegreen',
    marginLeft: scale(8),
  },

  noticeText: {
    fontSize: scale(12),
    color: '#444',
    lineHeight: scale(16),
  },

  section: {
    margin: scale(16),
    marginVertical: scale(16),
  },

  sectionTitle: {
    fontSize: scale(19),
    fontWeight: '600' as const,
    color: '#212529',
  },

  // 재료 카드 스타일
  recipeQuantity: {
    fontSize: scale(14),
    color: '#666',
  },

  quantityInput: {
    flex: 1,
    borderWidth: scale(1),
    borderColor: '#ddd',
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    fontSize: scale(14),
  },

  // Steps 스타일 (이전과 동일)
  stepsContainer: {
    gap: scale(12),
  },

  stepCard: {
    flexDirection: 'row' as const,
    backgroundColor: '#f8f9fa',
    borderRadius: scale(12),
    padding: scale(16),
    borderLeftWidth: scale(4),
    borderLeftColor: '#29a448ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: 2,
  },

  stepCardCompleted: {
    backgroundColor: '#e8f5e8',
    borderLeftColor: '#4CAF50',
    opacity: 0.8,
  },

  stepCheckbox: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#29a448ff',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: scale(12),
    flexShrink: 0,
  },

  stepCheckboxCompleted: {
    backgroundColor: '#4CAF50',
  },

  stepNumber: {
    fontSize: scale(16),
    fontWeight: '700' as const,
    color: '#fff',
  },

  stepContent: {
    flex: 1,
    justifyContent: 'center' as const,
  },

  stepText: {
    fontSize: scale(14),
    color: '#333',
    lineHeight: scale(20),
  },

  stepTextCompleted: {
    color: '#666',
    textDecorationLine: 'line-through' as const,
  },

  progressContainer: {
    marginTop: scale(16),
    padding: scale(12),
    backgroundColor: '#f0f8ff',
    borderRadius: scale(8),
    borderWidth: scale(1),
    borderColor: '#e3f2fd',
  },

  progressText: {
    fontSize: scale(12),
    color: '#1976d2',
    fontWeight: '600' as const,
    marginBottom: scale(8),
    textAlign: 'center' as const,
  },

  progressBar: {
    height: scale(6),
    backgroundColor: '#e3f2fd',
    borderRadius: scale(3),
    overflow: 'hidden' as const,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#1976d2',
    borderRadius: scale(3),
  },

  // 완료 버튼
  completeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#4CAF50',
    margin: scale(16),
    padding: scale(16),
    borderRadius: scale(12),
    gap: scale(8),
  },

  completeButtonText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: '600' as const,
  },

  bottomSpacer: {
    height: scale(20),
  },
  /////////////////////////////////////////////////////////////////////////////////////

  // 슬라이더 수량 조절기 관련 스타일
  quantityEditorContainer: {
    marginBottom: scale(16),
  },
  quantityLabel: {
    fontSize: scale(14),
    fontWeight: '500',
    color: '#333',
    marginBottom: scale(8),
  },
  deductButtonText: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: 'bold',
    marginLeft: scale(8),
  },
  deductButtonTextCompleted: {
    color: '#fff',
  },
  debugButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(6),
  },
  debugButtonText: {
    fontSize: scale(12),
    color: '#666',
  },
  multipleOptionsContainer: {
    marginBottom: scale(12),
  },
  selectedOptionButton: {
    backgroundColor: '#f0f8ff',
    borderRadius: scale(8),
    padding: scale(12),
    marginTop: scale(8),
    borderWidth: scale(1),
    borderColor: '#007AFF',
  },
  selectedOptionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOptionText: {
    fontSize: scale(14),
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
    borderTopLeftRadius: scale(16),
    borderTopRightRadius: scale(16),
    maxHeight: '70%',
    paddingBottom: scale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(16),
    borderBottomWidth: scale(1),
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    borderBottomWidth: scale(1),
    borderBottomColor: '#f0f0f0',
  },
  selectedOptionItem: {
    backgroundColor: '#e8f5e8',
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(4),
  },
  optionDetails: {
    fontSize: scale(12),
    color: '#666',
  },
  ingredientNameContainer: {
    flex: 1,
  },
  optionBadge: {
    fontSize: scale(12),
    color: '#007AFF',
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: scale(12),
    color: '#666',
    marginTop: scale(2),
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
    fontSize: scale(15),
    fontWeight: '600',
    marginRight: scale(8),
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
    marginBottom: scale(8),
    paddingHorizontal: scale(4),
  },
  availableQuantityText: {
    fontSize: scale(12),
    color: '#666',
    textAlign: 'right',
    fontWeight: '500',
  },
  quantityInputError: {
    borderColor: '#ff4444',
    borderWidth: scale(2),
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
    padding: scale(20),
  },
  modalContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: scale(16),
    padding: scale(24),
    alignItems: 'center',
    maxWidth: scale(320),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(20),
    elevation: 10,
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
    backgroundColor: '#E8F5E8',
  },
  title: {
    fontSize: scale(21),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(8),
    marginTop: scale(4),
  },
  messageContainer: {
    marginBottom: scale(16),
    marginTop: scale(8),
    width: '100%',
  },

  // 안내사항 컨텐츠 스타일
  infoContainer: {
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: scale(12),
    paddingHorizontal: scale(0), // ConfirmModal에 맞춰 패딩 제거
  },
  bullet: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#4CAF50',
    marginTop: scale(9),
    marginRight: scale(12),
    flexShrink: 0,
  },
  infoText: {
    fontSize: scale(16), // ConfirmModal message와 동일한 크기
    color: '#666', // ConfirmModal message와 동일한 색상
    fontWeight: '700', // ConfirmModal message와 동일한 굵기
    lineHeight: scale(24), // ConfirmModal message와 동일한 줄간격
    flex: 1,
  },

  // ConfirmModal과 완전히 동일한 버튼 스타일
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(12),
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(44),
  },
  confirmButton: {
    backgroundColor: 'limegreen', // ConfirmModal successButton와 완전히 동일
  },
  confirmButtonText: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#f8f8f8', // ConfirmModal successButtonText와 완전히 동일
  },
});

export const stepsStyles = StyleSheet.create({
  section: {
    margin: scale(16),
  },
  stepsContainer: {
    gap: scale(12),
  },
  sectionTitle: {
    fontSize: scale(19),
    fontWeight: '600' as const,
    color: '#2F4858',
    marginTop: scale(16),
    marginBottom: scale(12),
    marginHorizontal: scale(8),
  },
  stepCard: {
    flexDirection: 'row' as const,
    backgroundColor: '#f8f9fa',
    borderRadius: scale(12),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: 2,
  },
  stepCardCompleted: {
    backgroundColor: '#e8f5e8',
    opacity: 0.8,
  },
  stepCheckbox: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#bbb',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: scale(16),
    flexShrink: 0,
  },
  stepCheckboxCompleted: {
    backgroundColor: '#2F4858',
  },
  stepNumber: {
    fontSize: scale(16),
    fontWeight: '700' as const,
    color: '#fff',
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  stepText: {
    fontSize: scale(15),
    color: '#444',
    fontWeight: '600',
    lineHeight: scale(20),
  },
  stepTextCompleted: {
    color: '#666',
  },
  progressContainer: {
    marginTop: scale(16),
    padding: scale(12),
    backgroundColor: '#FFE5E5',
    borderRadius: scale(8),
    borderWidth: scale(1),
    borderColor: '#e3f2fd',
  },
  progressText: {
    fontSize: scale(14),
    color: '#FF6B6B',
    fontWeight: '600' as const,
    marginBottom: scale(8),
    textAlign: 'center' as const,
  },
  progressBar: {
    height: scale(6),
    backgroundColor: '#cfc7c4ff',
    borderRadius: scale(3),
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: scale(3),
  },
});
