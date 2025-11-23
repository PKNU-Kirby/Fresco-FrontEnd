import React, { useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../components/_common/BackButton';
import InviteMemberModal from '../../components/FridgeSettings/Members/InviteMemberModal';
import SettingsGroups from '../../components/FridgeSettings/SettingsGroups';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { useApiFridgeSettings } from '../../hooks/useApiFridgeSettings';
import { RootStackParamList } from '../../../App';
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

const FridgeSettingsScreen = ({ route }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { fridgeId, fridgeName, userRole } = route.params;
  const [showInviteModal, setShowInviteModal] = useState(false);

  const {
    members,
    isLoading,
    permissions,
    currentUserRole,
    loadMembers,
    // 권한 체크 함수
    canDeleteFridge,
    canInviteMembers,
    canDeleteMembers,
    canViewUsageHistory,
    // 핸들러 함수
    handleLogout,
    handleMembersList,
    handleInviteMember,
    handleFridgeDelete,
    handleUsageHistory,
    handleNotificationSettings,
    modalState,
  } = useApiFridgeSettings(fridgeId, fridgeName, userRole);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleInviteMemberPress = () => {
    if (handleInviteMember()) {
      setShowInviteModal(true);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <BackButton onPress={handleBack} />
          </View>
          <View style={styles.centerSection}>
            <Text style={styles.headerTitle}>냉장고 설정</Text>
          </View>
          <View style={styles.rightSection} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F4858" />
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
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
          <Text style={styles.headerTitle}>냉장고 설정</Text>
        </View>
        <View style={styles.rightSection} />
      </View>
      <ScrollView
        style={styles.settingsContainer}
        showsVerticalScrollIndicator={false}
      >
        <SettingsGroups
          members={members}
          fridgeName={fridgeName}
          permissions={permissions}
          userRole={currentUserRole}
          // 권한 체크 결과 전달
          canDeleteFridge={canDeleteFridge()}
          canInviteMembers={canInviteMembers()}
          canDeleteMembers={canDeleteMembers()}
          canViewUsageHistory={canViewUsageHistory()}
          // 핸들러 함수들 전달
          onLogout={handleLogout}
          onMembersList={handleMembersList}
          onUsageHistory={handleUsageHistory}
          onFridgeDelete={handleFridgeDelete}
          onMemberInvite={handleInviteMemberPress}
          onNotificationSettings={handleNotificationSettings}
        />
      </ScrollView>

      {/* Invite Member Modal */}
      <InviteMemberModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        fridgeId={fridgeId}
        fridgeName={fridgeName}
        onInviteSuccess={loadMembers}
      />

      {/* 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={modalState.errorModalVisible}
        title="오류"
        message={modalState.errorMessage}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => modalState.setErrorModalVisible(false)}
        onCancel={() => modalState.setErrorModalVisible(false)}
      />

      {/* 권한 없음 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={modalState.noPermissionModalVisible}
        title="권한 없음"
        message={modalState.noPermissionMessage}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => modalState.setNoPermissionModalVisible(false)}
        onCancel={() => modalState.setNoPermissionModalVisible(false)}
      />

      {/* 로그아웃 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={modalState.logoutConfirmVisible}
        title="로그아웃"
        message="로그아웃 하시겠습니까?"
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="로그아웃"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={modalState.handleLogoutConfirm}
        onCancel={() => modalState.setLogoutConfirmVisible(false)}
      />

      {/* 냉장고 삭제 1차 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={modalState.deleteConfirmVisible}
        title="냉장고 삭제"
        message={`"${fridgeName}" 냉장고를 삭제하시겠습니까?\n\n⚠️ 삭제된 냉장고의 모든 데이터가 영구적으로 사라지며, 복구가 불가능합니다.\n\n• 저장된 모든 식재료\n• 사용 기록\n• 멤버 정보`}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="삭제"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={modalState.handleDeleteFirstConfirm}
        onCancel={() => modalState.setDeleteConfirmVisible(false)}
      />

      {/* 냉장고 삭제 최종 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={modalState.deleteFinalConfirmVisible}
        title="최종 확인"
        message={`"${fridgeName}" 냉장고를 정말 삭제하시겠습니까?`}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="삭제"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={modalState.handleDeleteFinalConfirm}
        onCancel={() => modalState.setDeleteFinalConfirmVisible(false)}
      />

      {/* 삭제 성공 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={modalState.deleteSuccessVisible}
        title="삭제 완료"
        message={`"${fridgeName}" 냉장고가 성공적으로 삭제되었습니다.`}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={modalState.handleDeleteSuccess}
        onCancel={modalState.handleDeleteSuccess}
      />

      {/* 삭제 실패 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={modalState.deleteErrorVisible}
        title="삭제 실패"
        message="냉장고 삭제 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요."
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => modalState.setDeleteErrorVisible(false)}
        onCancel={() => modalState.setDeleteErrorVisible(false)}
      />
    </SafeAreaView>
  );
};

export default FridgeSettingsScreen;
