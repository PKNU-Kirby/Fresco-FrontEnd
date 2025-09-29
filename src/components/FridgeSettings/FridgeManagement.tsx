import React from 'react';
import { View, Text } from 'react-native';
import SettingsItem from './SettingsItem';
import { styles } from './styles';

interface FridgeManagementProps {
  userRole: 'owner' | 'member' | null;
  canDeleteFridge: boolean;
  onFridgeDelete: () => void;
  onLeaveFridge: () => void;
}

const FridgeManagement: React.FC<FridgeManagementProps> = ({
  userRole,
  canDeleteFridge,
  onFridgeDelete,
  onLeaveFridge,
}) => {
  return (
    <View style={styles.settingsGroup}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>냉장고 관리</Text>
      </View>

      {userRole === 'owner' ? (
        // 방장 - 냉장고 삭제
        canDeleteFridge && (
          <SettingsItem
            title="냉장고 삭제"
            onPress={onFridgeDelete}
            isDanger={true}
            showArrow={false}
          />
        )
      ) : (
        // 구성원 - 냉장고 나가기
        <SettingsItem
          title="냉장고 나가기"
          onPress={onLeaveFridge}
          isDanger={true}
          showArrow={false}
        />
      )}
    </View>
  );
};

export default FridgeManagement;
