import { StyleSheet } from 'react-native';

export const createModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  halfSection: {
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row' as const,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333',
  },
  folderChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginRight: 8,
  },
  folderChipSelected: {
    backgroundColor: '#007AFF',
  },
  folderChipText: {
    fontSize: 14,
    color: '#666',
  },
  folderChipTextSelected: {
    color: '#FFFFFF',
  },
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  listNumber: {
    fontSize: 14,
    color: '#666',
    width: 20,
    textAlign: 'center' as const,
  },
  listInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#333',
    marginHorizontal: 8,
  },
  difficultyRow: {
    flexDirection: 'row' as const,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    alignItems: 'center' as const,
    marginRight: 4,
  },
  difficultyButtonSelected: {
    backgroundColor: '#007AFF',
  },
  difficultyText: {
    fontSize: 12,
    color: '#666',
  },
  difficultyTextSelected: {
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 50,
  },
});
