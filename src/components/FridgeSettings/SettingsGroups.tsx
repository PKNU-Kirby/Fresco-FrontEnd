import React from 'react';
import { View } from 'react-native';
import FridgeInfo from './FridgeInfo';
import FridgeActivity from './FridgeActivity';
import AccountSettings from './AccountSettings';
import FridgeManagement from './FridgeManagement';

interface SettingsGroupsProps {
  fridgeName: string;
  userRole: 'owner' | 'member';
  members: any[];
  permissions: any;

  // 권한
  canInviteMembers: boolean;
  canDeleteMembers: boolean;
  canDeleteFridge: boolean;
  canViewUsageHistory: boolean;

  // 핸들러 함수
  onMemberInvite: () => void;
  onMembersList: () => void;
  onUsageHistory: () => void;
  onNotificationSettings: () => void;
  onLogout: () => void;
  onFridgeDelete: () => void;
  onLeaveFridge: () => void;
}

const SettingsGroups: React.FC<SettingsGroupsProps> = props => {
  const {
    fridgeName,
    userRole,
    members,
    permissions,
    canInviteMembers,
    canDeleteMembers,
    canDeleteFridge,
    canViewUsageHistory,
    onMemberInvite,
    onMembersList,
    onUsageHistory,
    onNotificationSettings,
    onLogout,
    onFridgeDelete,
    onLeaveFridge,
  } = props;

  const memberCount = members?.length || 0;

  return (
    <View>
      {/* 냉장고 정보 */}
      <FridgeInfo
        fridgeName={fridgeName}
        userRole={userRole}
        memberCount={memberCount}
        onMembersList={onMembersList}
      />

      {/* 냉장고 활동 */}
      <FridgeActivity
        canViewUsageHistory={canViewUsageHistory}
        onUsageHistory={onUsageHistory}
        onNotificationSettings={onNotificationSettings}
      />

      {/* 계정 설정 */}
      <AccountSettings onLogout={onLogout} />

      {/* 냉장고 관리 */}
      <FridgeManagement
        userRole={userRole}
        canDeleteFridge={canDeleteFridge}
        onFridgeDelete={onFridgeDelete}
        onLeaveFridge={onLeaveFridge}
      />
    </View>
  );
};

export default SettingsGroups;
