import { useState, useCallback } from 'react';
import {
  CommonActions,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AsyncStorageService } from '../services/AsyncStorageService';
import { ApiService } from '../services/apiServices';
import { RootStackParamList } from '../../App';
import { PermissionAPIService } from '../services/API/permissionAPI';

type Member = {
  id: number;
  name: string;
  role: 'owner' | 'member';
};

type User = {
  id: number;
  name: string;
  email: string;
};

// ConfirmModal 상태 타입
export interface FridgeSettingsModalState {
  errorModalVisible: boolean;
  errorMessage: string;
  logoutConfirmVisible: boolean;
  logoutErrorVisible: boolean;
  deleteConfirmVisible: boolean;
  deleteFinalConfirmVisible: boolean;
  deletingModalVisible: boolean;
  deleteSuccessVisible: boolean;
  deleteErrorVisible: boolean;
  deleteErrorMessage: string;
  leaveConfirmVisible: boolean;
  leavingModalVisible: boolean;
  leaveSuccessVisible: boolean;
  leaveErrorVisible: boolean;
  leaveErrorMessage: string;
  userInfoErrorVisible: boolean;
  setErrorModalVisible: (visible: boolean) => void;
  setLogoutConfirmVisible: (visible: boolean) => void;
  setLogoutErrorVisible: (visible: boolean) => void;
  setDeleteConfirmVisible: (visible: boolean) => void;
  setDeleteFinalConfirmVisible: (visible: boolean) => void;
  setDeletingModalVisible: (visible: boolean) => void;
  setDeleteSuccessVisible: (visible: boolean) => void;
  setDeleteErrorVisible: (visible: boolean) => void;
  setLeaveConfirmVisible: (visible: boolean) => void;
  setLeavingModalVisible: (visible: boolean) => void;
  setLeaveSuccessVisible: (visible: boolean) => void;
  setLeaveErrorVisible: (visible: boolean) => void;
  setUserInfoErrorVisible: (visible: boolean) => void;
  handleLogoutConfirm: () => Promise<void>;
  handleDeleteFirstConfirm: () => void;
  handleDeleteFinalConfirm: () => Promise<void>;
  handleDeleteSuccess: () => void;
  handleLeaveConfirm: () => Promise<void>;
  handleLeaveSuccess: () => void;
}

