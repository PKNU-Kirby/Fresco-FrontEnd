import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../components/_common/BackButton';
import InviteMemberModal from '../../components/modals/InviteMemberModal';
import { RootStackParamList } from '../../../App';
import { styles } from './styles';
// Vector Icons import
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type Member = {
  id: number;
  name: string;
  role: 'owner' | 'member';
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

const FridgeSettingsScreen = ({ route }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { fridgeId, fridgeName, userRole } = route.params;

  // 초대 모달 상태 추가
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Mock 구성원 데이터
  const mockMembers: Member[] = [
    {
      id: 1,
      name: '김후정',
      role: 'owner',
      joinDate: '2024.01.15',
    },
    {
      id: 2,
      name: '황유진',
      role: 'member',
      joinDate: '2024.02.20',
    },
    {
      id: 3,
      name: '황정민',
      role: 'member',
      joinDate: '2024.03.10',
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  // Func 1. 식재료 사용 기록 확인하기
  const handleUsageHistory = () => {
    navigation.navigate('UsageHistoryScreen', { fridgeId });
  };

  // Func 2. 구성원 초대하기 - 모달 열기로 변경
  const handleMemberInvite = () => {
    console.log('구성원 초대 모달 열기');
    setShowInviteModal(true);
  };

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettingsScreen');
  };

  // Func 3. 로그아웃
  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: async () => {
          try {
            // AsyncStorage에서 사용자 정보 삭제
            await AsyncStorage.removeItem('userId');

            // 로그인 화면으로 리셋 (뒤로가기 방지)
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              }),
            );
          } catch (error) {
            Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  // Func 4-1. 냉장고 삭제하기 (냉장고 주인)
  const handleFridgeDelete = () => {
    Alert.alert(
      '냉장고 삭제',
      `\n"${fridgeName}" 냉장고를 삭제합니다.\n\n⚠️\n 삭제된 냉장고의 모든 데이터가 영구적으로 사라지며, 복구가 불가능합니다.\n\n• 저장된 모든 식재료\n• 사용 기록\n• 구성원 정보\n`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            // 한 번 더 확인
            Alert.alert(
              '최종 확인',
              `\n"${fridgeName}" 냉장고를 정말 삭제하시겠습니까?`,
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '삭제',
                  style: 'destructive',
                  onPress: performFridgeDelete,
                },
              ],
            );
          },
        },
      ],
    );
  };

  const performFridgeDelete = async () => {
    try {
      // 삭제 중 로딩 표시 (실제로는 API 호출 해야함)
      Alert.alert('삭제 중...', '냉장고를 삭제하고 있습니다.', [], {
        cancelable: false,
      });

      // 서버 DELETE API 호출
      // await deleteFridge(fridgeId);

      // 임시 로딩 시간 (실제 API 호출 시뮬레이션)
      await new Promise(resolve => setTimeout(() => resolve(undefined), 1500));
      // 성공 메시지
      Alert.alert(
        '삭제 완료',
        `"${fridgeName}" 냉장고가 성공적으로 삭제되었습니다.`,
        [
          {
            text: '확인',
            onPress: () => {
              // 냉장고 선택 화면으로 이동
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'FridgeSelect' }],
                }),
              );
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      Alert.alert(
        '삭제 실패',
        '냉장고 삭제 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      );
    }
  };

  // Func 4-2. 냉장고 나가기 (구성원))
  const handleLeaveFridge = () => {
    Alert.alert(
      '냉장고 나가기',
      `"${fridgeName}" 냉장고에서 나가시겠습니까?\n\n• 더 이상 이 냉장고의 식재료를 확인할 수 없습니다.\n• 나중에 다시 초대받으면 재참여할 수 있습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: performLeaveFridge,
        },
      ],
    );
  };

  const performLeaveFridge = async () => {
    try {
      // 나가기 중 로딩 표시
      Alert.alert('처리 중...', '냉장고에서 나가는 중입니다.', [], {
        cancelable: false,
      });

      // 서버 나가기 API 호출
      // await leaveFridge(fridgeId, userId);

      // 임시 로딩 시간
      await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

      // 성공 메시지
      Alert.alert(
        '나가기 완료',
        `"${fridgeName}" 냉장고에서 나왔습니다.`,
        [
          {
            text: '확인',
            onPress: () => {
              // 냉장고 선택 화면으로 이동
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'FridgeSelect' }],
                }),
              );
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      Alert.alert(
        '오류',
        '냉장고 나가기 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      );
    }
  };

  const renderMember = (member: Member) => (
    <View key={member.id} style={styles.memberCard}>
      <View style={styles.memberCardHeader}>
        <View style={styles.memberAvatar}>
          <Ionicons name="person-circle-outline" size={40} color="#6c757d" />
        </View>
        <View style={styles.memberMainInfo}>
          <View style={styles.memberNameContainer}>
            <Text style={styles.memberName}>{member.name}</Text>
            {member.role === 'owner' && (
              <View style={styles.ownerBadge}>
                <FontAwesome5 name="crown" size={12} color="#212529" />
                <Text style={styles.ownerBadgeText}>방장</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.memberCardFooter}>
        <Text style={styles.memberJoinDateText}>가입일: {member.joinDate}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={styles.headerTitle}>냉장고 설정</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 구성원 목록 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>
            구성원 ({mockMembers.length}명)
          </Text>
          {mockMembers.map(renderMember)}
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleUsageHistory}
        >
          <Ionicons name="bar-chart-outline" size={26} color="#666" />
          <Text style={styles.bottomButtonText}>사용기록</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleMemberInvite}
        >
          <Ionicons name="people-outline" size={24} color="#666" />
          <Text style={styles.bottomButtonText}>구성원 초대</Text>
        </TouchableOpacity>

        {/* 새로 추가: 알림 설정 버튼 */}
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleNotificationSettings}
        >
          <Ionicons name="notifications-outline" size={24} color="#666" />
          <Text style={styles.bottomButtonText}>알림 설정</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton} onPress={handleLogout}>
          <Feather name="log-out" size={24} color="#495057" />
          <Text style={styles.bottomButtonText}>로그아웃</Text>
        </TouchableOpacity>

        {userRole === 'owner' ? (
          <>
            <TouchableOpacity
              style={styles.bottomButton}
              onPress={handleFridgeDelete}
            >
              <MaterialIcons name="dangerous" size={24} color="tomato" />
              <Text style={[styles.bottomButtonText, styles.dangerText]}>
                냉장고 삭제
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleLeaveFridge}
          >
            <MaterialIcons name="dangerous" size={24} color="tomato" />
            <Text style={[styles.bottomButtonText, styles.dangerText]}>
              냉장고 나가기
            </Text>
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
