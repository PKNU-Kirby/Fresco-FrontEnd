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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    width: '80%',
    maxWidth: scale(300),
    minHeight: scale(100),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    borderBottomWidth: scale(1),
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    fontSize: scale(16),
    color: '#333',
    fontWeight: '400',
  },
  confirmButton: {
    fontSize: scale(16),
    color: 'limegreen',
    fontWeight: '600',
  },
  pickerContainer: {
    alignItems: 'center',
    minHeight: scale(250),
  },
});
