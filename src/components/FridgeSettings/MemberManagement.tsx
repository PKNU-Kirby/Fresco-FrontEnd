// components/FridgeSettings/MemberManagement.tsx
import React from 'react';
import { View, Text } from 'react-native';
import SettingsItem from './SettingsItem';
import { styles } from '../../screens/FridgeSettingsScreen/styles';

interface MemberManagementProps {
  canInviteMembers: boolean;
  canManageMembers: boolean;
  memberCount: number;
  onMemberInvite: () => void;
  onMembersList: () => void;
}

const MemberManagement: React.FC<MemberManagementProps> = ({
  canInviteMembers,
  canManageMembers,
  memberCount,
  onMemberInvite,
  onMembersList,
}) => {
  // 권한이 없으면 섹션 자체를 숨김
  if (!canInviteMembers && !canManageMembers) {
    return null;
  }

  return (
    <View style={styles.settingsGroup}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>구성원 관리</Text>
      </View>

      {canInviteMembers && (
        <SettingsItem title="구성원 초대" onPress={onMemberInvite} />
      )}

      <SettingsItem
        title="구성원 목록"
        value={`총 ${memberCount}명`}
        onPress={onMembersList}
      />
    </View>
  );
};

export default MemberManagement;
