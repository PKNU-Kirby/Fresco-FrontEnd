import React from 'react';
import { View, Text } from 'react-native';
import { Member } from '../../hooks/useMembers';
import SettingsItem from './SettingsGroups';
import MemberItem from './MemberItem';
import GroupHeader from './GroupHeader';
import { styles } from '../../screens/FridgeSettingsScreen/styles';

interface MemberGroupsProps {
  members: Member[];
  fridgeName: string;
  onMemberInvite: () => void;
  onMemberPress: (member: Member) => void;
}

const MemberGroups: React.FC<MemberGroupsProps> = ({
  members,
  fridgeName,
  onMemberInvite,
  onMemberPress,
}) => {
  return (
    <>
      {/* 냉장고 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{fridgeName}</Text>
        <Text style={styles.sectionDescription}>
          총 {members.length}명의 멤버가 함께하고 있습니다
        </Text>
      </View>

      {/* 초대하기 그룹 */}
      <View style={styles.settingsGroup}>
        <GroupHeader title="초대" />
        <SettingsItem title="새 멤버 초대" onPress={onMemberInvite} />
      </View>

      {/* 멤버 목록 그룹 */}
      <View style={styles.settingsGroup}>
        <GroupHeader title={`멤버 (${members.length}명)`} />
        {members.length > 0 ? (
          members.map(member => (
            <MemberItem
              key={member.id}
              member={member}
              onPress={() => onMemberPress(member)}
            />
          ))
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionDescription}>
              멤버가 없습니다. 새로운 멤버를 초대해보세요!
            </Text>
          </View>
        )}
      </View>

      {/* 안내사항 그룹 */}
      <View style={styles.settingsGroup}>
        <GroupHeader title="안내사항" />
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>
            • 방장은 다른 멤버를 초대하고 냉장고를 관리할 수 있습니다{'\n'}•
            모든 멤버은 식재료를 추가하고 사용할 수 있습니다{'\n'}• 멤버은
            언제든지 냉장고를 나갈 수 있습니다
          </Text>
        </View>
      </View>
    </>
  );
};

export default MemberGroups;
