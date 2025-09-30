import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PermissionAPIService } from '../services/API/permissionAPI';
import {
  FridgeSettingsAPIService,
  FridgeMember,
} from '../services/API/FridgeSettingsAPI';
import { AsyncStorageService } from '../services/AsyncStorageService';
import { CommonActions } from '@react-navigation/native';
import { AuthAPIService } from '../services/API/authAPI';
import { getAccessToken } from '../utils/authUtils';
import { FridgeControllerAPI } from '../services/API/fridgeControllerAPI';

interface UserPermissions {
  additionalProp1: boolean;
  additionalProp2: boolean;
  additionalProp3: boolean;
}

export const useApiFridgeSettings = (
  fridgeId: string,
  fridgeName: string,
  userRole?: 'owner' | 'member',
) => {
  const navigation = useNavigation<any>();

  const [members, setMembers] = useState<FridgeMember[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<
    'owner' | 'member' | null
  >(userRole || null);

  // 권한 및 멤버 정보 로드
  const loadPermissions = async () => {
    try {
      setIsLoading(true);

      // 병렬로 권한과 멤버 정보 조회
      const [permissionsResponse, membersResponse] = await Promise.all([
        PermissionAPIService.getUserPermissions(),
        FridgeSettingsAPIService.getFridgeMembers(fridgeId),
      ]);

      console.log('=== 디버깅 정보 ===');
      console.log('membersResponse:', JSON.stringify(membersResponse, null, 2));
      console.log(
        'permissionsResponse:',
        JSON.stringify(permissionsResponse, null, 2),
      );

      // 권한 데이터를 UserPermissions 형태로 변환
      const userPermissions: UserPermissions = {
        additionalProp1: permissionsResponse.length > 0,
        additionalProp2: true,
        additionalProp3: true,
      };

      // 현재 냉장고에 대한 권한 정보 찾기
      const currentFridgePermission = permissionsResponse.find(
        perm => perm.fridgeId === fridgeId,
      );

      console.log('현재 냉장고 권한 정보:', currentFridgePermission);

      // 현재 사용자 ID 가져오기
      const currentUserId = await AsyncStorageService.getCurrentUserId();
      console.log('현재 사용자 ID:', currentUserId);

      // 멤버 데이터에 역할 정보 추가
      const enrichedMembers: FridgeMember[] = membersResponse.map(member => {
        const isOwner = currentFridgePermission?.role === 'OWNER';
        const role = isOwner ? 'OWNER' : 'MEMBER';

        console.log(
          `멤버 ${member.userName}(${member.userId}): 권한기반역할=${role}`,
        );

        return {
          ...member,
          role: role as 'OWNER' | 'MEMBER',
        };
      });

      console.log('완성된 멤버 데이터:', enrichedMembers);
      setMembers(enrichedMembers);

      // 현재 사용자의 역할을 권한으로 판단
      if (currentUserId) {
        try {
          // 현재 냉장고에 대한 권한 확인
          const [canEdit, canDelete] = await Promise.all([
            PermissionAPIService.checkFridgePermission(fridgeId, 'edit'),
            PermissionAPIService.checkFridgePermission(fridgeId, 'view'),
          ]);

          console.log(`사용자 ${currentUserId} 권한:`, { canEdit, canDelete });

          // canEdit과 canDelete 둘 다 true면 방장, 아니면 구성원
          const isOwner = canEdit && canDelete;
          setCurrentUserRole(isOwner ? 'owner' : 'member');

          console.log('판단된 역할:', isOwner ? 'owner' : 'member');
        } catch (permissionError) {
          console.error('권한 확인 중 오류:', permissionError);
          // 권한 확인 실패 시 route에서 전달받은 userRole 사용
          setCurrentUserRole(userRole || null);
        }
      }
    } catch (error) {
      console.error('권한 정보 로드 실패:', error);
      Alert.alert('오류', '권한 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 멤버 정보만 새로고침
  const loadMembers = async () => {
    try {
      const membersResponse = await FridgeSettingsAPIService.getFridgeMembers(
        fridgeId,
      );
      setMembers(Array.isArray(membersResponse) ? membersResponse : []);
    } catch (error) {
      console.error('멤버 목록 로드 실패:', error);
      Alert.alert('오류', '멤버 목록을 불러올 수 없습니다.');
      setMembers([]); // 실패 시 빈 배열로 설정
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [fridgeId]);

  // 권한 정보가 로드되고 사용자 역할이 확정되면 권한 체크 실행
  useEffect(() => {
    if (!isLoading && currentUserRole) {
      checkPermissions();
    }
  }, [isLoading, currentUserRole, fridgeId]);

  // 권한 상태를 위한 추가 state
  const [canInvite, setCanInvite] = useState(false);
  const [canView, setCanView] = useState(false);

  // 권한 체크 함수들 (비동기)
  const checkPermissions = async () => {
    try {
      // 방장이면 모든 권한 허용
      if (currentUserRole === 'owner') {
        setCanInvite(true);
        setCanView(true);
        return;
      }

      // 구성원이면 API로 권한 확인
      const [canEdit, canViewHistory] = await Promise.all([
        PermissionAPIService.checkFridgePermission(fridgeId, 'edit'),
        PermissionAPIService.checkFridgePermission(fridgeId, 'view'),
      ]);

      setCanInvite(canEdit);
      setCanView(canViewHistory);
    } catch (error) {
      console.error('권한 확인 실패:', error);
      // 기본값으로 설정
      setCanInvite(currentUserRole === 'owner');
      setCanView(true); // 기본적으로 조회는 허용
    }
  };

  // 동기 권한 체크 함수들
  const canInviteMembers = () => {
    return currentUserRole === 'owner' || canInvite;
  };

  const canDeleteMembers = () => {
    return currentUserRole === 'owner';
  };

  const canDeleteFridge = () => {
    return currentUserRole === 'owner';
  };

  const canViewUsageHistory = () => {
    return currentUserRole === 'owner' || canView;
  };

  // 사용 기록 화면으로 이동
  const handleUsageHistory = () => {
    if (!canViewUsageHistory()) {
      Alert.alert('권한 없음', '사용 기록을 볼 수 있는 권한이 없습니다.');
      return;
    }

    navigation.navigate('UsageHistoryScreen', {
      fridgeId,
      fridgeName,
    });
  };

  // 알림 설정 화면으로 이동
  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettingsScreen');
  };

  // 구성원 목록 화면으로 이동
  const handleMembersList = () => {
    navigation.navigate('MembersScreen', {
      fridgeId,
      fridgeName,
      userRole: currentUserRole,
      canDeleteMembers: canDeleteMembers(),
    });
  };

  // 멤버 초대 권한 체크
  const handleInviteMember = () => {
    if (!canInviteMembers()) {
      Alert.alert('권한 없음', '멤버를 초대할 수 있는 권한이 없습니다.');
      return false;
    }
    return true;
  };

  // useApiFridgeSettings 훅 내부에 추가:
  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: async () => {
          try {
            // 현재 액세스 토큰 가져오기
            const accessToken = await getAccessToken();

            // AuthAPIService로 로그아웃
            await AuthAPIService.logout(accessToken);

            // 로그인 화면으로 이동
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }], // 실제 로그인 화면 이름으로 변경
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

  // useApiFridgeSettings 훅 내부에 추가:
  const handleFridgeDelete = () => {
    Alert.alert(
      '냉장고 삭제',
      `"${fridgeName}" 냉장고를 삭제하시겠습니까?\n\n⚠️ 삭제된 냉장고의 모든 데이터가 영구적으로 사라지며, 복구가 불가능합니다.\n\n• 저장된 모든 식재료\n• 사용 기록\n• 구성원 정보`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            // 2차 확인
            Alert.alert(
              '최종 확인',
              `"${fridgeName}" 냉장고를 정말 삭제하시겠습니까?`,
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
      console.log('냉장고 삭제 시작:', fridgeId);

      // FridgeControllerAPI로 냉장고 삭제
      await FridgeControllerAPI.delete(fridgeId);

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
      console.error('냉장고 삭제 실패:', error);
      Alert.alert(
        '삭제 실패',
        '냉장고 삭제 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      );
    }
  };

  return {
    members,
    permissions,
    currentUserRole,
    isLoading,
    loadMembers,
    loadPermissions,
    // 권한 체크 함수들
    canInviteMembers,
    canDeleteMembers,
    canDeleteFridge,
    canViewUsageHistory,
    // 핸들러 함수들
    handleUsageHistory,
    handleNotificationSettings,
    handleMembersList,
    handleInviteMember,
    handleLogout,
    handleFridgeDelete,
    performFridgeDelete,
  };
};
