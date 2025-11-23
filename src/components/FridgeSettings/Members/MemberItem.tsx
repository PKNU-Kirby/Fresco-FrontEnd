import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Member } from '../../../hooks/useMembers';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { memberItemStyles as styles } from './styles';

interface MemberItemProps {
  member: Member;
  onPress: () => void;
}

const MemberItem: React.FC<MemberItemProps> = ({ member, onPress }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    <View style={styles.settingsItemLeft}>
      <View style={styles.settingsItemContent}>
        <View style={styles.settingsItemTitleContainer}>
          <Text style={styles.settingsItemTitle}>{member.name}</Text>
          {/* owner 역할 체크 (소문자) */}
          {member.role === 'owner' && (
            <View style={styles.ownerBadge}>
              <FontAwesome5 name="crown" size={10} color="#2F4858" />
              <Text style={styles.ownerBadgeText}>방장</Text>
            </View>
          )}
        </View>
        <Text style={styles.sectionDescription}>가입일: {member.joinDate}</Text>
      </View>
    </View>
    <View style={styles.settingsItemRight}>
      <View style={styles.settingsItemArrow}>
        <Ionicons name="chevron-forward" size={16} color="#C4C4C4" />
      </View>
    </View>
  </TouchableOpacity>
);

export default MemberItem;
