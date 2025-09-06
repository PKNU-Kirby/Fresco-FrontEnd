import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  CommonActions,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AsyncStorageService } from '../services/AsyncStorageService';
import { ApiService } from '../services/apiServices';
import { RootStackParamList } from '../../App';

type Member = {
  id: string;
  name: string;
  role: 'owner' | 'member';
};

type User = {
  id: string;
  name: string;
  email: string;
};

export const useFridgeSettings = (
  fridgeId: string,
  fridgeName: string,
  userRole?: 'owner' | 'member',
) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'member'>(
    'member',
  );

  // 냉장고 멤버 목록 로드
  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('=== 냉장고 멤버 목록 로드 ===');
      console.log('냉장고 ID:', fridgeId);

      const [fridgeMembers, userPermissions] = await Promise.all([
        ApiService.getFridgeMembers(fridgeId),
        ApiService.getUserPermissions(),
      ]);

      console.log('서버에서 가져온 멤버 목록:', fridgeMembers);
      console.log('권한 응답 전체:', JSON.stringify(userPermissions, null, 2));
      console.log(
        'Object.keys(userPermissions):',
        Object.keys(userPermissions),
      );
      console.log('fridgeId 타입:', typeof fridgeId, 'fridgeId 값:', fridgeId);
      console.log('숫자로 변환:', parseInt(fridgeId));
      console.log('권한에서 문자열로 체크:', userPermissions[fridgeId]);
      console.log('권한에서 숫자로 체크:', userPermissions[parseInt(fridgeId)]);
      console.log(
        '권한에서 19번 직접 체크:',
        userPermissions[19],
        userPermissions['19'],
      );

      // 현재 사용자가 이 냉장고의 owner인지 확인
      const isCurrentUserOwner = userPermissions[fridgeId] === true;

      const memberList: Member[] = fridgeMembers.map(member => ({
        id: member.userId.toString(),
        name: member.userName,
        role: 'member' as const, // 다른 멤버 권한은 표시 안함
      }));

      console.log('변환된 멤버 목록:', memberList);
      console.log('현재 사용자가 owner인가:', isCurrentUserOwner);

      setMembers(memberList);
      setCurrentUserRole(isCurrentUserOwner ? 'owner' : 'member');
    } catch (error) {
      console.error('멤버 목록 로드 실패:', error);
      Alert.alert('오류', '멤버 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [fridgeId]);

  // 화면 포커스시 데이터 로드 (초기 로드 + 포커스시 새로고침)
  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [fridgeId]),
  );

  // 네비게이션 핸들러들
  const handleUsageHistory = () => {
    navigation.navigate('UsageHistoryScreen', { fridgeId });
  };

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettingsScreen', {});
  };

  const handleMembersList = () => {
    navigation.navigate('MembersScreen', {
      fridgeId,
      fridgeName,
      userRole: currentUserRole,
    });
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: async () => {
          try {
            // 서버에 로그아웃 요청 (선택사항)
            await ApiService.logout();

            // 로컬 스토리지 클리어
            await AsyncStorageService.clearCurrentUser();

            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              }),
            );
          } catch (error) {
            console.error('로그아웃 실패:', error);
            Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

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
      Alert.alert('삭제 중...', '냉장고를 삭제하고 있습니다.', [], {
        cancelable: false,
      });

      // 서버에 냉장고 삭제 요청
      await ApiService.deleteRefrigerator(fridgeId);

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
    } catch (error) {
      console.error('냉장고 삭제 실패:', error);
      Alert.alert(
        '삭제 실패',
        error.message ||
          '냉장고 삭제 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      );
    }
  };

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

      Alert.alert('처리 중...', '냉장고에서 나가는 중입니다.', [], {
        cancelable: false,
      });

      // 서버에 냉장고 나가기 요청
      await ApiService.leaveFridge(fridgeId, currentUser.id);

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
    } catch (error) {
      console.error('냉장고 나가기 실패:', error);
      Alert.alert(
        '오류',
        error.message ||
          '냉장고 나가기 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      );
    }
  };

  return {
    members,
    isLoading,
    currentUser,
    currentUserRole,
    loadMembers,
    handleUsageHistory,
    handleNotificationSettings,
    handleMembersList,
    handleLogout,
    handleFridgeDelete,
    handleLeaveFridge,
  };
};
