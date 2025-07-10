import {StyleSheet, Dimensions} from 'react-native';

// const {width, height} = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header Style
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },
  accountButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  headerButtonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },

  // Tab
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  leftTabGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  rightTabGroup: {
    flexDirection: 'row',
    gap: 8,
  },

  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 16,
    minWidth: 80,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'lightgray',
    borderRadius: 15,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionButtonActive: {
    backgroundColor: '#333',
  },
  actionButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // 모달 관련 스타일
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

  // 편집 모드 관련 스타일
  editModeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dragHandle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  deleteItemButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteItemText: {
    fontSize: 18,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  confirmButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addCategoryButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#34C759',
    borderRadius: 12,
    marginRight: 8,
  },
  addCategoryButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // 보관 분류 추가 모달
  addModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
    backgroundColor: '#8E8E93',
    borderRadius: 12,
  },
  addModalCancelText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addModalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  addModalConfirmText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Main Content Style
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Item Card Style
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
  itemStatus: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // 플러스 버튼 스타일
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    backgroundColor: '#ccc',
    borderRadius: 28,
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
  addButtonIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  addButtonHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#666',
    top: 9,
    left: 0,
  },
  addButtonVertical: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#666',
    top: 0,
    left: 9,
  },

  // Nav Bar Style
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeNavTabText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
});
