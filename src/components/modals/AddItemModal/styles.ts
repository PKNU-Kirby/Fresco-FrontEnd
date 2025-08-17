import { StyleSheet } from 'react-native';

// 메인 모달 스타일
export const modalStyles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(37, 37, 37, 0.64)',
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
    backgroundColor: 'rgba(138, 138, 138, 0.92)',
    borderRadius: 24,
    width: 208,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8f8f8',
  },
  optionContainer: {
    marginHorizontal: 24,
    paddingVertical: 16,
    height: 164,
  },
  modalButtons: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(138, 138, 138, 0.92)',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#f8f8f8',
    fontWeight: '800',
  },
});

// 옵션 버튼 스타일
export const optionStyles = StyleSheet.create({
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(55, 55, 55, 0.57)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
  },
  optionIcon: {
    borderRadius: 25,
    marginRight: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    flex: 1,
  },
});
