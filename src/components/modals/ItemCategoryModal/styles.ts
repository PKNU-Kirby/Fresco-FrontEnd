import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  // 모달 기본 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || scale(0)) + scale(8)
        : scale(8),
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(14),
    padding: scale(20),
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: scale(20),
    color: '#333',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(15),
    paddingHorizontal: scale(10),
    borderBottomWidth: scale(1),
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: scale(16),
    color: '#333',
  },
  checkMark: {
    fontSize: scale(18),
    color: '#333',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(20),
    gap: scale(10),
  },
  editCategoryButton: {
    flex: 1,
    paddingVertical: scale(12),
    backgroundColor: '#333',
    borderRadius: scale(8),
    marginRight: scale(8),
  },
  editCategoryButtonText: {
    fontSize: scale(14),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    flex: 1,
    paddingVertical: scale(12),
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: scale(14),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // 편집 모드 관련 스타일 추가
  editModeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(12),
    borderBottomWidth: scale(1),
    borderBottomColor: '#f0f0f0',
  },
  dragHandleText: {
    fontSize: scale(18),
    color: '#999',
    fontWeight: 'bold',
  },
  editItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },
  deleteItemText: {
    fontSize: 16,
  },
  addCategoryButton: {
    flex: 1,
    paddingVertical: scale(12),
    backgroundColor: '#333',
    borderRadius: scale(8),
    marginRight: scale(8),
  },
  addCategoryButtonText: {
    fontSize: scale(14),
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: scale(12),
    backgroundColor: 'lightgray',
    borderRadius: scale(8),
  },
  confirmButtonText: {
    fontSize: scale(14),
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // 추가 모달 스타일
  addCategorySection: {},
  addModalContent: {
    backgroundColor: '#fff',
    padding: scale(20),
    width: '80%',
  },
  addModalTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  addModalInput: {
    borderWidth: scale(1),
    borderColor: '#ddd',
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    fontSize: scale(16),
    marginVertical: scale(16),
  },
  addModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(20),
    gap: scale(10),
  },
  addModalCancelButton: {
    flex: 1,
    paddingVertical: 13.5,
    backgroundColor: 'lightgray',
    borderRadius: scale(8),
    marginRight: scale(8),
  },
  addModalButtonTextCancel: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addModalConfirmButton: {
    flex: 1,
    paddingVertical: 13.5,
    backgroundColor: '#333',
    borderRadius: scale(8),
  },
  addModalButtonTextAdd: {
    fontSize: scale(14),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
