import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    position: 'relative',
  },
  modalOverlay: {
    position: 'absolute',
    bottom: 108,
    right: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalContent: {
    backgroundColor: '#ccc',
    borderRadius: 14,
    width: 300,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },

  optionContainer: {
    padding: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#eee',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    flex: 1,
  },

  // 하단 버튼
  modalButtons: {
    borderTopWidth: 0.5,
    borderTopColor: '#999',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
});
