import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CustomText from '../../components/common/CustomText';
import BackButton from '../../components/common/BackButton';
import InviteMemberModal from '../../components/modals/InviteMemberModal'; // 모달 import
import {RootStackParamList} from '../../../App';
import {styles} from './styles';

type Member = {
  id: number;
  name: string;
  role: 'owner' | 'member';
  avatar: string;
  joinDate: string;
};

type Props = {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
      userRole?: 'owner' | 'member';
    };
  };
};

const FridgeSettingsScreen = ({route}: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {fridgeId, fridgeName, userRole = 'member'} = route.params;

  // 초대 모달 상태 추가
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Mock 구성원 데이터
  const mockMembers: Member[] = [
    {
      id: 1,
      name: '김후정',
      role: 'owner',
      avatar: '♟',
      joinDate: '2024.01.15',
    },
    {
      id: 2,
      name: '황유진',
      role: 'member',
      avatar: '♟',
      joinDate: '2024.02.20',
    },
    {
      id: 3,
      name: '황정민',
      role: 'member',
      avatar: '♟',
      joinDate: '2024.03.10',
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  // Func 1. 식재료 사용 기록 확인하기
  const handleUsageHistory = () => {
    navigation.navigate('UsageHistoryScreen', {fridgeId});
  };

  // Func 2. 구성원 초대하기 - 모달 열기로 변경
  const handleMemberInvite = () => {
    console.log('구성원 초대 모달 열기');
    setShowInviteModal(true);
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {text: '로그아웃', onPress: () => console.log('로그아웃')},
    ]);
  };

  const handleFridgeDelete = () => {
    Alert.alert(
      '냉장고 삭제',
      '정말로 이 냉장고를 삭제하시겠습니까?\n모든 데이터가 사라집니다.',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => console.log('냉장고 삭제'),
        },
      ],
    );
  };

  const handleLeaveFridge = () => {
    Alert.alert('냉장고 나가기', '이 냉장고에서 나가시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => console.log('냉장고 나가기'),
      },
    ]);
  };

  const renderMember = (member: Member) => (
    <View key={member.id} style={styles.memberCard}>
      <View style={styles.memberCardHeader}>
        <View style={styles.memberAvatar}>
          <CustomText style={styles.memberAvatarText}>
            {member.role === 'owner' ? '♚' : member.avatar}
          </CustomText>
        </View>
        <View style={styles.memberMainInfo}>
          <CustomText style={styles.memberName}>{member.name}</CustomText>
        </View>
      </View>
      <View style={styles.memberCardFooter}>
        <CustomText style={styles.memberJoinDateText}>
          가입일: {member.joinDate}
        </CustomText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <CustomText style={styles.headerTitle}>냉장고 설정</CustomText>
        <View style={styles.headerRight} />
      </View>

      {/* 구성원 목록 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.membersSection}>
          <CustomText style={styles.sectionTitle}>
            구성원 ({mockMembers.length}명)
          </CustomText>
          {mockMembers.map(renderMember)}
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleUsageHistory}>
          <CustomText style={styles.bottomButtonIcon}>📊</CustomText>
          <CustomText style={styles.bottomButtonText}>사용내역</CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleMemberInvite}>
          <CustomText style={styles.bottomButtonIcon}>👥</CustomText>
          <CustomText style={styles.bottomButtonText}>구성원 초대</CustomText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton} onPress={handleLogout}>
          <CustomText style={styles.bottomButtonIcon}>🚪</CustomText>
          <CustomText style={styles.bottomButtonText}>로그아웃</CustomText>
        </TouchableOpacity>

        {userRole === 'owner' ? (
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleFridgeDelete}>
            <CustomText style={styles.bottomButtonIcon}>🗑️</CustomText>
            <CustomText style={[styles.bottomButtonText, styles.dangerText]}>
              냉장고 삭제
            </CustomText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleLeaveFridge}>
            <CustomText style={styles.bottomButtonIcon}>😞</CustomText>
            <CustomText style={[styles.bottomButtonText, styles.dangerText]}>
              냉장고 나가기
            </CustomText>
          </TouchableOpacity>
        )}
      </View>

      {/* 구성원 초대 모달 */}
      <InviteMemberModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        fridgeId={fridgeId}
        fridgeName={fridgeName}
      />
    </SafeAreaView>
  );
};

export default FridgeSettingsScreen;
