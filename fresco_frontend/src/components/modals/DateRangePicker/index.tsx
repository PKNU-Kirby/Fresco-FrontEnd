import React, {useState} from 'react';
import {View, Modal, TouchableOpacity, Alert, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomText from '../../common/CustomText';
import {styles} from './styles';

type DateRangePickerProps = {
  visible: boolean;
  onClose: () => void;
  onDateRangeSelect: (startDate: string, endDate: string) => void;
};

type PickerMode = 'range' | 'startDate' | 'endDate';

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  visible,
  onClose,
  onDateRangeSelect,
}) => {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 일주일 전
  );
  const [endDate, setEndDate] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<PickerMode>('range');
  const [tempDate, setTempDate] = useState(new Date());

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const handleStartDatePress = () => {
    setTempDate(startDate);
    setPickerMode('startDate');
  };

  const handleEndDatePress = () => {
    setTempDate(endDate);
    setPickerMode('endDate');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleDateConfirm = () => {
    if (pickerMode === 'startDate') {
      setStartDate(tempDate);
      setPickerMode('range');
    } else if (pickerMode === 'endDate') {
      setEndDate(tempDate);
      setPickerMode('range');
    }
  };

  const handleDateCancel = () => {
    setPickerMode('range');
  };

  const handleConfirm = () => {
    if (startDate > endDate) {
      Alert.alert('오류', '시작일은 종료일보다 빨라야 합니다.');
      return;
    }

    onDateRangeSelect(formatDate(startDate), formatDate(endDate));
    onClose();
    setPickerMode('range'); // 초기화
  };

  const handleClose = () => {
    setPickerMode('range'); // 초기화
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            pickerMode !== 'range' && {height: '38.8%'}, // 날짜 선택 모드일 때 높이 증가
          ]}>
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <CustomText style={styles.modalTitle}>
              {pickerMode === 'startDate'
                ? '시작일 선택'
                : pickerMode === 'endDate'
                ? '종료일 선택'
                : '기간 선택하기'}
            </CustomText>
          </View>

          {/* 기간 선택 화면 */}
          {pickerMode === 'range' && (
            <>
              <View style={styles.dateContainer}>
                <View style={styles.dateSection}>
                  <CustomText style={styles.dateLabel}>시작일</CustomText>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={handleStartDatePress}>
                    <CustomText style={styles.dateInputText}>
                      {formatDate(startDate)}
                    </CustomText>
                    <CustomText style={styles.dateInputArrow}>
                      (달력아이콘)
                    </CustomText>
                  </TouchableOpacity>
                </View>
                <View style={styles.dateSection}>
                  <CustomText style={styles.dateLabel}>종료일</CustomText>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={handleEndDatePress}>
                    <CustomText style={styles.dateInputText}>
                      {formatDate(endDate)}
                    </CustomText>
                    <CustomText style={styles.dateInputArrow}>
                      (달력아이콘)
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}>
                  <CustomText style={styles.cancelButtonText}>취소</CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}>
                  <CustomText style={styles.confirmButtonText}>확인</CustomText>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* 날짜 선택 화면 */}
          {(pickerMode === 'startDate' || pickerMode === 'endDate') && (
            <>
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  locale="ko-KR"
                  textColor="#000"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleDateCancel}>
                  <CustomText style={styles.cancelButtonText}>취소</CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleDateConfirm}>
                  <CustomText style={styles.confirmButtonText}>확인</CustomText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default DateRangePicker;
