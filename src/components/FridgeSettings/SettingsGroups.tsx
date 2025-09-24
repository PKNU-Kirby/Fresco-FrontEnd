// components/FridgeSettings/SettingsGroups.tsx
import React from 'react';
import { View } from 'react-native';
import FridgeInfo from './FridgeInfo';
import MemberManagement from './MemberManagement';
import FridgeActivity from './FridgeActivity';
import AccountSettings from './AccountSettings';
import FridgeManagement from './FridgeManagement';
import DebugPermissions from './DebugPermissions';

interface SettingsGroupsProps {
  // 기본 정보
  fridgeName: string;
  userRole: 'owner' | 'member' | null;
  memberCount: number;

  // 권한
  canInviteMembers: boolean;
  canManageMembers: boolean;
  canDeleteFridge: boolean;
  canViewUsageHistory: boolean;

  // 핸들러 함수들
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
    memberCount,
    canInviteMembers,
    canManageMembers,
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

  return (
    <View>
      {/* 냉장고 정보 */}
      <FridgeInfo
        fridgeName={fridgeName}
        userRole={userRole}
        memberCount={memberCount}
      />

      {/* 구성원 관리 */}
      <MemberManagement
        canInviteMembers={canInviteMembers}
        canManageMembers={canManageMembers}
        memberCount={memberCount}
        onMemberInvite={onMemberInvite}
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

      {/* 개발용 권한 정보 */}
      {__DEV__ && (
        <DebugPermissions
          canInviteMembers={canInviteMembers}
          canManageMembers={canManageMembers}
          canDeleteFridge={canDeleteFridge}
          canViewUsageHistory={canViewUsageHistory}
        />
      )}
    </View>
  );
};

export default SettingsGroups;
