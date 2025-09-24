// components/FridgeSettings/FridgeInfo.tsx
import React from 'react';
import { View, Text } from 'react-native';
import SettingsItem from './SettingsItem';
import { styles } from '../../screens/FridgeSettingsScreen/styles';

interface FridgeInfoProps {
  fridgeName: string;
  userRole: 'owner' | 'member' | null;
  memberCount: number;
}

const FridgeInfo: React.FC<FridgeInfoProps> = ({
  fridgeName,
  userRole,
  memberCount,
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

      <SettingsItem title="냉장고 이름" value={fridgeName} showArrow={false} />

      <SettingsItem
        title="내 역할"
        value={getRoleDisplayName(userRole)}
        showArrow={false}
      />

      <SettingsItem
        title="구성원 수"
        value={`총 ${memberCount}명`}
        showArrow={false}
      />
    </View>
  );
};

export default FridgeInfo;
