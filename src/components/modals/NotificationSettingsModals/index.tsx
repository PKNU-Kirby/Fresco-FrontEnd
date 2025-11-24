import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
//
import ConfirmModal from '../ConfirmModal';
import { NotificationSettings } from '../../../services/LocalNotificationService';

interface NotificationSettingsModalsProps {
  // DayPicker 관련
  showDayPicker: boolean;
  setShowDayPicker: (show: boolean) => void;
  settings: NotificationSettings;
  onExpiryDaysChange: (days: number) => void;

  // TimePicker 관련
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
  notificationTime: string;
  onTimeConfirm: (date: Date) => void;

  // Error Modals
  saveErrorModalVisible: boolean;
  setSaveErrorModalVisible: (visible: boolean) => void;
  toggleErrorModalVisible: boolean;
  setToggleErrorModalVisible: (visible: boolean) => void;
  permissionDeniedModalVisible: boolean;
  setPermissionDeniedModalVisible: (visible: boolean) => void;

  // Styles
  styles: any;
}

const NotificationSettingsModals: React.FC<NotificationSettingsModalsProps> = ({
  showDayPicker,
  setShowDayPicker,
  settings,
  onExpiryDaysChange,
  showTimePicker,
  setShowTimePicker,
  notificationTime,
  onTimeConfirm,
  saveErrorModalVisible,
  setSaveErrorModalVisible,
  toggleErrorModalVisible,
  setToggleErrorModalVisible,
  permissionDeniedModalVisible,
  setPermissionDeniedModalVisible,
  styles,
}) => {
  const getTimeFromString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  return (
    <>
      {/* 일수 선택 모달 */}
      <Modal
        visible={showDayPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDayPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>알림 시점 선택</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDayPicker(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20 }}>
              <Text style={styles.sectionDescription}>
                소비기한 며칠 전에 알림을 받을지 선택하세요
              </Text>

              <View style={styles.dayOptionsContainer}>
                {[1, 2, 3, 5, 7].map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayOption,
                      settings.expiryDaysBefore === day &&
                        styles.dayOptionSelected,
                    ]}
                    onPress={() => onExpiryDaysChange(day)}
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        settings.expiryDaysBefore === day &&
                          styles.dayOptionTextSelected,
                      ]}
                    >
                      {day}일 전
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 시간 선택 모달 */}
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={onTimeConfirm}
        onCancel={() => setShowTimePicker(false)}
        date={getTimeFromString(notificationTime)}
        locale="ko-KR"
      />

      {/* 설정 저장 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={saveErrorModalVisible}
        title="오류"
        message="설정 저장 중 문제가 발생했습니다."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setSaveErrorModalVisible(false)}
        onCancel={() => setSaveErrorModalVisible(false)}
      />

      {/* 알림 권한 거부 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={permissionDeniedModalVisible}
        title="알림 권한 필요"
        message="알림을 받으려면 설정에서 알림 권한을 허용해주세요."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'notifications-off', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setPermissionDeniedModalVisible(false)}
        onCancel={() => setPermissionDeniedModalVisible(false)}
      />

      {/* 알림 토글 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={toggleErrorModalVisible}
        title="오류"
        message="알림 설정 중 문제가 발생했습니다."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setToggleErrorModalVisible(false)}
        onCancel={() => setToggleErrorModalVisible(false)}
      />
    </>
  );
};

export default NotificationSettingsModals;
