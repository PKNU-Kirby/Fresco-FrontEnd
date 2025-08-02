import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 12,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#fff',
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
