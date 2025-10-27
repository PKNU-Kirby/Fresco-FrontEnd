import React, { useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../components/_common/BackButton';
import InviteMemberModal from '../../components/FridgeSettings/InviteMemberModal';
import SettingsGroups from '../../components/FridgeSettings/SettingsGroups';
import { useApiFridgeSettings } from '../../hooks/useApiFridgeSettings';
import { RootStackParamList } from '../../../App';
import { styles } from './styles';

type Props = {
  route: {
    params: {
      fridgeId: string;
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
    permissions,
    currentUserRole,
    isLoading,
    loadMembers,
    // 권한 체크 함수
    canInviteMembers,
    canDeleteMembers,
    canDeleteFridge,
    canViewUsageHistory,
    // 핸들러 함수
    handleUsageHistory,
    handleNotificationSettings,
    handleMembersList,
    handleInviteMember,
    handleLogout,
    handleFridgeDelete,
    handleLeaveFridge,
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
          <BackButton onPress={handleBack} />
          <Text style={styles.headerTitle}>냉장고 설정</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="limegreen" />
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={styles.headerTitle}>냉장고 설정</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView
        style={styles.settingsContainer}
        showsVerticalScrollIndicator={false}
      >
        <SettingsGroups
          members={members} // useApiFridgeSettings 에서 받아온 members
          userRole={currentUserRole}
          fridgeName={fridgeName}
          permissions={permissions}
          // 권한 체크 결과 전달
          canInviteMembers={canInviteMembers()}
          canDeleteMembers={canDeleteMembers()}
          canDeleteFridge={canDeleteFridge()}
          canViewUsageHistory={canViewUsageHistory()}
          // 핸들러 함수들 전달
          onMemberInvite={handleInviteMemberPress}
          onMembersList={handleMembersList}
          onUsageHistory={handleUsageHistory}
          onNotificationSettings={handleNotificationSettings}
          onLogout={handleLogout}
          onFridgeDelete={handleFridgeDelete}
          onLeaveFridge={handleLeaveFridge}
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
    </SafeAreaView>
  );
};

export default FridgeSettingsScreen;
