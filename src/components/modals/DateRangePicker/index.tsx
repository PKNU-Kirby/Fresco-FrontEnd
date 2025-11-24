import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Platform, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ConfirmModal from '../../../components/modals/ConfirmModal';
import { styles } from './styles';

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

  // ConfirmModal 상태
  const [errorModalVisible, setErrorModalVisible] = useState(false);

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
      setErrorModalVisible(true);
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
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              pickerMode !== 'range' && { height: '38.8%' }, // 날짜 선택 모드일 때 높이 증가
            ]}
          >
            {/* 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {pickerMode === 'startDate'
                  ? '시작일 선택'
                  : pickerMode === 'endDate'
                  ? '종료일 선택'
                  : '기간 선택하기'}
              </Text>
            </View>

            {/* 기간 선택 화면 */}
            {pickerMode === 'range' && (
              <>
                <View style={styles.dateContainer}>
                  <View style={styles.dateSection}>
                    <Text style={styles.dateLabel}>시작일</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={handleStartDatePress}
                    >
                      <Text style={styles.dateInputText}>
                        {formatDate(startDate)}
                      </Text>
                      <Text style={styles.dateInputArrow}>
                        <Icon
                          name={'calendar-month'}
                          size={24}
                          color={'#444'}
                        />
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateSection}>
                    <Text style={styles.dateLabel}>종료일</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={handleEndDatePress}
                    >
                      <Text style={styles.dateInputText}>
                        {formatDate(endDate)}
                      </Text>
                      <Text style={styles.dateInputArrow}>
                        <Icon
                          name={'calendar-month'}
                          size={24}
                          color={'#444'}
                        />
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>확인</Text>
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
                    onPress={handleDateCancel}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleDateConfirm}
                  >
                    <Text style={styles.confirmButtonText}>확인</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={errorModalVisible}
        title="오류"
        message="시작일은 종료일보다 빨라야 합니다."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
      />
    </>
  );
};

export default DateRangePicker;
