import React, { useState, useEffect } from 'react';
import {
  View,
  Switch,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
//
import BackButton from '../../../components/_common/BackButton';
import { NotificationSettings } from '../../../services/LocalNotificationService';
import UnifiedNotificationService from '../../../services/UnifiedNotificationService';
import NotificationSettingsModals from '../../../components/modals/NotificationSettingsModals';
//
import { styles } from './styles';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    expiryDaysBefore: 3,
    notificationTime: '09:00',
  });

  // ConfirmModal States
  const [saveErrorModalVisible, setSaveErrorModalVisible] = useState(false);
  const [toggleErrorModalVisible, setToggleErrorModalVisible] = useState(false);
  const [permissionDeniedModalVisible, setPermissionDeniedModalVisible] =
    useState(false);

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings =
        await UnifiedNotificationService.getNotificationSettings();
      setSettings(savedSettings);
      // console.log('설정 불러오기 성공 :', savedSettings);
    } catch (error) {
      // console.error('=====설정 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async () => {
    const status = await UnifiedNotificationService.checkNotificationStatus();
    setHasPermission(status.hasPermission);
    // console.log('알림 상태 :', status);
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await UnifiedNotificationService.saveNotificationSettings(newSettings);
      setSettings(newSettings);
      // console.log('설정 저장 완료 :', newSettings);
    } catch (error) {
      // console.error('=====설정 저장 실패 :', error);
      setSaveErrorModalVisible(true);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        if (!hasPermission) {
          const granted = await UnifiedNotificationService.requestPermission();

          if (!granted) {
            setPermissionDeniedModalVisible(true);
            return;
          }

          // console.log('알림 권한 허용됨');
          setHasPermission(true);
        }

        // FCM 에러 방지
        try {
          await UnifiedNotificationService.printFCMToken();
        } catch (fcmError: any) {
          /*
          console.log(
            'FCM 토큰 가져오기 실패 :',
            fcmError.message,
          );
          */
          // iOS 에서는 무시
        }
      }

      const newSettings = { ...settings, enabled };
      await saveSettings(newSettings);
      // console.log('알림 설정 완료 :', newSettings);
    } catch (error) {
      // console.error('=====알림 토글 처리 실패:', error);
      setToggleErrorModalVisible(true);
      setSettings({ ...settings, enabled: false });
    }
  };

  const handleExpiryDaysChange = (days: number) => {
    // console.log('알림 일수 변경 :', days);
    const newSettings = { ...settings, expiryDaysBefore: days };
    saveSettings(newSettings);
    setShowDayPicker(false);
  };

  const handleTimeConfirm = (selectedTime: Date) => {
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    // console.log('알림 시간 변경 :', timeString);
    const newSettings = { ...settings, notificationTime: timeString };
    saveSettings(newSettings);
    setShowTimePicker(false);
  };

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
          <ActivityIndicator size="large" color="#2F4858" />
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

        {/* 알림 안내 카드 (알림이 비활성화된 경우) */}
        {(!settings.enabled || !hasPermission) && (
          <View style={styles.notificationSection}>
            <View style={styles.infoContent}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#444"
                />
                <Text style={styles.infoTitle}>알림 안내</Text>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <Ionicons name="ellipse-sharp" size={6} color={'#666'} />
                  <Text style={styles.infoText}>
                    소비기한이 임박한 식재료 사용 알림
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="ellipse-sharp" size={6} color={'#666'} />
                  <Text style={styles.infoText}>
                    알림 기능으로 식재료를 효율적인 관리
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal Components */}
      <NotificationSettingsModals
        settings={settings}
        showDayPicker={showDayPicker}
        showTimePicker={showTimePicker}
        onTimeConfirm={handleTimeConfirm}
        setShowDayPicker={setShowDayPicker}
        setShowTimePicker={setShowTimePicker}
        onExpiryDaysChange={handleExpiryDaysChange}
        notificationTime={settings.notificationTime}
        saveErrorModalVisible={saveErrorModalVisible}
        toggleErrorModalVisible={toggleErrorModalVisible}
        setSaveErrorModalVisible={setSaveErrorModalVisible}
        setToggleErrorModalVisible={setToggleErrorModalVisible}
        permissionDeniedModalVisible={permissionDeniedModalVisible}
        setPermissionDeniedModalVisible={setPermissionDeniedModalVisible}
        styles={styles}
      />
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;
