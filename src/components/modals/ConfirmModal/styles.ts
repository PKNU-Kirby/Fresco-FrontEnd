import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  },
  message: {
    fontSize: 16,
    color: '#666',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  itemName: {
    fontWeight: '600',
    color: '#333',
  },
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
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  successButton: {
    backgroundColor: 'limegreen',
  },
  dangerButton: {
    backgroundColor: 'tomato',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  successButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8f8f8',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f8f8f8',
  },
  itemCount: {
    fontWeight: '600',
    color: 'coral',
  },
});
