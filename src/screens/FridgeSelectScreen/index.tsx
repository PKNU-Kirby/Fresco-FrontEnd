import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, Animated, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFridgeSelect } from '../../hooks/useFridgeSelect';
import { useFridgeActions } from '../../hooks/useFridgeActions';
import { useOptimisticEdit } from '../../hooks/useOptimisticEdit';
import { FridgeControllerAPI } from '../../services/API/fridgeControllerAPI';
import { FridgeWithRole } from '../../types/permission';
import { validateUserTokenMatch } from '../../utils/authUtils';
import { FridgeModals } from '../../components/FridgeSelect/FridgeModal';
import { FridgeHeader } from '../../components/FridgeSelect/FridgeHeader';
import { FridgeList } from '../../components/FridgeSelect/FridgeList';
import { FridgeModalManager } from '../../components/FridgeSelect/FridgeModalManager';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { styles } from './styles';

const FridgeSelectScreen = () => {
  const navigation = useNavigation<any>();

  const {
    currentUser,
    fridges: serverFridges,
    loading,
    initializeData,
    loadUserFridges,
  } = useFridgeSelect(navigation);

  // Optimistic Update 관리
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

  // ✅ 권한 체크 헬퍼 함수들
  const hasPermission = (
    fridgeId: number,
    action: 'edit' | 'delete' | 'view',
  ) => {
    const fridge = displayFridges.find(f => f.id === fridgeId);
    if (!fridge) return false;
    if (action === 'view') return true;
    if (action === 'edit') return fridge.canEdit ?? fridge.isOwner;
    if (action === 'delete') return fridge.canDelete ?? fridge.isOwner;
    return false;
  };

  const getPermission = (fridgeId: number) => {
    const fridge = displayFridges.find(f => f.id === fridgeId);
    if (!fridge) return null;
    return {
      fridgeId: fridge.id,
      role: fridge.role === 'owner' ? 'OWNER' : 'MEMBER',
      canEdit: fridge.canEdit ?? fridge.isOwner,
      canDelete: fridge.canDelete ?? fridge.isOwner,
    };
  };

  // UI 상태
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFridge, setEditingFridge] = useState<FridgeWithRole | null>(
    null,
  );
  const [bottomSheetHeight] = useState(new Animated.Value(80));
  const [_isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  // 👇 추가 모달 상태들
  const [noAccessModalVisible, setNoAccessModalVisible] = useState(false);
  const [noEditPermissionModalVisible, setNoEditPermissionModalVisible] =
    useState(false);
  const [noDeletePermissionModalVisible, setNoDeletePermissionModalVisible] =
    useState(false);
  const [noPermissionModalVisible, setNoPermissionModalVisible] =
    useState(false);
  const [editCancelConfirmVisible, setEditCancelConfirmVisible] =
    useState(false);
  const [saveSuccessModalVisible, setSaveSuccessModalVisible] = useState(false);
  const [authErrorModalVisible, setAuthErrorModalVisible] = useState(false);
  const [permissionErrorModalVisible, setPermissionErrorModalVisible] =
    useState(false);
  const [saveErrorModalVisible, setSaveErrorModalVisible] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [editPromptVisible, setEditPromptVisible] = useState(false);
  const [editPromptFridge, setEditPromptFridge] =
    useState<FridgeWithRole | null>(null);
  const [editPromptInput, setEditPromptInput] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteConfirmFridge, setDeleteConfirmFridge] =
    useState<FridgeWithRole | null>(null);
  const [addPromptVisible, setAddPromptVisible] = useState(false);
  const [addPromptInput, setAddPromptInput] = useState('');

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

  const handleCreateFridge = async (name: string) => {
    try {
      const response = await FridgeControllerAPI.create({ name });
      console.log('냉장고 생성 완료:', response);
      return response;
    } catch (error) {
      console.error('냉장고 생성 실패:', error);
      throw error;
    }
  };

  const handleUpdateFridge = async (id: number, name: string) => {
    try {
      const response = await FridgeControllerAPI.update(Number(id), { name });
      console.log('냉장고 업데이트 완료:', response);
      return response;
    } catch (error) {
      console.error('냉장고 업데이트 실패:', error);
      throw error;
    }
  };

  const handleDeleteFridge = async (id: number) => {
    try {
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
      if (hasPermission(fridge.id, 'view')) {
        navigation.navigate('FridgeDetail', { fridgeId: fridge.id });
      } else {
        setNoAccessModalVisible(true);
      }
      return;
    }

    // 편집 모드에서는 이름 변경
    if (!hasPermission(fridge.id, 'edit')) {
      setNoEditPermissionModalVisible(true);
      return;
    }

    setEditPromptFridge(fridge);
    setEditPromptInput(fridge.name);
    setEditPromptVisible(true);
  };

  const handleEditPromptConfirm = () => {
    if (editPromptFridge && editPromptInput && editPromptInput.trim()) {
      editFridgeLocally(editPromptFridge.id, editPromptInput.trim());
    }
    setEditPromptVisible(false);
    setEditPromptFridge(null);
    setEditPromptInput('');
  };

  const handleLeaveFridge = (fridge: FridgeWithRole) => {
    if (!isEditMode) return;

    const permission = getPermission(fridge.id);
    if (!permission) {
      setNoPermissionModalVisible(true);
      return;
    }

    const isOwner = permission.role === 'OWNER';

    if (isOwner && !hasPermission(fridge.id, 'delete')) {
      setNoDeletePermissionModalVisible(true);
      return;
    }

    setDeleteConfirmFridge(fridge);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmFridge) {
      deleteFridgeLocally(deleteConfirmFridge.id);
    }
    setDeleteConfirmVisible(false);
    setDeleteConfirmFridge(null);
  };

  const handleAddFridge = () => {
    if (!isEditMode) {
      setIsAddModalVisible(true);
      return;
    }

    setAddPromptInput('');
    setAddPromptVisible(true);
  };

  const handleAddPromptConfirm = () => {
    if (addPromptInput && addPromptInput.trim()) {
      addFridgeLocally(addPromptInput.trim());
    }
    setAddPromptVisible(false);
    setAddPromptInput('');
  };

  // 편집 모드 토글
  const handleEditToggle = () => {
    if (isEditMode) {
      if (hasChanges) {
        setEditCancelConfirmVisible(true);
      } else {
        cancelEdit(serverFridges);
        setIsBottomSheetExpanded(false);
        bottomSheetHeight.setValue(80);
      }
    } else {
      startEdit(serverFridges);
    }
  };

  const handleEditCancelConfirm = () => {
    cancelEdit(serverFridges);
    setIsBottomSheetExpanded(false);
    bottomSheetHeight.setValue(80);
    setEditCancelConfirmVisible(false);
  };

  const handleSaveChanges = async () => {
    try {
      // 사용자 ID와 토큰 일치성 검증
      if (currentUser?.id) {
        const { isValid, needsReauth, tokenUserId } =
          await validateUserTokenMatch(currentUser.id);

        if (!isValid) {
          console.log(
            `사용자 ID 불일치! 현재: ${currentUser.id}, 토큰: ${tokenUserId}`,
          );
          setAuthErrorModalVisible(true);
          return;
        }
      }

      await commitChanges(
        handleCreateFridge,
        handleUpdateFridge,
        handleDeleteFridge,
      );
      await loadUserFridges();
      setSaveSuccessModalVisible(true);
    } catch (error) {
      console.error('변경사항 저장 실패:', error);
      if (error.message.includes('403')) {
        console.log('403 에러 발생 - 사용자 ID 불일치 또는 권한 부족');
        setPermissionErrorModalVisible(true);
      } else {
        setSaveErrorMessage(`변경사항 저장에 실패했습니다: ${error.message}`);
        setSaveErrorModalVisible(true);
      }
    }
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F4858" />
          <Text style={styles.loadingText}>냉장고 목록을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container} edges={['top']}>
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
          permissions={[]}
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

        {/* 접근 권한 없음 */}
        <ConfirmModal
          isAlert={false}
          visible={noAccessModalVisible}
          title="알림"
          message="이 냉장고에 접근할 권한이 없습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setNoAccessModalVisible(false)}
          onCancel={() => setNoAccessModalVisible(false)}
        />

        {/* 편집 권한 없음 */}
        <ConfirmModal
          isAlert={false}
          visible={noEditPermissionModalVisible}
          title="알림"
          message="이 냉장고를 편집할 권한이 없습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setNoEditPermissionModalVisible(false)}
          onCancel={() => setNoEditPermissionModalVisible(false)}
        />

        {/* 삭제 권한 없음 */}
        <ConfirmModal
          isAlert={false}
          visible={noDeletePermissionModalVisible}
          title="알림"
          message="이 냉장고를 삭제할 권한이 없습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setNoDeletePermissionModalVisible(false)}
          onCancel={() => setNoDeletePermissionModalVisible(false)}
        />

        {/* 권한 없음 (일반) */}
        <ConfirmModal
          isAlert={false}
          visible={noPermissionModalVisible}
          title="알림"
          message="이 냉장고에 대한 권한이 없습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setNoPermissionModalVisible(false)}
          onCancel={() => setNoPermissionModalVisible(false)}
        />

        {/* 편집 취소 확인 */}
        <ConfirmModal
          isAlert={true}
          visible={editCancelConfirmVisible}
          title="편집 취소"
          message="변경사항이 저장되지 않습니다. 정말 취소하시겠습니까?"
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="취소"
          cancelText="계속 편집"
          confirmButtonStyle="danger"
          onConfirm={handleEditCancelConfirm}
          onCancel={() => setEditCancelConfirmVisible(false)}
        />

        {/* 저장 성공 */}
        <ConfirmModal
          isAlert={false}
          visible={saveSuccessModalVisible}
          title="성공"
          message="모든 변경사항이 저장되었습니다."
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'check', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setSaveSuccessModalVisible(false)}
          onCancel={() => setSaveSuccessModalVisible(false)}
        />

        {/* 인증 오류 */}
        <ConfirmModal
          isAlert={true}
          visible={authErrorModalVisible}
          title="인증 오류"
          message="사용자 인증 정보가 일치하지 않습니다. 다시 로그인해주세요."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="로그인"
          cancelText="취소"
          confirmButtonStyle="danger"
          onConfirm={() => {
            setAuthErrorModalVisible(false);
            handleLogout();
          }}
          onCancel={() => setAuthErrorModalVisible(false)}
        />

        {/* 권한 오류 */}
        <ConfirmModal
          isAlert={true}
          visible={permissionErrorModalVisible}
          title="권한 오류"
          message="인증 정보에 문제가 있습니다. 다시 로그인해주세요."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="로그인"
          cancelText="취소"
          confirmButtonStyle="danger"
          onConfirm={() => {
            setPermissionErrorModalVisible(false);
            handleLogout();
          }}
          onCancel={() => setPermissionErrorModalVisible(false)}
        />

        {/* 저장 오류 */}
        <ConfirmModal
          isAlert={false}
          visible={saveErrorModalVisible}
          title="오류"
          message={saveErrorMessage}
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setSaveErrorModalVisible(false)}
          onCancel={() => setSaveErrorModalVisible(false)}
        />

        {/* 이름 편집 프롬프트 - 입력 기능 추가 */}
        <ConfirmModal
          isAlert={true}
          visible={editPromptVisible}
          title="모임명 변경하기"
          message=""
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'edit', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText="취소"
          confirmButtonStyle="primary"
          showInput={true}
          inputValue={editPromptInput}
          inputPlaceholder="냉장고 이름을 입력하세요"
          onInputChange={setEditPromptInput}
          onConfirm={handleEditPromptConfirm}
          onCancel={() => {
            setEditPromptVisible(false);
            setEditPromptFridge(null);
            setEditPromptInput('');
          }}
        />

        {/* 삭제/나가기 확인 */}
        <ConfirmModal
          isAlert={true}
          visible={deleteConfirmVisible}
          title={`냉장고 ${
            deleteConfirmFridge?.role === 'owner' ? '삭제' : '나가기'
          }`}
          message={`${deleteConfirmFridge?.name}을(를) ${
            deleteConfirmFridge?.role === 'owner' ? '삭제' : '나가기'
          }하시겠습니까?`}
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText={
            deleteConfirmFridge?.role === 'owner' ? '삭제' : '나가기'
          }
          cancelText="취소"
          confirmButtonStyle="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteConfirmVisible(false);
            setDeleteConfirmFridge(null);
          }}
        />

        {/* 냉장고 추가 프롬프트 - 입력 기능 추가 */}
        <ConfirmModal
          isAlert={true}
          visible={addPromptVisible}
          title="새 냉장고"
          message=""
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'add', color: 'limegreen', size: 48 }}
          confirmText="추가"
          cancelText="취소"
          confirmButtonStyle="primary"
          showInput={true}
          inputValue={addPromptInput}
          inputPlaceholder="냉장고 이름을 입력하세요"
          onInputChange={setAddPromptInput}
          onConfirm={handleAddPromptConfirm}
          onCancel={() => {
            setAddPromptVisible(false);
            setAddPromptInput('');
          }}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default FridgeSelectScreen;
