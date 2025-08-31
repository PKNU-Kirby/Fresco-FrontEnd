import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Platform, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from './styles';

type DatePickerProps = {
  visible: boolean;
  initialDate: string;
  onDateSelect: (year: number, month: number, day: number) => void;
  onClose: () => void;
};

const DatePicker: React.FC<DatePickerProps> = ({
  visible,
  initialDate,
  onDateSelect,
  onClose,
}) => {
  // 초기 날짜를 Date 객체로 변환
  const parseInitialDate = (dateString: string): Date => {
    try {
      // 하이픈이나 점으로 구분된 날짜 파싱
      const parts = dateString.split(/[-.]/).map(Number);

      if (parts.length !== 3 || parts.some(isNaN)) {
        return new Date();
      }

      const [year, month, day] = parts;
      return new Date(year, month - 1, day);
    } catch (error) {
      return new Date();
    }
  };

  const [selectedDate, setSelectedDate] = useState(
    parseInitialDate(initialDate),
  );
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);

      if (event.type === 'set' && date) {
        // Android : 확인 버튼 클릭
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        onDateSelect(year, month, day);
      } else {
        // Android : 취소 버튼 클릭
        onClose();
      }
    } else {
      // iOS : 실시간 날짜 변경
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleConfirm = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    onDateSelect(year, month, day);
  };

  const handleCancel = () => {
    onClose();
  };

  if (!visible) return null;

  // Android는 네이티브 모달이므로 별도 Modal 래핑 불필요
  if (Platform.OS === 'android') {
    return showPicker ? (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={handleDateChange}
      />
    ) : null;
  }

  // iOS는 커스텀 모달에 DateTimePicker 포함
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelButton}>취소</Text>
            </TouchableOpacity>

            <Text style={styles.title}>소비기한 선택</Text>

            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.confirmButton}>확인</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner" // iOS 휠 스타일
              onChange={handleDateChange}
              locale="ko-KR" // 한국어 로케일
              textColor="#000" // 텍스트 색상
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DatePicker;
