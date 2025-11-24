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
  inputContainer: {
    width: '100%',
    marginVertical: scale(16),
  },
  input: {
    width: '100%',
    height: scale(48),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    fontSize: scale(16),
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'tomato',
    fontSize: scale(12),
    marginTop: scale(8),
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(24),
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: 'rgba(47, 72, 88, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  title: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#333',
    marginBottom: scale(8),
  },
  message: {
    fontSize: scale(14),
    color: '#666',
    textAlign: 'center',
    marginBottom: scale(24),
    lineHeight: scale(20),
  },
  input: {
    width: '100%',
    height: scale(48),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    fontSize: scale(16),
    backgroundColor: '#fff',
    marginBottom: scale(8),
  },
  inputError: {
    borderColor: 'tomato',
  },
  errorText: {
    width: '100%',
    color: 'tomato',
    fontSize: scale(12),
    marginBottom: scale(16),
    paddingLeft: scale(4),
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(12),
    marginTop: scale(8),
  },
  button: {
    flex: 1,
    height: scale(48),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: 'rgba(47, 72, 88, 1)',
  },
  cancelButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#fff',
  },
});
