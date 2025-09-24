// FridgeSelectScreen.tsx - 개선된 버전 사용 예시
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Config from 'react-native-config';

// hooks utils import
import { useFridgeSelect } from '../../hooks/useFridgeSelect';
import { useFridgeActions } from '../../hooks/useFridgeActions';
import { useOptimisticEdit } from '../../hooks/useOptimisticEdit';
import { usePermissions } from '../../hooks/usePermissions';
import { FridgeControllerAPI } from '../../services/API/fridgeControllerAPI';
// 기존 import들 중에서 authUtils 관련 부분을 찾아서 수정
import { validateUserTokenMatch, getAccessToken } from '../../utils/authUtils';
// 기존 컴포넌트들
import { HiddenFridgesBottomSheet } from '../../components/FridgeSelect/HiddenFridgeBottomSheet';
import { FridgeHeader } from '../../components/FridgeSelect/FridgeHeader';
import { FridgeList } from '../../components/FridgeSelect/FridgeTileList';
import { FridgeModals } from '../../components/FridgeSelect/FridgeModal';
import { FridgeModalManager } from '../../components/FridgeSelect/FridgeModalManager';
import { InviteCodeModal } from '../../components/FridgeSelect/InviteCodeModal';
import { FridgeWithRole } from '../../types/permission';
import { styles } from './styles';

