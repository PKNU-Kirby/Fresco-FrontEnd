import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  itemImageContainer: {
    marginRight: 16,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  itemExpiry: {
    fontSize: 14,
    color: '#666',
  },
  editableExpiry: {
    //    color: '#007AFF',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  itemStatus: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // 편집 모드 - 개수 조절 ////////////////////////////////////
  quantityEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 26,
    height: 26,
    backgroundColor: '#333',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityInput: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 8,
  },
  quantityUnit: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },

  // 편집 모드 - 삭제 버튼 (우상단) /////////////////////////////
  deleteItemButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    backgroundColor: '#333',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    opacity: 0.5,
  },
  deleteItemButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },

  // 삭제 확인 모달 스타일 /////////////////////////////////////
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  deleteModalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },

  // 단위 선택 관련 스타일 추가 //////////////////////////////////
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 4,
  },
  unitDropdownIcon: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },

  // 단위 선택 모달
  unitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxHeight: 300,
    alignItems: 'center',
  },
  unitModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  unitOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  unitOption: {
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    minWidth: 46,
    alignItems: 'center',
  },
  unitOptionSelected: {
    backgroundColor: '#333',
  },
  unitOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  unitOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unitModalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  unitModalCloseText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
