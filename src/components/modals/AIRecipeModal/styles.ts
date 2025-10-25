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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    borderBottomWidth: scale(1),
    borderBottomColor: '#eee',
    paddingTop: scale(50), // Safe area
  },
  closeButton: {
    padding: scale(4),
  },
  generateButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    minWidth: scale(60),
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  section: {
    marginVertical: scale(16),
  },
  sectionTitle: {
    marginBottom: scale(12),
    color: '#333',
  },
  promptInput: {
    borderWidth: scale(1),
    borderColor: '#ddd',
    borderRadius: scale(12),
    padding: scale(16),
    fontSize: scale(16),
    minHeight: scale(100),
    backgroundColor: '#f9f9f9',
  },
  charCount: {
    textAlign: 'right',
    marginTop: scale(4),
  },
  quickPromptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  quickPromptButton: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(16),
    borderWidth: scale(1),
    borderColor: '#4A90E2',
  },
  optionRow: {
    flexDirection: 'row',
    gap: scale(8),
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(20),
  },
  servingsButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: scale(1),
    borderColor: '#4A90E2',
  },
  servingsText: {
    minWidth: scale(60),
    textAlign: 'center',
  },
  cuisineRow: {
    flexDirection: 'row',
    gap: scale(8),
  },
  cuisineButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(16),
    borderWidth: scale(1),
    borderColor: '#ddd',
  },
  selectedCuisine: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  dietaryButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(12),
    borderWidth: scale(1),
    borderColor: '#ddd',
  },
  selectedDietary: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(6),
    alignItems: 'center',
  },
  ingredientTag: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(10),
    borderWidth: scale(1),
    borderColor: '#4A90E2',
  },
});
