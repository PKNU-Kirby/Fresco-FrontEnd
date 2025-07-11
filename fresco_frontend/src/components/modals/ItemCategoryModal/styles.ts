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
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
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
  checkMark: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  editCategoryButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 12,
  },
  editCategoryButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'lightgray',
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