export const useFridgeSettings = (
  fridgeId: number,
  fridgeName: string,
  userRole?: 'owner' | 'member',
) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, _setCurrentUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'member'>(
    'member',
  );

  // ConfirmModal 상태들
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [logoutErrorVisible, setLogoutErrorVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteFinalConfirmVisible, setDeleteFinalConfirmVisible] =
    useState(false);
  const [deletingModalVisible, setDeletingModalVisible] = useState(false);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);
  const [deleteErrorVisible, setDeleteErrorVisible] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const [leavingModalVisible, setLeavingModalVisible] = useState(false);
  const [leaveSuccessVisible, setLeaveSuccessVisible] = useState(false);
  const [leaveErrorVisible, setLeaveErrorVisible] = useState(false);
  const [leaveErrorMessage, setLeaveErrorMessage] = useState('');
  const [userInfoErrorVisible, setUserInfoErrorVisible] = useState(false);

  // 냉장고 멤버 목록 로드
  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('=== 냉장고 멤버 목록 로드 ===');
      console.log('냉장고 ID:', fridgeId);

      const [fridgeMembers, userPermissions] = await Promise.all([
        ApiService.getFridgeMembers(fridgeId),
        PermissionAPIService.getUserPermissions(),
      ]);

      console.log('서버에서 가져온 멤버 목록:', fridgeMembers);
      console.log('권한 응답 전체:', JSON.stringify(userPermissions, null, 2));

      // 현재 사용자가 이 냉장고의 owner인지 확인
      const isCurrentUserOwner = userPermissions[fridgeId] === true;

      const memberList: Member[] = fridgeMembers.map(member => ({
        id: member.userId,
        name: member.userName,
        role: 'member' as const,
      }));

      console.log('변환된 멤버 목록:', memberList);
      console.log('현재 사용자가 owner인가:', isCurrentUserOwner);

      setMembers(memberList);
      setCurrentUserRole(isCurrentUserOwner ? 'owner' : 'member');
    } catch (error) {
      // console.error('멤버 목록 로드 실패:', error);
      setErrorMessage('멤버 목록을 불러올 수 없습니다.');
      setErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [fridgeId]);

  // 화면 포커스시 데이터 로드
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

  // 로그아웃
  const handleLogout = () => {
    setLogoutConfirmVisible(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // 서버에 로그아웃 요청
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
      // console.error('로그아웃 실패:', error);
      setLogoutConfirmVisible(false);
      setLogoutErrorVisible(true);
    }
  };

  // 냉장고 삭제
  const handleFridgeDelete = () => {
    setDeleteConfirmVisible(true);
  };

  const handleDeleteFirstConfirm = () => {
    setDeleteConfirmVisible(false);
    setDeleteFinalConfirmVisible(true);
  };

  const handleDeleteFinalConfirm = async () => {
    setDeleteFinalConfirmVisible(false);
    setDeletingModalVisible(true);

    try {
      // 서버에 냉장고 삭제 요청
      await ApiService.deleteRefrigerator(fridgeId);

      setDeletingModalVisible(false);
      setDeleteSuccessVisible(true);
    } catch (error) {
      // console.error('냉장고 삭제 실패:', error);
      setDeletingModalVisible(false);
      setDeleteErrorMessage(
        error.message ||
          '냉장고 삭제 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      );
      setDeleteErrorVisible(true);
    }
  };

  const handleDeleteSuccess = () => {
    setDeleteSuccessVisible(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'FridgeSelect' }],
      }),
    );
  };

  // 냉장고 나가기
  const handleLeaveFridge = () => {
    setLeaveConfirmVisible(true);
  };

  const handleLeaveConfirm = async () => {
    if (!currentUser) {
      setLeaveConfirmVisible(false);
      setUserInfoErrorVisible(true);
      return;
    }

    setLeaveConfirmVisible(false);
    setLeavingModalVisible(true);

    try {
      // 서버에 냉장고 나가기 요청
      await ApiService.leaveFridge(fridgeId, currentUser.id);

      setLeavingModalVisible(false);
      setLeaveSuccessVisible(true);
    } catch (error) {
      // console.error('냉장고 나가기 실패:', error);
      setLeavingModalVisible(false);
      setLeaveErrorMessage(
        error.message ||
          '냉장고 나가기 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      );
      setLeaveErrorVisible(true);
    }
  };

  const handleLeaveSuccess = () => {
    setLeaveSuccessVisible(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'FridgeSelect' }],
      }),
    );
  };

  const modalState: FridgeSettingsModalState = {
    errorModalVisible,
    errorMessage,
    logoutConfirmVisible,
    logoutErrorVisible,
    deleteConfirmVisible,
    deleteFinalConfirmVisible,
    deletingModalVisible,
    deleteSuccessVisible,
    deleteErrorVisible,
    deleteErrorMessage,
    leaveConfirmVisible,
    leavingModalVisible,
    leaveSuccessVisible,
    leaveErrorVisible,
    leaveErrorMessage,
    userInfoErrorVisible,
    setErrorModalVisible,
    setLogoutConfirmVisible,
    setLogoutErrorVisible,
    setDeleteConfirmVisible,
    setDeleteFinalConfirmVisible,
    setDeletingModalVisible,
    setDeleteSuccessVisible,
    setDeleteErrorVisible,
    setLeaveConfirmVisible,
    setLeavingModalVisible,
    setLeaveSuccessVisible,
    setLeaveErrorVisible,
    setUserInfoErrorVisible,
    handleLogoutConfirm,
    handleDeleteFirstConfirm,
    handleDeleteFinalConfirm,
    handleDeleteSuccess,
    handleLeaveConfirm,
    handleLeaveSuccess,
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
    modalState, // 모달 상태 추가
  };
};
