import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../../components/_common/BackButton';
import InviteMemberModal from '../../../components/FridgeSettings/InviteMemberModal';
import MemberCard from '../../../components/FridgeSettings/MemberCard';
import { useApiMembers } from '../../../hooks/useApiMembers';
import { RootStackParamList } from '../../../../App';
import { styles } from '../styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
    currentUser,
    loadMembers,
    handleMemberPress,
    removeMember,
    canRemoveMember,
  } = useApiMembers(fridgeId, fridgeName);

  // 권한 계산 : owner (canEdit 기반)
  const isOwner = currentUser?.role === 'owner';
  const canManageMembers = currentUser?.canEdit ?? isOwner;
  const canInviteMembers = currentUser?.canEdit ?? isOwner;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMemberInvite = () => {
    if (!canInviteMembers) {
      Alert.alert('권한 없음', '구성원을 초대할 권한이 없습니다.');
      return;
    }
    setShowInviteModal(true);
  };

  // 구성원 삭제 핸들러
  const handleMemberRemove = async (memberId: number) => {
    if (!canManageMembers) {
      Alert.alert('권한 없음', '구성원을 삭제할 권한이 없습니다.');
      return;
    }

    try {
      await removeMember(memberId);
      Alert.alert('완료', '구성원이 삭제되었습니다.');
    } catch (error) {
      console.error('구성원 삭제 실패:', error);
      Alert.alert('오류', '구성원 삭제에 실패했습니다.');
    }
  };

  // 방장과 구성원 분리
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
            <Text style={styles.headerTitle}>구성원</Text>
          </View>
          <View style={styles.rightSection} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="limegreen" />
          <Text style={styles.loadingText}>구성원을 불러오는 중...</Text>
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
              <Text style={styles.emptyMemberText}>아직 구성원이 없습니다</Text>
            </View>
          )}
        </View>

        {/* 안내사항 */}
        <View style={styles.settingsGroup}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>안내사항</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>(안내사항 추가할 거리 있으면,,)</Text>
          </View>
        </View>
      </ScrollView>

      {/* 구성원 초대 모달 */}
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

export default MembersScreen;
