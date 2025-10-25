import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
  },
  listContainer: {
    paddingTop: scale(56),
    paddingBottom: scale(20),
  },
});

export const buttonsStyles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    top: scale(16),
    left: 0,
    right: 0,
    zIndex: scale(1000),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingBottom: scale(10),
    backgroundColor: '#e8f5e875',
  },
  leftButtonGroup: {
    flexDirection: 'row',
    gap: scale(10),
    flex: 1,
  },
  rightButtonGroup: {
    flexDirection: 'row',
    gap: scale(8),
  },
});

export const headerStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scale(60),
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(16),
    paddingTop: scale(8),
    paddingBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(16),
    fontSize: scale(20),
    fontWeight: '800',
    color: '#444',
    textAlign: 'center',
    maxWidth: '100%',
  },
});

export const addItemStyles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d6d6d6',
    borderRadius: '50%',
    padding: scale(8),
    marginHorizontal: scale(16),
    marginBottom: scale(12),
    marginTop: scale(10),
    alignSelf: 'center',
  },
});

export const cardStyles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
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
    shadowOpacity: scale(0.3),
    shadowRadius: scale(8),
    elevation: scale(8),
    transform: [{ scale: 1.02 }],
  },

  // checkbox section
  checkboxContainer: {
    marginRight: scale(18),
  },
  itemImagePlaceholder: {
    width: scale(30),
    height: scale(30),
    backgroundColor: '#e0e0e0',
    borderRadius: scale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedImagePlaceholder: {
    backgroundColor: 'limegreen',
  },

  // item data
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scale(8),
    backgroundColor: '#fff',
    borderRadius: scale(4),
    borderWidth: scale(1),
    borderColor: '#ddd',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    minHeight: scale(32),
    width: scale(200),
  },
  checkedText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },

  // quantity & unit
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(4),
  },

  // 일반 모드 - 간단한 수량 표시
  simpleQuantityText: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#333',
    marginRight: scale(8),
  },

  // 편집 모드 - 단위 선택
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(6),
    borderWidth: scale(1),
    borderColor: '#ddd',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },
  unitText: {
    fontSize: scale(14),
    color: '#666',
    marginRight: scale(2),
  },

  // Show Unit
  simpleUnitText: {
    fontSize: scale(16),
    color: '#666',
    fontWeight: '500',
  },

  // Delete Button
  deleteButton: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    padding: scale(4),
    opacity: 0.6,
  },
});

export const newItemCardStyles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
    alignItems: 'center',
  },
  newItemCard: {
    borderColor: '#4fbb53',
    borderWidth: scale(1),
    backgroundColor: '#f9fff9',
  },
  itemInfo: {
    flex: 1,
  },
  nameInput: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    borderBottomWidth: scale(1),
    borderBottomColor: '#4fbb53',
    paddingVertical: scale(4),
    marginBottom: scale(8),
    marginLeft: scale(8),
    width: 200,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginLeft: scale(8),
  },

  // New item actions
  newItemActions: {
    flexDirection: 'row',
    gap: scale(8),
    marginLeft: scale(12),
  },
  cancelButton: {
    padding: scale(8),
    borderRadius: scale(8),
    backgroundColor: '#d5d5d5',
  },
  saveButton: {
    padding: scale(8),
    borderRadius: scale(8),
    backgroundColor: '#cbe8cb',
  },
});

export const itemDeleteConfirmModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(24),
    alignItems: 'center',
    maxWidth: scale(320),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: scale(20),
    elevation: 10,
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  title: {
    fontSize: scale(20),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(8),
  },
  message: {
    fontSize: scale(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: scale(24),
    marginBottom: scale(24),
  },
  itemName: {
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(12),
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(44),
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: scale(1),
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
  },
  cancelButtonText: {
    fontSize: scale(16),
    fontWeight: '500',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: scale(16),
    fontWeight: '500',
    color: '#fff',
  },
});
export const flushConfirmModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: scale(24),
    padding: scale(24),
    alignItems: 'center',
    maxWidth: scale(320),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: scale(20),
    elevation: 10,
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: '50%',
    backgroundColor: '#ffe3d9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  title: {
    fontSize: scale(20),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(8),
  },
  message: {
    fontSize: scale(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: scale(24),
    marginBottom: scale(24),
  },
  itemCount: {
    fontWeight: '600',
    color: 'coral',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(12),
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(44),
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
    borderWidth: scale(1),
    borderColor: '#e8e8e8',
  },
  confirmButton: {
    backgroundColor: 'coral',
  },
  cancelButtonText: {
    fontSize: scale(16),
    fontWeight: '500',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#f8f8f8',
  },
});
