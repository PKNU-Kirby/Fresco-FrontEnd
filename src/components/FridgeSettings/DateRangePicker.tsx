// components/UsageHistory/DateRangePicker.tsx - iOS 스타일로 완전히 변경된 버전
import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
  Text,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const formatDisplayDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return formatDate(date);
    }
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
    setPickerMode('range');
  };

  const handleClose = () => {
    setPickerMode('range');
    onClose();
  };

  // 빠른 선택 옵션
  const getQuickOptions = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    return [
      { label: '오늘', start: today, end: today },
      { label: '어제', start: yesterday, end: yesterday },
      { label: '최근 일주일', start: lastWeek, end: today },
      { label: '최근 한달', start: lastMonth, end: today },
    ];
  };

  const handleQuickSelect = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // 설정 아이템 컴포넌트 (모달 내부용)
  const ModalSettingsItem = ({
    title,
    value,
    icon,
    iconColor = '#6B7280',
    onPress,
    isLast = false,
  }: {
    title: string;
    value?: string;
    icon: string;
    iconColor?: string;
    onPress?: () => void;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingsItem, isLast && styles.settingsItemLast]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsItemIcon}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.settingsItemContent}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {value && <Text style={styles.settingsItemValue}>{value}</Text>}
        {onPress && (
          <View style={styles.settingsItemArrow}>
            <Ionicons name="chevron-forward" size={16} color="#C4C4C4" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const QuickSelectItem = ({
    label,
    start,
    end,
    isLast = false,
  }: {
    label: string;
    start: Date;
    end: Date;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingsItem, isLast && styles.settingsItemLast]}
      onPress={() => handleQuickSelect(start, end)}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsItemIcon}>
          <Ionicons name="flash-outline" size={20} color="#60A5FA" />
        </View>
        <View style={styles.settingsItemContent}>
          <Text style={styles.settingsItemTitle}>{label}</Text>
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        <View style={styles.settingsItemArrow}>
          <Ionicons name="chevron-forward" size={16} color="#C4C4C4" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {pickerMode === 'startDate'
                ? '시작일 선택'
                : pickerMode === 'endDate'
                ? '종료일 선택'
                : '기간 선택'}
            </Text>
            <TouchableOpacity
              onPress={
                pickerMode === 'range' ? handleConfirm : handleDateConfirm
              }
            >
              <Text style={styles.confirmButtonText}>
                {pickerMode === 'range' ? '완료' : '확인'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 기간 선택 화면 */}
            {pickerMode === 'range' && (
              <>
                {/* 빠른 선택 */}
                <View style={styles.settingsGroup}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>빠른 선택</Text>
                  </View>

                  {getQuickOptions().map((option, index) => (
                    <QuickSelectItem
                      key={option.label}
                      label={option.label}
                      start={option.start}
                      end={option.end}
                      isLast={index === getQuickOptions().length - 1}
                    />
                  ))}
                </View>

                {/* 사용자 정의 기간 */}
                <View style={styles.settingsGroup}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>사용자 정의</Text>
                  </View>

                  <ModalSettingsItem
                    title="시작일"
                    value={formatDisplayDate(startDate)}
                    icon="calendar-outline"
                    iconColor="#60A5FA"
                    onPress={handleStartDatePress}
                  />

                  <ModalSettingsItem
                    title="종료일"
                    value={formatDisplayDate(endDate)}
                    icon="calendar-outline"
                    iconColor="#60A5FA"
                    onPress={handleEndDatePress}
                    isLast
                  />
                </View>

                {/* 선택된 기간 요약 */}
                <View style={styles.settingsGroup}>
                  <View style={styles.section}>
                    <Text style={styles.sectionDescription}>
                      {formatDisplayDate(startDate)} ~{' '}
                      {formatDisplayDate(endDate)}
                    </Text>
                    <Text style={styles.sectionDescription}>
                      총{' '}
                      {Math.ceil(
                        (endDate.getTime() - startDate.getTime()) /
                          (1000 * 60 * 60 * 24),
                      ) + 1}
                      일 기간
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* 날짜 선택 화면 */}
            {(pickerMode === 'startDate' || pickerMode === 'endDate') && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  locale="ko-KR"
                  textColor="#000"
                  maximumDate={
                    pickerMode === 'startDate' ? endDate : new Date()
                  }
                  minimumDate={pickerMode === 'endDate' ? startDate : undefined}
                />

                {pickerMode === 'startDate' && (
                  <View style={styles.section}>
                    <Text style={styles.sectionDescription}>
                      종료일({formatDisplayDate(endDate)})보다 이전 날짜를
                      선택해주세요
                    </Text>
                  </View>
                )}

                {pickerMode === 'endDate' && (
                  <View style={styles.section}>
                    <Text style={styles.sectionDescription}>
                      시작일({formatDisplayDate(startDate)})보다 이후 날짜를
                      선택해주세요
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default DateRangePicker;
