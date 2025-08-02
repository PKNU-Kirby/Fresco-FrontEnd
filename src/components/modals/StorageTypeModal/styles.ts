import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  // 모달 기본 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  editStorageTypeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    marginRight: 8,
  },
  editStorageTypeButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // 편집 모드 관련 스타일
  editModeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dragHandleText: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  editItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  deleteItemText: {
    fontSize: 16,
  },
  addStorageTypeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    marginRight: 8,
  },
  addStorageTypeButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // 보관 분류 추가 모달
  addStorageTypeSection: {},
  addModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: '80%',
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  addModalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  addModalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: 'lightgray',
    borderRadius: 10,
    alignItems: 'center',
  },
  addModalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
  },
  addModalButtonTextCancel: {fontSize: 14},
  addModalButtonTextAdd: {fontSize: 14, color: 'white'},
});
