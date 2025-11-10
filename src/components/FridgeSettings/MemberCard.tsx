// components/FridgeSettings/MemberCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Member } from '../../hooks/useApiMembers';
import ConfirmModal from '../modals/ConfirmModal';

interface MemberCardProps {
  member: Member;
  currentUser: any;
  canRemoveMember: (member: Member) => boolean;
  onMemberRemove?: (memberId: string) => void;
  onMemberPress?: (member: Member) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  currentUser,
  canRemoveMember,
  onMemberRemove,
  onMemberPress,
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

  // 역할 아이콘
  const getRoleIcon = (role: 'OWNER' | 'MEMBER' | 'owner' | 'member') => {
    return role === 'OWNER' || role === 'owner' ? 'crown' : 'person';
  };

  // 역할 아이콘 색상
  const getRoleIconColor = (role: 'OWNER' | 'MEMBER' | 'owner' | 'member') => {
    return role === 'OWNER' || role === 'owner' ? '#FFD700' : '#6B7280';
  };

  // 삭제 권한 확인
  const canRemove = canRemoveMember(member);

  // 구성원 삭제 핸들러
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
              <Ionicons
                name={getRoleIcon(member.role)}
                size={24}
                color={getRoleIconColor(member.role)}
              />
            </View>

            {/* 멤버 정보 */}
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.roleContainer}>
                  <Text style={styles.roleText}>
                    {getRoleText(member.role)}
                  </Text>
                </View>
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
        iconContainer={{ backgroundColor: '#fee2e2' }}
        icon={{ name: 'person-remove-outline', color: '#EF4444', size: 48 }}
        confirmText="삭제"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </>
  );
};

const styles = StyleSheet.create({
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  roleContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366F1',
  },
  joinDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  memberRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    padding: 4,
  },
  // 모달 메시지 스타일
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  modalMemberName: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '700',
  },
});

export default MemberCard;
