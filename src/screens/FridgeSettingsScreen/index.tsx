import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Text,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useNavigation,
  CommonActions,
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../components/_common/BackButton';
import InviteMemberModal from '../../components/FridgeSettings/InviteMemberModal';
import { AsyncStorageService } from '../../services/AsyncStorageService';
import { RootStackParamList } from '../../../App';
import { styles } from './styles';
// Vector Icons import
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type Member = {
  id: string;
  name: string;
  role: 'owner' | 'member';
  joinDate: string;
};

type Props = {
  route: {
    params: {
      fridgeId: string; // string으로 변경
      fridgeName: string;
      userRole?: 'owner' | 'member';
    };
  };
};

const FridgeSettingsScreen = ({ route }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { fridgeId, fridgeName, userRole } = route.params;

  // 상태
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 멤버 목록 로드
  const loadMembers = async () => {
    try {
      setIsLoading(true);

      // 현재 사용자 정보 가져오기
      const userId = await AsyncStorageService.getCurrentUserId();
      console.log('=== 멤버 목록 로드 디버깅 ===');
      console.log('현재 사용자 ID:', userId);
      if (!userId) return;

      const user = await AsyncStorageService.getUserById(userId);
      console.log('현재 사용자 정보:', user);
      setCurrentUser(user);

      // 냉장고-사용자 관계 데이터 가져오기
      const refrigeratorUsers =
        await AsyncStorageService.getRefrigeratorUsers();
      const users = await AsyncStorageService.getUsers();
      const refrigerators = await AsyncStorageService.getRefrigerators();

      console.log('fridgeId (파라미터):', fridgeId, typeof fridgeId);
      console.log('refrigeratorUsers:', refrigeratorUsers);
      console.log('users:', users);
      console.log('refrigerators:', refrigerators);

      // 현재 냉장고 정보 찾기 (ID 타입 비교 문제 해결)
      const currentFridge = refrigerators.find(
        r => r.id.toString() === fridgeId.toString(),
      );
      console.log('currentFridge:', currentFridge);
      if (!currentFridge) {
        console.error('냉장고를 찾을 수 없습니다:', fridgeId);
        return;
      }

      // 현재 냉장고의 멤버들 찾기 (ID 타입 비교 문제 해결)
      const fridgeMembers = refrigeratorUsers.filter(
        ru => ru.refrigeratorId.toString() === fridgeId.toString(),
      );
      console.log('fridgeMembers:', fridgeMembers);

      // 멤버 정보 구성
      const memberList: Member[] = fridgeMembers
        .map(ru => {
          // ID 타입 통일 (number를 string으로 변환)
          const memberUser = users.find(u => u.id === ru.inviteeId.toString());
          console.log(
            `멤버 ${ru.inviteeId} (${typeof ru.inviteeId}) 찾기:`,
            memberUser,
          );
          if (!memberUser) return null;

          // 소유자인지 확인 (inviterId === inviteeId이면 소유자)
          const isOwner = ru.inviterId === ru.inviteeId;

          return {
            id: memberUser.id,
            name: memberUser.name,
            role: isOwner ? ('owner' as const) : ('member' as const),
            joinDate: new Date(ru.createdAt)
              .toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\//g, '.'),
          };
        })
        .filter((member): member is Member => member !== null)
        .sort((a, b) => {
          // 소유자를 맨 위에, 그 다음은 가입일 순
          if (a.role === 'owner' && b.role === 'member') return -1;
          if (a.role === 'member' && b.role === 'owner') return 1;
          return (
            new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
          );
        });

      console.log('최종 memberList:', memberList);
      setMembers(memberList);
    } catch (error) {
      console.error('멤버 목록 로드 실패:', error);
      Alert.alert('오류', '멤버 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [fridgeId]);

  // 화면 포커스 시 멤버 목록 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadMembers();
    }, [fridgeId]),
  );

  const handleBack = () => {
    navigation.goBack();
  };

  // 식재료 사용 기록 확인하기
  const handleUsageHistory = () => {
    navigation.navigate('UsageHistoryScreen', { fridgeId });
  };

  // 구성원 초대하기
  const handleMemberInvite = () => {
    console.log('구성원 초대 모달 열기');
    setShowInviteModal(true);
  };

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettingsScreen');
  };

  // 로그아웃
  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: async () => {
          try {
            await AsyncStorageService.clearCurrentUser();
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

  // 냉장고 삭제하기 (냉장고 주인)
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
      // 삭제 중 로딩 표시
      Alert.alert('삭제 중...', '냉장고를 삭제하고 있습니다.', [], {
        cancelable: false,
      });

      // 실제 냉장고 삭제
      const success = await AsyncStorageService.deleteRefrigerator(
        parseInt(fridgeId, 10),
      );

      if (success) {
        Alert.alert(
          '삭제 완료',
          `"${fridgeName}" 냉장고가 성공적으로 삭제되었습니다.`,
          [
            {
              text: '확인',
              onPress: () => {
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
      } else {
        Alert.alert('삭제 실패', '냉장고 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('냉장고 삭제 실패:', error);
      Alert.alert(
        '삭제 실패',
        '냉장고 삭제 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      );
    }
  };

  // 냉장고 나가기 (구성원)
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
      if (!currentUser) {
        Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
        return;
      }

      // 나가기 중 로딩 표시
      Alert.alert('처리 중...', '냉장고에서 나가는 중입니다.', [], {
        cancelable: false,
      });

      // 실제 냉장고 나가기
      const success = await AsyncStorageService.removeUserFromRefrigerator(
        parseInt(fridgeId, 10),
        parseInt(currentUser.id, 10),
      );

      if (success) {
        Alert.alert(
          '나가기 완료',
          `"${fridgeName}" 냉장고에서 나왔습니다.`,
          [
            {
              text: '확인',
              onPress: () => {
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
      } else {
        Alert.alert('오류', '냉장고 나가기에 실패했습니다.');
      }
    } catch (error) {
      console.error('냉장고 나가기 실패:', error);
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

  // 로딩 중일 때
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={handleBack} />
          <Text style={styles.headerTitle}>냉장고 설정</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>멤버 목록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.sectionTitle}>구성원 ({members.length}명)</Text>
          {members.length > 0 ? (
            members.map(renderMember)
          ) : (
            <View style={styles.emptyMembers}>
              <Text style={styles.emptyText}>
                멤버 정보를 불러올 수 없습니다
              </Text>
            </View>
          )}
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
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleFridgeDelete}
          >
            <MaterialIcons name="dangerous" size={24} color="tomato" />
            <Text style={[styles.bottomButtonText, styles.dangerText]}>
              냉장고 삭제
            </Text>
          </TouchableOpacity>
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
        fridgeId={parseInt(fridgeId, 10)}
        fridgeName={fridgeName}
        onInviteSuccess={loadMembers} // 초대 성공 시 멤버 목록 새로고침
      />
    </SafeAreaView>
  );
};

export default FridgeSettingsScreen;
