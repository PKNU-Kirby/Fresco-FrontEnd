// components/FridgeSettings/AccountSettings.tsx
import React from 'react';
import { View, Text } from 'react-native';
import SettingsItem from './SettingsItem';
import { styles } from '../../screens/FridgeSettingsScreen/styles';

interface AccountSettingsProps {
  onLogout: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onLogout }) => {
  return (
    <View style={styles.settingsGroup}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>계정</Text>
      </View>

      <SettingsItem title="로그아웃" onPress={onLogout} isDanger={true} />
    </View>
  );
};

export default AccountSettings;