const FridgeSelectScreen = () => {
  const navigation = useNavigation<any>();

  // 서버 데이터 관리
  const {
    currentUser,
    fridges: serverFridges,
    loading,
    // error,
    initializeData,
    loadUserFridges,
    // retryLoad,
  } = useFridgeSelect(navigation);

  // 권한 관리
  const {
    permissions,
    permissionLoading,
    // permissionError,
    hasPermission,
    getPermission,
    loadPermissions, // 이 함수 추가
  } = usePermissions(currentUser);

  // 낙관적 편집 관리
  const {
    isEditMode,
    editableFridges,
    hasChanges,
    startEdit,
    cancelEdit,
    commitChanges,
    addFridgeLocally,
    editFridgeLocally,
    deleteFridgeLocally,
    toggleHiddenLocally,
  } = useOptimisticEdit();

  // 화면에 실제로 표시할 냉장고 목록
  const displayFridges = isEditMode ? editableFridges : serverFridges;

  // UI 상태
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFridge, setEditingFridge] = useState<FridgeWithRole | null>(
    null,
  );
  const [bottomSheetHeight] = useState(new Animated.Value(80));
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);

  // 서버 액션들
  const {
    handleLogout,
    handleAddFridge: serverAddFridge,
    handleUpdateFridge: serverUpdateFridge,
    modals,
    modalHandlers,
  } = useFridgeActions({
    currentUser,
    loadUserFridges,
    setEditingFridge,
    setIsEditModalVisible,
    setIsAddModalVisible,
    editingFridge,
    navigation,
  });

  const handleJoinWithInviteCode = () => {
    setShowInviteCodeModal(true);
  };

  const handleInviteCodeSubmit = async (inviteCode: string) => {
    try {
      console.log('=== 초대코드 참여 시작 ===');
      console.log('입력된 초대코드:', inviteCode);

      const accessToken = await getAccessToken();
      console.log('Access Token 존재:', !!accessToken);

      // GET 요청으로 초대 정보 조회 + 자동 참여 처리
      console.log('초대 정보 조회 및 참여 처리');
      const inviteUrl = `${Config.API_BASE_URL}/api/v1/refrigerator/invitation/${inviteCode}`;
      console.log('요청 URL:', inviteUrl);

      const response = await fetch(inviteUrl, {
        method: 'GET',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('응답 상태:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log('에러 응답:', errorData);
        } catch (e) {
          const errorText = await response.text();
          console.log('에러 응답 텍스트:', errorText);
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || '초대코드 처리에 실패했습니다.');
      }

      const result = await response.json();
      console.log('참여 처리 성공:', result);

      const refrigeratorName = result.result?.refrigeratorName || '냉장고';

      Alert.alert(
        '참여 완료',
        `${refrigeratorName}에 성공적으로 참여했습니다!`,
        [
          {
            text: '확인',
            onPress: () => {
              console.log('냉장고 목록 및 권한 정보 새로고침 중...');
              // 냉장고 목록과 권한 정보를 동시에 새로고침
              Promise.all([loadUserFridges(), loadPermissions()])
                .then(() => {
                  console.log('새로고침 완료');
                })
                .catch(error => {
                  console.error('새로고침 실패:', error);
                });
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('초대코드 참여 실패:', error);
      console.error('에러 메시지:', error.message);
      Alert.alert('참여 실패', error.message || '초대코드를 확인해주세요.');
    }
  };

  // ✅ 추가된 부분: commitChanges용 서버 액션 함수들
  const handleCreateFridge = async (name: string) => {
    try {
      console.log('냉장고 생성 요청:', name);
      const response = await FridgeControllerAPI.create({ name });
      console.log('냉장고 생성 완료:', response);
      return response;
    } catch (error) {
      console.error('냉장고 생성 실패:', error);
      throw error;
    }
  };

  const handleUpdateFridge = async (id: string, name: string) => {
    try {
      console.log('냉장고 업데이트 요청:', id, name);
      const response = await FridgeControllerAPI.update(id, { name });
      console.log('냉장고 업데이트 완료:', response);
      return response;
    } catch (error) {
      console.error('냉장고 업데이트 실패:', error);
      throw error;
    }
  };

  const handleDeleteFridge = async (id: string) => {
    try {
      console.log('냉장고 삭제 요청:', id);
      await FridgeControllerAPI.delete(id);
      console.log('냉장고 삭제 완료:', id);
    } catch (error) {
      console.error('냉장고 삭제 실패:', error);
      throw error;
    }
  };

  // 권한 기반 액션 핸들러들
  const handleEditFridge = (fridge: FridgeWithRole) => {
    if (!isEditMode) {
      // 일반 모드에서는 상세 화면으로 이동
      if (hasPermission(fridge.id, 'view')) {
        navigation.navigate('FridgeDetail', { fridgeId: fridge.id });
      } else {
        Alert.alert('알림', '이 냉장고에 접근할 권한이 없습니다.');
      }
      return;
    }

    // 편집 모드에서는 이름 변경
    if (!hasPermission(fridge.id, 'edit')) {
      Alert.alert('알림', '이 냉장고를 편집할 권한이 없습니다.');
      return;
    }

    Alert.prompt(
      '냉장고 이름 변경',
      '새 이름을 입력하세요',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: newName => {
            if (newName && newName.trim()) {
              editFridgeLocally(fridge.id, newName.trim());
            }
          },
        },
      ],
      'plain-text',
      fridge.name,
    );
  };

  const handleLeaveFridge = (fridge: FridgeWithRole) => {
    if (!isEditMode) return;

    const permission = getPermission(fridge.id);
    if (!permission) {
      Alert.alert('알림', '이 냉장고에 대한 권한이 없습니다.');
      return;
    }

    const isOwner = permission.role === 'OWNER';
    const actionText = isOwner ? '삭제' : '나가기';

    if (isOwner && !hasPermission(fridge.id, 'delete')) {
      Alert.alert('알림', '이 냉장고를 삭제할 권한이 없습니다.');
      return;
    }

    Alert.alert(
      `냉장고 ${actionText}`,
      `${fridge.name}을(를) ${actionText}하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: actionText,
          style: 'destructive',
          onPress: () => deleteFridgeLocally(fridge.id),
        },
      ],
    );
  };

  const handleAddFridge = () => {
    if (!isEditMode) {
      setIsAddModalVisible(true);
      return;
    }

    Alert.prompt(
      '새 냉장고',
      '냉장고 이름을 입력하세요',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추가',
          onPress: name => {
            if (name && name.trim()) {
              addFridgeLocally(name.trim());
            }
          },
        },
      ],
      'plain-text',
      '',
    );
  };

  // 편집 모드 토글
  const handleEditToggle = () => {
    if (isEditMode) {
      if (hasChanges) {
        Alert.alert(
          '편집 취소',
          '변경사항이 저장되지 않습니다. 정말 취소하시겠습니까?',
          [
            { text: '계속 편집', style: 'cancel' },
            {
              text: '취소',
              style: 'destructive',
              onPress: () => {
                cancelEdit(serverFridges);
                setIsBottomSheetExpanded(false);
                bottomSheetHeight.setValue(80);
              },
            },
          ],
        );
      } else {
        cancelEdit(serverFridges);
        setIsBottomSheetExpanded(false);
        bottomSheetHeight.setValue(80);
      }
    } else {
      startEdit(serverFridges);
    }
  };

  // ✅ 수정된 부분: 편집 완료
  const handleSaveChanges = async () => {
    try {
      console.log('===== 변경사항 저장 시작 =====');
      console.log('현재 사용자 ID:', currentUser?.id);

      // 사용자 ID와 토큰 일치성 검증
      if (currentUser?.id) {
        const { isValid, needsReauth, tokenUserId } =
          await validateUserTokenMatch(currentUser.id);

        if (!isValid) {
          console.log(
            `사용자 ID 불일치! 현재: ${currentUser.id}, 토큰: ${tokenUserId}`,
          );
          Alert.alert(
            '인증 오류',
            '사용자 인증 정보가 일치하지 않습니다. 다시 로그인해주세요.',
            [
              { text: '취소', style: 'cancel' },
              { text: '로그인', onPress: () => handleLogout() },
            ],
          );
          return;
        }
      }

      // ✅ 함수들을 전달하여 commitChanges 호출
      await commitChanges(
        handleCreateFridge,
        handleUpdateFridge,
        handleDeleteFridge,
      );

      await loadUserFridges();
      Alert.alert('성공', '모든 변경사항이 저장되었습니다.');
    } catch (error) {
      console.error('변경사항 저장 실패:', error);

      if (error.message.includes('403')) {
        console.log('403 에러 발생 - 사용자 ID 불일치 또는 권한 부족');
        Alert.alert(
          '권한 오류',
          '인증 정보에 문제가 있습니다. 다시 로그인해주세요.',
          [
            { text: '취소', style: 'cancel' },
            { text: '로그인', onPress: () => handleLogout() },
          ],
        );
      } else {
        Alert.alert('오류', `변경사항 저장에 실패했습니다: ${error.message}`);
      }
    }
  };

  // Bottom Sheet 토글
  const toggleBottomSheet = () => {
    const newExpanded = !isBottomSheetExpanded;
    setIsBottomSheetExpanded(newExpanded);

    bottomSheetHeight.stopAnimation(() => {
      Animated.timing(bottomSheetHeight, {
        toValue: newExpanded ? 750 : 80,
        duration: 500,
        useNativeDriver: false,
      }).start();
    });
  };

  // 초기화
  useEffect(() => {
    initializeData();
  }, []);

  // 화면 포커스 시 새로고침
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        loadUserFridges();
      }
    }, [currentUser]),
  );

  // 로딩 상태
  if (loading || !currentUser) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>냉장고 목록을 불러오는 중...</Text>
        {permissionLoading && <Text>권한 정보 확인 중...</Text>}
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <FridgeHeader
          currentUser={currentUser}
          isEditMode={isEditMode}
          hasChanges={hasChanges}
          onLogout={handleLogout}
          onEditToggle={handleEditToggle}
          onSaveChanges={handleSaveChanges}
        />

        <FridgeList
          fridges={displayFridges}
          isEditMode={isEditMode}
          onAddFridge={handleAddFridge}
          onEditFridge={handleEditFridge}
          onLeaveFridge={handleLeaveFridge}
          onToggleHidden={toggleHiddenLocally}
          onJoinWithInviteCode={handleJoinWithInviteCode}
          permissions={permissions}
        />

        <HiddenFridgesBottomSheet
          fridges={displayFridges}
          isEditMode={isEditMode}
          isExpanded={isBottomSheetExpanded}
          bottomSheetHeight={bottomSheetHeight}
          onToggleSheet={toggleBottomSheet}
          onEditFridge={handleEditFridge}
          onLeaveFridge={handleLeaveFridge}
          onToggleHidden={toggleHiddenLocally}
          permissions={permissions}
        />

        <FridgeModals
          isAddModalVisible={isAddModalVisible}
          isEditModalVisible={isEditModalVisible}
          editingFridge={editingFridge}
          onCloseAddModal={() => setIsAddModalVisible(false)}
          onCloseEditModal={() => {
            setIsEditModalVisible(false);
            setEditingFridge(null);
          }}
          onAddFridge={serverAddFridge}
          onUpdateFridge={serverUpdateFridge}
        />

        <FridgeModalManager modals={modals} modalHandlers={modalHandlers} />

        <InviteCodeModal
          visible={showInviteCodeModal}
          onClose={() => setShowInviteCodeModal(false)}
          onSubmit={handleInviteCodeSubmit}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default FridgeSelectScreen;
