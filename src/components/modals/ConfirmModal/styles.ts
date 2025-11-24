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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: scale(16),
    padding: scale(24),
    alignItems: 'center',
    maxWidth: scale(320),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(10),
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(20),
    elevation: scale(10),
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  title: {
    fontSize: scale(21),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(8),
    marginTop: scale(4),
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: scale(16),
    marginTop: scale(24),
  },
  message: {
    fontSize: scale(16),
    color: '#666',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: scale(24),
    marginBottom: scale(8),
  },
  itemName: {
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(12),
    width: '100%',
    marginTop: scale(16),
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
  successButton: {
    backgroundColor: 'limegreen',
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
  },
  generalButton: {
    backgroundColor: 'rgba(47, 72, 88, 1)',
  },
  cancelButtonText: {
    fontSize: scale(16),
    fontWeight: '500',
    color: '#666',
  },
  successButtonText: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#f8f8f8',
  },
  dangerButtonText: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#f8f8f8',
  },
  generalButtonText: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#f8f8f8',
  },
  itemCount: {
    fontWeight: '600',
    color: 'coral',
  },
  input: {
    minWidth: '80%',
    borderWidth: scale(1),
    borderColor: '#E0E0E0',
    borderRadius: scale(6),
    padding: scale(12),
    marginTop: scale(8),
    marginBottom: scale(16),
    fontSize: scale(16),
    color: '#333',
    backgroundColor: '#f5f5f5',
  },
});
