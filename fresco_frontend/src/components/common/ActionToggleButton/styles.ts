import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'lightgray',
    borderRadius: 16,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#333',
  },
  actionButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtonDisabled: {
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
});
