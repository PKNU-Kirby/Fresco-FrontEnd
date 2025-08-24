import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
//const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
//const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

// 메인 모달 스타일
export const modalStyles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    position: 'absolute',
    bottom: scale(108),
    right: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
    elevation: 8,
  },
  modalContent: {
    backgroundColor: 'rgba(138, 138, 138, 0.92)',
    borderRadius: scale(24),
    width: scale(208),
    overflow: 'hidden',
  },
  modalHeader: {
    padding: scale(16),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '800',
    color: '#f8f8f8',
  },
  optionContainer: {
    marginHorizontal: scale(24),
    paddingVertical: scale(16),
    height: scale(164),
  },
  modalButtons: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(138, 138, 138, 0.92)',
  },
  cancelButton: {
    paddingVertical: scale(16),
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: scale(16),
    color: '#f8f8f8',
    fontWeight: '800',
  },
});

// 옵션 버튼 스타일
export const optionStyles = StyleSheet.create({
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(16),
    paddingHorizontal: scale(16),
    marginBottom: scale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(55, 55, 55, 0.57)',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.8,
    shadowRadius: scale(12),
    elevation: 4,
  },
  optionIcon: {
    borderRadius: scale(25),
    marginRight: scale(16),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 6,
  },
  optionText: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#444',
    flex: 1,
  },
});
