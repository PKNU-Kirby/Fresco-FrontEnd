import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
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
      fridgeId: string;
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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMemberInvite = () => {
    setShowInviteModal(true);
  };

  // 구성원 삭제 핸들러
  const handleMemberRemove = async (memberId: string) => {
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={handleBack} />
          <Text style={styles.headerTitle}>구성원</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="limegreen" />
          <Text style={styles.loadingText}>구성원을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={styles.headerTitle}>구성원</Text>
        <TouchableOpacity
          onPress={handleMemberInvite}
          style={styles.headerRight}
        >
          <Ionicons name="add" size={24} color="limegreen" />
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

        {/* 구성원 섹션 */}
        <View style={styles.settingsGroup}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>
              구성원{' '}
              {regularMembers.length > 0 && `(${regularMembers.length}명)`}
            </Text>
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

        {/* 초대하기 버튼 */}
        <View style={styles.inviteButtonContainer}>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={handleMemberInvite}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add" size={20} color="#6366F1" />
            <Text style={styles.inviteButtonText}>구성원 초대하기</Text>
          </TouchableOpacity>
        </View>

        {/* 안내사항 */}
        <View style={styles.settingsGroup}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>안내사항</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • 방장은 구성원을 관리하고 냉장고를 삭제할 수 있습니다{'\n'}•
              구성원은 냉장고의 식재료를 함께 관리할 수 있습니다{'\n'}• 초대
              코드를 통해 새로운 구성원을 추가할 수 있습니다
            </Text>
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
