import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  Text,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import BackButton from '../../components/_common/BackButton';
import ConfirmModal from '../../components/modals/ConfirmModal';
import UnifiedNotificationService from '../../services/UnifiedNotificationService';
import { NotificationSettings } from '../../services/LocalNotificationService';
import { styles } from './styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    expiryDaysBefore: 3,
    notificationTime: '09:00',
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // ConfirmModal 상태들
  const [saveErrorModalVisible, setSaveErrorModalVisible] = useState(false);
  const [permissionDeniedModalVisible, setPermissionDeniedModalVisible] =
    useState(false);
  const [toggleErrorModalVisible, setToggleErrorModalVisible] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings =
        await UnifiedNotificationService.getNotificationSettings();
      setSettings(savedSettings);
      console.log('✅ 설정 불러오기 완료:', savedSettings);
    } catch (error) {
      console.error('❌ 설정 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async () => {
    const status = await UnifiedNotificationService.checkNotificationStatus();
    setHasPermission(status.hasPermission);
    console.log('📊 알림 상태:', status);
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await UnifiedNotificationService.saveNotificationSettings(newSettings);
      setSettings(newSettings);
      console.log('✅ 설정 저장 완료:', newSettings);
    } catch (error) {
      console.error('❌ 설정 저장 실패:', error);
      setSaveErrorModalVisible(true);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        if (!hasPermission) {
          console.log('=> 알림 권한 요청 중...');
          const granted = await UnifiedNotificationService.requestPermission();

          if (!granted) {
            setPermissionDeniedModalVisible(true);
            return;
          }

          console.log('✅ 알림 권한 허용됨');
          setHasPermission(true);
        }

        // 🔥 FCM 에러 방지
        try {
          console.log('=> FCM 토큰 가져오기 시도...');
          await UnifiedNotificationService.printFCMToken();
        } catch (fcmError: any) {
          console.log(
            '⚠️ FCM 토큰 가져오기 실패 (개발 환경에서는 정상):',
            fcmError.message,
          );
          // iOS 개발 환경에서는 무시하고 계속 진행
        }
      }

      const newSettings = { ...settings, enabled };
      await saveSettings(newSettings);
      console.log('✅ 알림 설정 완료:', newSettings);
    } catch (error) {
      console.error('❌ 알림 토글 처리 실패:', error);
      setToggleErrorModalVisible(true);
      setSettings({ ...settings, enabled: false });
    }
  };

  const handleExpiryDaysChange = (days: number) => {
    console.log('📅 알림 일수 변경:', days);
    const newSettings = { ...settings, expiryDaysBefore: days };
    saveSettings(newSettings);
    setShowDayPicker(false);
  };

  const handleTimeConfirm = (selectedTime: Date) => {
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    console.log('⏰ 알림 시간 변경:', timeString);
    const newSettings = { ...settings, notificationTime: timeString };
    saveSettings(newSettings);
    setShowTimePicker(false);
  };

  const getTimeFromString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // 일수 선택 모달
  const DayPickerModal = () => (
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
                  onPress={() => handleExpiryDaysChange(day)}
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
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <BackButton onPress={() => navigation.goBack()} />
          </View>
          <View style={styles.centerSection}>
            <Text style={styles.headerTitle}>알림 설정</Text>
          </View>
          <View style={styles.rightSection} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.centerSection}>
          <Text style={styles.headerTitle}>알림 설정</Text>
        </View>
        <View style={styles.rightSection} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 알림 상태 카드 */}
        <View style={styles.notificationSection}>
          <View style={styles.notificationCardHeader}>
            <View style={styles.notificationIconContainer}>
              <Ionicons
                name={
                  hasPermission && settings.enabled
                    ? 'notifications'
                    : 'notifications-off'
                }
                size={24}
                color={
                  hasPermission && settings.enabled ? '#2F4858' : '#9CA3AF'
                }
              />
            </View>
            <View style={styles.notificationMainInfo}>
              <Text style={styles.notificationTitle}>푸시 알림</Text>
              <Text style={styles.notificationSubtitle}>
                {hasPermission && settings.enabled
                  ? '알림이 활성화되어 있습니다'
                  : '알림이 비활성화되어 있습니다'}
              </Text>
            </View>
            <Switch
              value={settings.enabled && hasPermission}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#E5E7EB', true: 'limegreen' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>

        {/* 알림 설정 카드 (알림이 활성화된 경우에만 표시) */}
        {settings.enabled && hasPermission && (
          <View style={styles.notificationSection}>
            <Text style={styles.sectionHeaderText}>알림 세부 설정</Text>

            {/* 알림 일수 카드 */}
            <TouchableOpacity
              style={styles.settingCard}
              onPress={() => setShowDayPicker(true)}
            >
              <View style={styles.settingCardContent}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>알림 시점</Text>
                  <Text style={styles.settingSubtitle}>
                    소비기한 {settings.expiryDaysBefore}일 전
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
              </View>
            </TouchableOpacity>

            {/* 알림 시간 카드 */}
            <TouchableOpacity
              style={styles.settingCard}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.settingCardContent}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>알림 시간</Text>
                  <Text style={styles.settingSubtitle}>
                    매일 {settings.notificationTime}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 알림 안내 카드 (알림이 비활성화된 경우) */}
        {(!settings.enabled || !hasPermission) && (
          <View style={styles.notificationSection}>
            <View style={styles.infoContent}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#6B7280"
                />
                <Text style={styles.infoTitle}>알림을 활성화하면</Text>
              </View>

              <Text style={styles.infoDescription}>
                • 소비기한 임박 알림 받기{'\n'}• 맞춤형 알림 시간 설정{'\n'}•
                미리 알림으로 음식물 낭비 방지
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 일수 선택 모달 */}
      <DayPickerModal />

      {/* 시간 선택 모달 */}
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setShowTimePicker(false)}
        date={getTimeFromString(settings.notificationTime)}
        locale="ko-KR"
      />

      {/* 설정 저장 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={saveErrorModalVisible}
        title="오류"
        message="설정 저장 중 문제가 발생했습니다."
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setSaveErrorModalVisible(false)}
        onCancel={() => setSaveErrorModalVisible(false)}
      />

      {/* 알림 권한 거부 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={permissionDeniedModalVisible}
        title="알림 권한 필요"
        message="알림을 받으려면 설정에서 알림 권한을 허용해주세요."
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'notifications-off', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setPermissionDeniedModalVisible(false)}
        onCancel={() => setPermissionDeniedModalVisible(false)}
      />

      {/* 알림 토글 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={toggleErrorModalVisible}
        title="오류"
        message="알림 설정 중 문제가 발생했습니다."
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setToggleErrorModalVisible(false)}
        onCancel={() => setToggleErrorModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;
