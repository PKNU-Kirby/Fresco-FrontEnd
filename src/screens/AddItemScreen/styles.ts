import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  headerButtonDisabled: {
    backgroundColor: '#CCC',
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 컨텐츠
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // 아이템 추가 버튼
  addButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // 편집 모드 버튼
  editModeContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backToEditButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  backToEditButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

  // 하단 여백
  bottomPadding: {
    height: 50,
  },
});

export const cardStyles = StyleSheet.create({
  // 카드 기본
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

  // 삭제 버튼
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    opacity: 0.5,
  },

  // 이미지 영역
  imageContainer: {
    marginRight: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 아이템 정보
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // 이름 입력
  nameInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    backgroundColor: '#F9F9F9',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },

  // 상세 정보 행
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  // 수량 컨테이너
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    margin: 3,
    opacity: 0.5,
  },
  quantityInput: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 8,
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },

  // 단위 선택
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
  unitText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },

  // 날짜 버튼
  dateButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#666',
  },
  expiryText: {
    fontSize: 14,
    color: '#666',
  },

  // 상태 행
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
