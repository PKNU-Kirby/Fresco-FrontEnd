import React from 'react';
import { View, Text } from 'react-native';
import SettingsItem from './SettingsItem';
import { styles } from '../../screens/FridgeSettingsScreen/styles';

// API에서 오는 FridgeMember 타입
interface ApiFridgeMember {
  userId: string;
  userName: string;
  role: 'OWNER' | 'MEMBER';
}

// useMembers에서 오는 Member 타입
interface LocalMember {
  id: string;
  name: string;
  role: 'owner' | 'member';
  joinDate: string;
}

// 두 타입을 모두 수용할 수 있는 유니온 타입
type MemberData = ApiFridgeMember | LocalMember;

interface SettingsGroupsProps {
  members: MemberData[]; // 두 타입 모두 수용
  userRole?: 'owner' | 'member' | null;
  fridgeName: string;
  permissions?: {
    additionalProp1: boolean;
    additionalProp2: boolean;
    additionalProp3: boolean;
  };
  // 권한 체크 함수들
  canInviteMembers: boolean;
  canDeleteMembers: boolean;
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

const SettingsGroups: React.FC<SettingsGroupsProps> = ({
  members = [],
  userRole,
  fridgeName,
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
}) => {
  const safeMembers = Array.isArray(members) ? members : [];
  const totalMemberCount = safeMembers.length;

  // userRole을 한국어로 변환하는 함수
  const getRoleDisplayName = (role?: string | null) => {
    if (role === 'owner') return '방장';
    if (role === 'member') return '구성원';
    return '알 수 없음';
  };

  return (
    <View>
      {/* 냉장고 정보 섹션 */}
      <View style={styles.settingsGroup}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>냉장고 정보</Text>
        </View>

        <SettingsItem
          title="냉장고 이름"
          value={fridgeName}
          showArrow={false}
        />
        <SettingsItem
          title="내 역할"
          value={getRoleDisplayName(userRole)}
          showArrow={false}
        />
      </View>

      {/* 구성원 관리 섹션 - 권한이 있는 경우만 표시 */}
      {(canInviteMembers || canDeleteMembers) && (
        <View style={styles.settingsGroup}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>구성원 관리</Text>
          </View>

          {canInviteMembers && (
            <SettingsItem title="구성원 초대" onPress={onMemberInvite} />
          )}

          <SettingsItem
            title="구성원 목록"
            value={`총 ${totalMemberCount}명`}
            onPress={onMembersList}
          />
        </View>
      )}

      {/* 냉장고 활동 섹션 */}
      <View style={styles.settingsGroup}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>냉장고 활동</Text>
        </View>

        {canViewUsageHistory && (
          <SettingsItem title="사용 기록" onPress={onUsageHistory} />
        )}

        <SettingsItem title="알림 설정" onPress={onNotificationSettings} />
      </View>

      {/* 계정 설정 섹션 */}
      <View style={styles.settingsGroup}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>계정</Text>
        </View>

        <SettingsItem title="로그아웃" onPress={onLogout} isDanger={true} />
      </View>

      {/* 냉장고 관리 섹션 - 역할에 따라 다른 옵션 표시 */}
      <View style={styles.settingsGroup}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>냉장고 관리</Text>
        </View>

        {userRole === 'owner' ? (
          // 방장인 경우 - 냉장고 삭제
          canDeleteFridge && (
            <SettingsItem
              title="냉장고 삭제"
              onPress={onFridgeDelete}
              isDanger={true}
              showArrow={false}
            />
          )
        ) : (
          // 구성원인 경우 - 냉장고 나가기
          <SettingsItem
            title="냉장고 나가기"
            onPress={onLeaveFridge}
            isDanger={true}
            showArrow={false}
          />
        )}
      </View>

      {/* 권한 정보 섹션 - 디버깅용 (개발 환경에서만 표시) */}
      {__DEV__ && (
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
            title="멤버 삭제 권한"
            value={canDeleteMembers ? '있음' : '없음'}
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
      )}
    </View>
  );
};

export default SettingsGroups;
