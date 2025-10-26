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
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import BackButton from '../../components/_common/BackButton';
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

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings =
        await UnifiedNotificationService.getNotificationSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('설정 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async () => {
    const status = await UnifiedNotificationService.checkNotificationStatus();
    setHasPermission(status.hasPermission);

    // 디버깅용 상세 상태 출력
    console.log('📊 알림 상태:', {
      전체: status.hasPermission,
      FCM: status.fcmStatus,
      로컬: status.localStatus,
    });
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await UnifiedNotificationService.saveNotificationSettings(newSettings);
      setSettings(newSettings);
      console.log('✅ 설정 저장 완료');
    } catch (error) {
      Alert.alert('오류', '설정 저장 중 문제가 발생했습니다.');
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && !hasPermission) {
      const granted = await UnifiedNotificationService.requestPermission();
      if (!granted) {
        Alert.alert(
          '알림 권한 필요',
          '알림을 받으려면 설정에서 알림 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '확인',
              onPress: () => {},
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
    setShowDayPicker(false);
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
    await UnifiedNotificationService.sendTestNotifications();
    Alert.alert(
      '테스트 알림',
      'FCM 토큰이 콘솔에 출력되고,\n로컬 테스트 알림이 전송되었습니다.',
    );
  };

  const testDemoNotifications = async () => {
    await UnifiedNotificationService.createDemoNotifications();
    Alert.alert(
      '데모 알림 생성',
      '가상의 식재료 알림들이 스케줄되었습니다.\n콘솔에서 확인하세요.',
    );
  };

  const viewScheduledNotifications = async () => {
    const notifications =
      await UnifiedNotificationService.getScheduledNotifications();
    Alert.alert(
      '스케줄된 알림',
      notifications.length > 0
        ? `총 ${notifications.length}개의 알림이 예약되어 있습니다.\n콘솔에서 상세 내용을 확인하세요.`
        : '예약된 알림이 없습니다.',
    );
  };

  const getTimeFromString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // 설정 아이템 컴포넌트
  const SettingsItem = ({
    title,
    subtitle,
    value,
    icon,
    iconColor = '#6B7280',
    onPress,
    showArrow = true,
    isLast = false,
    rightComponent,
  }: {
    title: string;
    subtitle?: string;
    value?: string;
    icon: string;
    iconColor?: string;
    onPress?: () => void;
    showArrow?: boolean;
    isLast?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingsItem, isLast && styles.settingsItemLast]}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsItemIcon}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.settingsItemContent}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {value && <Text style={styles.settingsItemValue}>{value}</Text>}
        {rightComponent}
        {showArrow && onPress && (
          <View style={styles.settingsItemArrow}>
            <Ionicons name="chevron-forward" size={16} color="#C4C4C4" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // 그룹 헤더 컴포넌트
  const GroupHeader = ({ title }: { title: string }) => (
    <View style={styles.groupHeader}>
      <Text style={styles.groupTitle}>{title}</Text>
    </View>
  );

  // 일수 선택 모달 컴포넌트
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
              <Text style={styles.closeButtonText}>✕</Text>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>알림 설정</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
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
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.settingsContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 알림 상태 */}
        <View style={styles.settingsGroup}>
          <SettingsItem
            title="푸시 알림"
            subtitle={
              hasPermission && settings.enabled
                ? '알림이 활성화되어 있습니다'
                : '알림이 비활성화되어 있습니다'
            }
            icon={
              hasPermission && settings.enabled
                ? 'notifications'
                : 'notifications-off'
            }
            iconColor={
              hasPermission && settings.enabled ? '#34D399' : '#F87171'
            }
            showArrow={false}
            rightComponent={
              <Switch
                value={settings.enabled && hasPermission}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#E5E7EB', true: '#60A5FA' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            }
            isLast
          />
        </View>

        {/* 알림이 활성화된 경우 세부 설정 */}
        {settings.enabled && hasPermission && (
          <>
            <View style={styles.settingsGroup}>
              <GroupHeader title="알림 설정" />

              <SettingsItem
                title="알림 시점"
                value={`${settings.expiryDaysBefore}일 전`}
                subtitle="소비기한 며칠 전에 알림을 받을지 설정"
                icon="calendar-outline"
                iconColor="#60A5FA"
                onPress={() => setShowDayPicker(true)}
              />

              <SettingsItem
                title="알림 시간"
                value={settings.notificationTime}
                subtitle="매일 알림을 받을 시간"
                icon="time-outline"
                iconColor="#60A5FA"
                onPress={() => setShowTimePicker(true)}
                isLast
              />
            </View>
          </>
        )}

        {/* 알림이 비활성화된 경우 안내 */}
        {(!settings.enabled || !hasPermission) && (
          <View style={styles.settingsGroup}>
            <GroupHeader title="알림 정보" />
            <View style={styles.section}>
              <Text style={styles.sectionDescription}>
                알림을 활성화하면 다음과 같은 기능을 사용할 수 있습니다:
              </Text>
              <Text style={styles.sectionDescription}>
                • 소비기한 임박 알림 받기{'\n'}• 맞춤형 알림 시간 설정{'\n'}•
                미리 알림으로 음식물 낭비 방지
              </Text>
            </View>
          </View>
        )}

        {/* 개발자 도구 */}
        <View style={styles.settingsGroup}>
          <GroupHeader title="개발자 도구" />

          <SettingsItem
            title="테스트 알림"
            subtitle="FCM 토큰 확인 및 로컬 알림 테스트"
            icon="bug-outline"
            iconColor="#8B5CF6"
            onPress={testNotification}
            showArrow={false}
          />

          <SettingsItem
            title="데모 알림 생성"
            subtitle="가상 식재료 알림 스케줄 테스트"
            icon="flask-outline"
            iconColor="#F59E0B"
            onPress={testDemoNotifications}
            showArrow={false}
          />

          <SettingsItem
            title="예약된 알림 보기"
            subtitle="스케줄된 알림 목록 확인"
            icon="list-outline"
            iconColor="#10B981"
            onPress={viewScheduledNotifications}
            showArrow={false}
            isLast
          />
        </View>
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
        is24Hour={false}
        locale="ko-KR"
      />
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;
