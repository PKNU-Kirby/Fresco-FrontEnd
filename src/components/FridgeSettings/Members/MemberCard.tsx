import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Member } from '../../../hooks/useApiMembers';
import ConfirmModal from '../../modals/ConfirmModal';
import { memberCardStyles as styles } from './styles';

interface MemberCardProps {
  member: Member;
  currentUser?: any;
  onMemberPress?: (member: Member) => void;
  onMemberRemove?: (memberId: number) => void;
  canRemoveMember: (member: Member) => boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onMemberPress,
  onMemberRemove,
  canRemoveMember,
}) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  // 날짜 포맷팅 함수
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 역할 표시 텍스트
  const getRoleText = (role: 'OWNER' | 'MEMBER' | 'owner' | 'member') => {
    return role === 'OWNER' || role === 'owner' ? '방장' : '멤버';
  };

  // 역할에 따른 아이콘 렌더링
  const renderRoleIcon = (role: 'OWNER' | 'MEMBER' | 'owner' | 'member') => {
    const isOwner = role === 'OWNER' || role === 'owner';

    if (isOwner) {
      return <FontAwesome5 name="crown" size={22} color="#2F4858" />;
    } else {
      return <Ionicons name="person" size={22} color="#2F4858" />;
    }
  };

  // 삭제 권한 확인
  const canRemove = canRemoveMember(member);

  // 멤버 삭제 핸들러
  const handleRemoveMember = () => {
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = () => {
    setShowRemoveModal(false);
    onMemberRemove?.(member.id);
  };

  const handleCancelRemove = () => {
    setShowRemoveModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => onMemberPress?.(member)}
        activeOpacity={0.7}
      >
        <View style={styles.memberCardContent}>
          {/* 왼쪽: 아이콘 + 정보 */}
          <View style={styles.memberLeft}>
            {/* 멤버 아이콘 */}
            <View style={styles.memberIconContainer}>
              {renderRoleIcon(member.role)}
            </View>

            {/* 멤버 정보 */}
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName}>{member.name}</Text>
                {/* 
                <View style={styles.roleContainer}>
                  <Text style={styles.roleText}>
                    {getRoleText(member.role)}
                  </Text>
                </View>
                 */}
              </View>
              <Text style={styles.joinDate}>
                {formatJoinDate(member.joinDate)} 참여
              </Text>
            </View>
          </View>

          {/* 오른쪽: 삭제 버튼 (방장만 표시) */}
          <View style={styles.memberRight}>
            {canRemove && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveMember}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* 멤버 삭제 확인 모달 */}
      <ConfirmModal
        visible={showRemoveModal}
        title="멤버 삭제"
        message={
          <Text style={styles.modalMessage}>
            <Text style={styles.modalMemberName}>{member.name}</Text>님을
            냉장고에서 내보내시겠습니까?
          </Text>
        }
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'person-remove-outline', color: 'tomato', size: 48 }}
        confirmText="삭제"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </>
  );
};

export default MemberCard;
