import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  // 임시 테스트 버튼 스타일
  testButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export const Cardstyles = StyleSheet.create({
  // 기본 카드 스타일 (기존 cardStyles.itemCard 기반)
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
    alignItems: 'center',
  },
  checkedItemCard: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  activeItemCard: {
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },

  // 체크박스 (이미지 영역)
  checkboxContainer: {
    marginRight: 16,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedImagePlaceholder: {
    backgroundColor: '#4CAF50',
  },

  // 아이템 정보
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  checkedText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },

  // 수량 및 단위
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  quantityButton: {
    padding: 4,
    opacity: 0.7,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  quantityInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },

  // 단위 선택
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    marginRight: 2,
  },

  // 카테고리
  itemCategory: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // 삭제 버튼
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    opacity: 0.6,
  },

  // 드래그 핸들
  dragHandle: {
    paddingLeft: 8,
    opacity: 0.5,
  },

  // 단위 선택 모달 (기존 modalStyles 기반)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxHeight: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  unitOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
  unitOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedUnitOption: {
    backgroundColor: '#333',
  },
  unitOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedUnitOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
