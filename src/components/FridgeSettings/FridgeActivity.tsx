import React from 'react';
import { View, Text } from 'react-native';
import SettingsItem from './SettingsItem';
import { styles } from './styles';

interface FridgeActivityProps {
  canViewUsageHistory: boolean;
  onUsageHistory: () => void;
  onNotificationSettings: () => void;
}

const FridgeActivity: React.FC<FridgeActivityProps> = ({
  canViewUsageHistory,
  onUsageHistory,
  onNotificationSettings,
}) => {
  return (
    <View style={styles.settingsGroup}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>냉장고 활동</Text>
      </View>

      {canViewUsageHistory && (
        <SettingsItem title="식재료 사용 기록" onPress={onUsageHistory} />
      )}

      <SettingsItem title="알림 설정" onPress={onNotificationSettings} />
    </View>
  );
};

export default FridgeActivity;
