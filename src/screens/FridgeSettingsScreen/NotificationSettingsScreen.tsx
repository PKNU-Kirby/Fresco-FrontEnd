// screens/settings/NotificationSettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import BackButton from '../../components/_common/BackButton';
import NotificationService, {
  NotificationSettings,
} from '../../services/NotificationService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    expiryDaysBefore: 3,
    notificationTime: '09:00',
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await NotificationService.getNotificationSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('설정 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async () => {
    const status = await NotificationService.checkNotificationStatus();
    setHasPermission(status.hasPermission);
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await NotificationService.saveNotificationSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      Alert.alert('오류', '설정 저장 중 문제가 발생했습니다.');
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && !hasPermission) {
      // 권한 요청
      const granted = await NotificationService.requestPermission();
      if (!granted) {
        Alert.alert(
          '알림 권한 필요',
          '알림을 받으려면 설정에서 알림 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: () => {
                // 설정 앱으로 이동하는 로직 추가 가능
              },
            },
          ],
        );
        return;
      }
      setHasPermission(true);
    }

    const newSettings = { ...settings, enabled };
    await saveSettings(newSettings);
  };

  const handleExpiryDaysChange = (days: number) => {
    const newSettings = { ...settings, expiryDaysBefore: days };
    saveSettings(newSettings);
  };

  const handleTimeConfirm = (selectedTime: Date) => {
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    const newSettings = { ...settings, notificationTime: timeString };
    saveSettings(newSettings);
    setShowTimePicker(false);
  };

  const testNotification = async () => {
    await NotificationService.printTokenForTesting();
  };

  const getTimeFromString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>설정을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>알림 설정</Text>
        <TouchableOpacity onPress={testNotification} style={styles.testButton}>
          <MaterialIcons name="send" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 알림 상태 표시 */}
        <View style={styles.statusSection}>
          <View style={styles.statusIndicator}>
            <Ionicons
              name={
                hasPermission && settings.enabled
                  ? 'notifications'
                  : 'notifications-off'
              }
              size={24}
              color={hasPermission && settings.enabled ? '#4CAF50' : '#FF5722'}
            />
            <Text style={styles.statusText}>
              {hasPermission && settings.enabled
                ? '알림이 활성화되었습니다'
                : '알림이 비활성화되었습니다'}
            </Text>
          </View>
        </View>

        {/* 알림 활성화/비활성화 */}
        <View style={styles.settingSection}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>푸시 알림</Text>
              <Text style={styles.settingDescription}>
                소비기한 임박 알림을 받습니다
              </Text>
            </View>
            <Switch
              value={settings.enabled && hasPermission}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor={settings.enabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* 알림이 활성화된 경우에만 세부 설정 표시 */}
        {settings.enabled && hasPermission && (
          <>
            {/* 소비기한 알림 일수 설정 */}
            <View style={styles.settingSection}>
              <Text style={styles.sectionTitle}>알림 시점</Text>
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

            {/* 알림 시간 설정 */}
            <View style={styles.settingSection}>
              <Text style={styles.sectionTitle}>알림 시간</Text>
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setShowTimePicker(true)}
              >
                <View style={styles.timeSelectorContent}>
                  <Ionicons name="time-outline" size={24} color="#666" />
                  <Text style={styles.timeText}>
                    {settings.notificationTime}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 테스트 섹션 */}
        <View style={styles.settingSection}>
          <Text style={styles.sectionTitle}>테스트</Text>
          <TouchableOpacity
            style={styles.testNotificationButton}
            onPress={testNotification}
          >
            <MaterialIcons name="send" size={20} color="#007AFF" />
            <Text style={styles.testButtonText}>테스트 알림 토큰 확인</Text>
          </TouchableOpacity>
          <Text style={styles.testDescription}>
            Firebase 콘솔에서 테스트 메시지를 보낼 수 있는 토큰을 확인합니다
          </Text>
        </View>
      </ScrollView>

      {/* 시간 선택 모달 */}
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setShowTimePicker(false)}
        date={getTimeFromString(settings.notificationTime)}
        is24Hour={false}
      />
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#212529',
  },
  testButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#495057',
  },
  settingSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#212529',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#212529',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 16,
  },
  dayOptionsContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  dayOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    backgroundColor: '#FFFFFF',
  },
  dayOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayOptionText: {
    fontSize: 14,
    color: '#495057',
  },
  dayOptionTextSelected: {
    color: '#FFFFFF',
  },
  timeSelector: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  timeSelectorContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  timeText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
    marginLeft: 12,
  },
  testNotificationButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 8,
  },
  testButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500' as const,
  },
  testDescription: {
    fontSize: 12,
    color: '#6C757D',
    lineHeight: 16,
  },
};

export default NotificationSettingsScreen;
