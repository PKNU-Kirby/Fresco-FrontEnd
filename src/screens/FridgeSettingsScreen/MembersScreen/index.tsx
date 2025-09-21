import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../../components/_common/BackButton';
import InviteMemberModal from '../../../components/FridgeSettings/InviteMemberModal';
import MemberGroups from '../../../components/FridgeSettings/MemberGroups';
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

  const { members, isLoading, loadMembers, handleMemberPress } = useApiMembers(
    fridgeId,
    fridgeName,
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMemberInvite = () => {
    setShowInviteModal(true);
  };

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
        <MemberGroups
          members={members}
          fridgeName={fridgeName}
          userRole={userRole}
          onMemberInvite={handleMemberInvite}
          onMemberPress={handleMemberPress}
          onMemberRemove={loadMembers} // 멤버 제거 후 목록 새로고침
        />
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
