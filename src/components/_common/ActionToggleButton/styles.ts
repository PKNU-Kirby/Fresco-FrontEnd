import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  actionButton: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    padding: 8,
    backgroundColor: '#d8d8d8',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#444',
    fontWeight: 'bold',
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
    opacity: 0.6,
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
});
