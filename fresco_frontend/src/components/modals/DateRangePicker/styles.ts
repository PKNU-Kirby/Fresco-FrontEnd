import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

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
    borderRadius: 14,
    width: width * 0.85,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },

  // 날짜 선택 영역
  dateContainer: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  dateSection: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 24,
    marginLeft: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    width: 230,
  },
  dateInputText: {
    fontSize: 16,
    color: '#666',
  },
  dateInputArrow: {
    fontSize: 12,
    color: '#666',
  },

  // 하단 버튼들
  modalButtons: {
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area
    minHeight: 300, // 추가: 최소 높이 보장
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff', // 추가: 명시적 배경색
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  datePickerCancel: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },
  datePickerConfirm: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },

  // 추가: DateTimePicker 컨테이너 스타일
  datePickerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingTop: 10,
  },
});
