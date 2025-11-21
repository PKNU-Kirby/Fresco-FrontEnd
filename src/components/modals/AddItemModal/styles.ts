import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const modalStyles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalOverlay: {
    position: 'absolute',
    bottom: scale(108),
    right: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(8),
    },
    shadowOpacity: 0.4,
    shadowRadius: scale(12),
    elevation: 10,
  },
  modalContent: {
    paddingVertical: scale(4),
    backgroundColor: '#a4a4a4d6',
    borderRadius: scale(24),
    width: scale(240),
    overflow: 'hidden',
  },
  modalHeader: {
    padding: scale(20),
    borderBottomWidth: scale(0),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: '900',
    color: '#444',
    letterSpacing: -0.3,
  },
  optionContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
  },
  modalButtons: {
    borderTopWidth: scale(1),
    borderTopColor: '#cacaca4d',
    backgroundColor: 'f3f3f3',
  },
  cancelButton: {
    paddingVertical: scale(16),
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: scale(16),
    color: '#444',
    fontWeight: '800',
  },
});

// 옵션 버튼 스타일
export const optionStyles = StyleSheet.create({
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(16),
    paddingHorizontal: scale(16),
    marginBottom: scale(10),
    backgroundColor: '#d7d7d7ca',
    borderRadius: scale(16),
    borderWidth: 1.5,
    borderColor: '#d7d7d7ca',
    // 그림자 더 부드럽게
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(2),
    },
    shadowOpacity: 0.08,
    shadowRadius: scale(8),
    elevation: 3,
  },
  optionIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#e1e1e1ca',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(1),
    },
    shadowOpacity: 0.06,
    shadowRadius: scale(4),
    elevation: 2,
  },
  optionText: {
    fontSize: scale(17),
    fontWeight: '600',
    color: '#444',
    flex: 1,
    letterSpacing: -0.2,
  },
});
