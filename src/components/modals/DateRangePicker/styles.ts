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
  // 메인 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(14),
    width: width * 0.85,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingVertical: scale(20),
    borderBottomWidth: scale(0.5),
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: scale(17),
    fontWeight: '600',
    color: '#000',
  },

  // 날짜 선택 영역
  dateContainer: {
    paddingTop: scale(24),
    paddingHorizontal: scale(20),
  },
  dateSection: {
    marginBottom: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginRight: scale(24),
    marginLeft: scale(8),
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: '#e0e0e0',
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    backgroundColor: '#fff',
    width: scale(230),
  },
  dateInputText: {
    fontSize: scale(16),
    color: '#666',
  },
  dateInputArrow: {
    fontSize: scale(12),
    color: '#666',
  },

  // 하단 버튼들
  modalButtons: {
    borderTopWidth: scale(0.5),
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: scale(16),
    alignItems: 'center',
    borderRightWidth: scale(0.5),
    borderRightColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: scale(16),
    color: '#333',
    fontWeight: '400',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: scale(16),
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: scale(16),
    color: 'limegreen',
    fontWeight: '600',
  },

  // DateTimePicker 모달 스타일 (수정된 버전)
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'stretch', // 추가: 전체 너비 사용
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    paddingBottom: scale(34), // Safe area
    minHeight: scale(300), // 추가: 최소 높이 보장
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    borderBottomWidth: scale(1),
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff', // 추가: 명시적 배경색
  },
  datePickerTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#000',
  },
  datePickerCancel: {
    fontSize: scale(17),
    color: '#007AFF',
    fontWeight: '400',
  },
  datePickerConfirm: {
    fontSize: scale(17),
    color: '#007AFF',
    fontWeight: '600',
  },

  // 추가: DateTimePicker 컨테이너 스타일
  datePickerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: scale(8),
    paddingTop: scale(10),
  },
});
