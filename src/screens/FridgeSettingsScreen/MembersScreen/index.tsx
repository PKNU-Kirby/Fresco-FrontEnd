import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../../App';
import { useApiMembers } from '../../../hooks/useApiMembers';
import BackButton from '../../../components/_common/BackButton';
import ConfirmModal from '../../../components/modals/ConfirmModal';
import MemberCard from '../../../components/FridgeSettings/Members/MemberCard';
import InviteMemberModal from '../../../components/FridgeSettings/Members/InviteMemberModal';
import { styles } from './styles';

type Props = {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
      userRole?: 'owner' | 'member';
    };
  };
};

const MembersScreen = ({ route }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { fridgeId, fridgeName, userRole } = route.params;
  const [showInviteModal, setShowInviteModal] = useState(false);

  const {
    members,
    isLoading,
    modalState,
    currentUser,
    loadMembers,
    removeMember,
    canRemoveMember,
    handleMemberPress,
  } = useApiMembers(fridgeId, fridgeName);

  const [noPermissionMessage, setNoPermissionMessage] = useState('');
  const [removeErrorModalVisible, setRemoveErrorModalVisible] = useState(false);
  const [noPermissionModalVisible, setNoPermissionModalVisible] =
    useState(false);
  const [removeSuccessModalVisible, setRemoveSuccessModalVisible] =
    useState(false);

  // 권한 계산
  const isOwner = currentUser?.role === 'owner';
  const canManageMembers = currentUser?.canEdit ?? isOwner;
  const canInviteMembers = currentUser?.canEdit ?? isOwner;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMemberInvite = () => {
    if (!canInviteMembers) {
      setNoPermissionMessage('멤버를 초대할 권한이 없습니다.');
      setNoPermissionModalVisible(true);
      return;
    }
    setShowInviteModal(true);
  };

  // 멤버 삭제 핸들러
  const handleMemberRemove = async (memberId: number) => {
    if (!canManageMembers) {
      setNoPermissionMessage('멤버를 삭제할 권한이 없습니다.');
      setNoPermissionModalVisible(true);
      return;
    }

    try {
      await removeMember(memberId);
      setRemoveSuccessModalVisible(true);
    } catch (error) {
      // console.error('멤버 삭제 실패:', error);
      setRemoveErrorModalVisible(true);
    }
  };

  // 방장과 멤버 분리
  const owners = members.filter(member => member.role === 'owner');
  const regularMembers = members.filter(member => member.role === 'member');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <BackButton onPress={handleBack} />
          </View>
          <View style={styles.centerSection}>
            <Text style={styles.headerTitle}>멤버</Text>
          </View>
          <View style={styles.rightSection} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F4858" />
          <Text style={styles.loadingText}>멤버를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <BackButton onPress={handleBack} />
        </View>
        <View style={styles.centerSection}>
          <Text style={styles.headerTitle}>멤버</Text>
        </View>
        <TouchableOpacity
          onPress={handleMemberInvite}
          style={[styles.rightSection, !canInviteMembers && { opacity: 0.5 }]}
          disabled={!canInviteMembers}
        >
          <Ionicons
            name="add-outline"
            size={28}
            color={canInviteMembers ? 'ccc' : '#999'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.settingsContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 냉장고 정보 */}
        <View style={styles.settingsGroup}>
          <View style={styles.fridgeInfoHeader}>
            <Text style={styles.fridgeTitle}>{fridgeName}</Text>
            <Text style={styles.memberCount}>총 {members.length}명</Text>
          </View>
        </View>

        {/* 방장 섹션 */}
        {owners.length > 0 && (
          <View style={styles.settingsGroup}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>방장</Text>
            </View>
            {owners.map(owner => (
              <MemberCard
                key={owner.id}
                member={owner}
                currentUser={currentUser}
                canRemoveMember={canRemoveMember}
                onMemberPress={handleMemberPress}
                onMemberRemove={handleMemberRemove}
              />
            ))}
          </View>
        )}

        {/* 멤버 섹션 */}
        <View style={styles.settingsGroup}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>멤버</Text>
          </View>

          {regularMembers.length > 0 ? (
            regularMembers.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                currentUser={currentUser}
                canRemoveMember={canRemoveMember}
                onMemberPress={handleMemberPress}
                onMemberRemove={handleMemberRemove}
              />
            ))
          ) : (
            <View style={styles.emptyMemberContainer}>
              <Text style={styles.emptyMemberText}>아직 멤버가 없습니다</Text>
            </View>
          )}
        </View>

        {/* 안내사항 */}
        <View style={styles.settingsGroup}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>안내사항</Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="ellipse-sharp" size={6} color={'#666'} />
              <Text style={styles.infoText}>
                방장은 멤버를 내보낼 수 있습니다.
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="ellipse-sharp" size={6} color={'#666'} />
              <Text style={styles.infoText}>
                상단의 + 버튼으로 멤버를 초대해 보세요.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 멤버 초대 모달 */}
      <InviteMemberModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        fridgeId={fridgeId}
        fridgeName={fridgeName}
        onInviteSuccess={loadMembers}
      />

      {/* Modal : useApiMembers */}

      {/* 에러 모달 (useApiMembers) */}
      <ConfirmModal
        isAlert={false}
        visible={modalState.errorModalVisible}
        title="오류"
        message={modalState.errorMessage}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => modalState.setErrorModalVisible(false)}
        onCancel={() => modalState.setErrorModalVisible(false)}
      />

      {/* 멤버 정보 모달 (useApiMembers) */}
      <ConfirmModal
        isAlert={false}
        visible={modalState.memberInfoModalVisible}
        title={modalState.memberInfoTitle}
        message={modalState.memberInfoMessage}
        iconContainer={{ backgroundColor: '#e3f2fd' }}
        icon={{ name: 'person', color: 'rgba(47, 72, 88, 1)', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="general"
        onConfirm={() => modalState.setMemberInfoModalVisible(false)}
        onCancel={() => modalState.setMemberInfoModalVisible(false)}
      />

      {/* Modal : MembersScreen */}

      {/* 권한 없음 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={noPermissionModalVisible}
        title="권한 없음"
        message={noPermissionMessage}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setNoPermissionModalVisible(false)}
        onCancel={() => setNoPermissionModalVisible(false)}
      />

      {/* 멤버 삭제 성공 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={removeSuccessModalVisible}
        title="완료"
        message="멤버가 삭제되었습니다."
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setRemoveSuccessModalVisible(false)}
        onCancel={() => setRemoveSuccessModalVisible(false)}
      />

      {/* 멤버 삭제 실패 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={removeErrorModalVisible}
        title="오류"
        message="멤버 삭제에 실패했습니다."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setRemoveErrorModalVisible(false)}
        onCancel={() => setRemoveErrorModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default MembersScreen;
