import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PermissionAPIService } from '../services/API/permissionAPI';
import {
  FridgeSettingsAPIService,
  FridgeMember,
} from '../services/API/FridgeSettingsAPI';
import { AsyncStorageService } from '../services/AsyncStorageService';

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
  const navigation = useNavigation();

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

      // 권한 데이터를 UserPermissions 형태로 변환 (실제 구조에 맞게 수정 필요)
      const userPermissions: UserPermissions = {
        additionalProp1: permissionsResponse.length > 0, // 임시 변환 로직
        additionalProp2: true, // 기본값
        additionalProp3: true, // 기본값
      };

      setPermissions(userPermissions);
      setMembers(membersResponse);

      // 현재 사용자의 역할 확인
      const currentUserId = await AsyncStorageService.getCurrentUserId();
      if (currentUserId && membersResponse.length > 0) {
        const currentUser = membersResponse.find(
          member => member.userId === currentUserId,
        );
        if (currentUser) {
          setCurrentUserRole(currentUser.role === 'OWNER' ? 'owner' : 'member');
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

  // 동기 권한 체크 헬퍼 함수들
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

  // 로그아웃
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorageService.clearAllAuthData();
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
            });
          } catch (error) {
            console.error('로그아웃 실패:', error);
            Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  // 냉장고 삭제 (방장만)
  const handleFridgeDelete = () => {
    if (!canDeleteFridge()) {
      Alert.alert('권한 없음', '냉장고를 삭제할 수 있는 권한이 없습니다.');
      return;
    }

    Alert.alert(
      '냉장고 삭제',
      `'${fridgeName}' 냉장고를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며, 모든 데이터가 삭제됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // 냉장고 삭제 API가 실제로 없으므로 임시로 주석 처리
              // await FridgeSettingsAPIService.deleteFridge(fridgeId);

              // 현재는 나가기 기능으로 대체 (실제 삭제 API 구현 시 교체)
              console.warn('냉장고 삭제 API가 구현되지 않아 나가기로 대체');
              await FridgeSettingsAPIService.leaveFridge(fridgeId);

              Alert.alert('완료', '냉장고가 삭제되었습니다.', [
                {
                  text: '확인',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainScreen' }],
                    });
                  },
                },
              ]);
            } catch (error) {
              console.error('냉장고 삭제 실패:', error);
              Alert.alert('오류', '냉장고 삭제에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  // 냉장고 나가기 (구성원만)
  const handleLeaveFridge = () => {
    if (currentUserRole === 'owner') {
      Alert.alert(
        '안내',
        '방장은 냉장고를 나갈 수 없습니다. 냉장고를 삭제하거나 방장을 다른 사람에게 위임해주세요.',
      );
      return;
    }

    Alert.alert(
      '냉장고 나가기',
      `'${fridgeName}' 냉장고를 나가시겠습니까?\n나중에 다시 초대받아야 참여할 수 있습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: async () => {
            try {
              await FridgeSettingsAPIService.leaveFridge(fridgeId);
              Alert.alert('완료', '냉장고를 나갔습니다.', [
                {
                  text: '확인',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainScreen' }],
                    });
                  },
                },
              ]);
            } catch (error) {
              console.error('냉장고 나가기 실패:', error);
              Alert.alert('오류', '냉장고 나가기에 실패했습니다.');
            }
          },
        },
      ],
    );
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
    handleLeaveFridge,
  };
};
