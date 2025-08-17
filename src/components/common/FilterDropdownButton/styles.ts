import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  filterButton: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: '#444',
    borderRadius: 16,
  },
  filterButtonText: {
    fontSize: 16,
    color: '#f8f8f8',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  filterButtonTextDisabled: {
    color: '#999',
  },
});
