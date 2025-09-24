// components/FridgeSettings/DebugPermissions.tsx
import React from 'react';
import { View, Text } from 'react-native';
import SettingsItem from './SettingsItem';
import { styles } from '../../screens/FridgeSettingsScreen/styles';

interface DebugPermissionsProps {
  canInviteMembers: boolean;
  canManageMembers: boolean;
  canDeleteFridge: boolean;
  canViewUsageHistory: boolean;
}

const DebugPermissions: React.FC<DebugPermissionsProps> = ({
  canInviteMembers,
  canManageMembers,
  canDeleteFridge,
  canViewUsageHistory,
}) => {
  return (
    <View style={styles.settingsGroup}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>권한 정보 (개발용)</Text>
      </View>

      <SettingsItem
        title="멤버 초대 권한"
        value={canInviteMembers ? '있음' : '없음'}
        showArrow={false}
      />

      <SettingsItem
        title="멤버 관리 권한"
        value={canManageMembers ? '있음' : '없음'}
        showArrow={false}
      />

      <SettingsItem
        title="냉장고 삭제 권한"
        value={canDeleteFridge ? '있음' : '없음'}
        showArrow={false}
      />

      <SettingsItem
        title="사용 기록 조회 권한"
        value={canViewUsageHistory ? '있음' : '없음'}
        showArrow={false}
      />
    </View>
  );
};

export default DebugPermissions;
