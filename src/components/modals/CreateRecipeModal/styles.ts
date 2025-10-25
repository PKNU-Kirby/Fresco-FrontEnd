import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const createModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: scale(16),
    color: '#666',
  },
  saveButton: {
    fontSize: scale(16),
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: scale(16),
  },
  section: {
    marginBottom: scale(24),
  },
  halfSection: {
    flex: 1,
    marginRight: scale(8),
  },
  row: {
    flexDirection: 'row' as const,
    marginBottom: scale(24),
  },
  label: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(8),
  },
  labelRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: scale(8),
  },
  input: {
    borderWidth: scale(1),
    borderColor: '#E0E0E0',
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(12),
    fontSize: scale(16),
    backgroundColor: '#FFFFFF',
    color: '#333',
  },
  folderChip: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    backgroundColor: '#F0F0F0',
    borderRadius: scale(16),
    marginRight: scale(8),
  },
  folderChipSelected: {
    backgroundColor: '#007AFF',
  },
  folderChipText: {
    fontSize: scale(14),
    color: '#666',
  },
  folderChipTextSelected: {
    color: '#FFFFFF',
  },
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: scale(8),
  },
  listNumber: {
    fontSize: scale(14),
    color: '#666',
    width: scale(20),
    textAlign: 'center' as const,
  },
  listInput: {
    flex: 1,
    borderWidth: scale(1),
    borderColor: '#E0E0E0',
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    fontSize: scale(14),
    backgroundColor: '#FFFFFF',
    color: '#333',
    marginHorizontal: scale(8),
  },
  difficultyRow: {
    flexDirection: 'row' as const,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: scale(8),
    backgroundColor: '#F0F0F0',
    borderRadius: scale(6),
    alignItems: 'center' as const,
    marginRight: 4,
  },
  difficultyButtonSelected: {
    backgroundColor: '#007AFF',
  },
  difficultyText: {
    fontSize: scale(12),
    color: '#666',
  },
  difficultyTextSelected: {
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: scale(50),
  },
});
