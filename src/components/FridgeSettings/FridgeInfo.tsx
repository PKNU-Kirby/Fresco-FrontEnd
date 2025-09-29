import React from 'react';
import { View, Text } from 'react-native';
import SettingsItem from './SettingsItem';
import { styles } from './styles';

interface FridgeInfoProps {
  fridgeName: string;
  userRole: 'owner' | 'member';
  memberCount: number;
  onMembersList?: () => void;
}

const FridgeInfo: React.FC<FridgeInfoProps> = ({
  fridgeName,
  userRole,
  memberCount,
  onMembersList,
}) => {
  const getRoleDisplayName = (role: 'owner' | 'member' | null) => {
    if (role === 'owner') return '방장';
    if (role === 'member') return '구성원';
    return '알 수 없음';
  };

  return (
    <View style={styles.settingsGroup}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>냉장고 정보</Text>
      </View>

      <SettingsItem title="그룹 이름" value={fridgeName} showArrow={false} />

      <SettingsItem
        title="내 역할"
        value={getRoleDisplayName(userRole)}
        showArrow={false}
      />

      {/* 구성원 항목 - 클릭하면 구성원 리스트 페이지로 이동 */}
      <SettingsItem
        title="구성원"
        value={`총 ${memberCount}명`}
        onPress={onMembersList}
        showArrow={true}
      />
    </View>
  );
};

export default FridgeInfo;
