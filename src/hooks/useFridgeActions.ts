import { useState } from 'react';
import { FridgeWithRole } from '../types/permission';
import { User } from '../types/auth';
import { useLogout } from './Auth/useLogout';
import { FridgeControllerAPI } from '../services/API/fridgeControllerAPI';
import { FridgeUtils } from '../utils/fridgeUtils';

interface UseFridgeActionsParams {
  currentUser: User | null;
  loadUserFridges: () => Promise<void>;
  setEditingFridge: (fridge: FridgeWithRole | null) => void;
  setIsEditModalVisible: (visible: boolean) => void;
  setIsAddModalVisible: (visible: boolean) => void;
  editingFridge: FridgeWithRole | null;
  navigation: any;
}

export const useFridgeActions = ({
  currentUser,
  loadUserFridges,
  setEditingFridge,
  setIsEditModalVisible,
  setIsAddModalVisible,
  editingFridge,
}: UseFridgeActionsParams) => {
  // 모달 상태들
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [notOwnerModalVisible, setNotOwnerModalVisible] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');
  const [hideToggleModalVisible, setHideToggleModalVisible] = useState(false);
  const [validationErrorModalVisible, setValidationErrorModalVisible] =
    useState(false);

  // 처리 중 상태들
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isAddingFridge, setIsAddingFridge] = useState(false);
  const [isDeletingFridge, setIsDeletingFridge] = useState(false);
  const [isUpdatingFridge, setIsUpdatingFridge] = useState(false);
  const [selectedFridge, setSelectedFridge] = useState<FridgeWithRole | null>(
    null,
  );

  const { isLoggingOut, handleLogout: performLogout } = useLogout();

  // 모달 표시 헬퍼
  const showSuccessModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setSuccessModalVisible(true);
  };

  const showErrorModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setErrorModalVisible(true);
  };

  // 유효성 검사 에러 모달 헬퍼
  const showValidationErrorModal = (errors: string[]) => {
    setValidationErrorMessage(errors.join('\n'));
    setValidationErrorModalVisible(true);
  };

  // 로그아웃 관련
  const handleLogout = () => {
    setLogoutConfirmVisible(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutConfirmVisible(false);
    await performLogout();
  };

  // 냉장고 편집 관련
  const handleEditFridge = (fridge: FridgeWithRole) => {
    if (!FridgeUtils.checkPermission(fridge, 'edit')) {
      setNotOwnerModalVisible(true);
      return;
    }
    setEditingFridge(fridge);
    setIsEditModalVisible(true);
  };

  // 냉장고 나가기/삭제 관련
  const handleLeaveFridge = (fridge: FridgeWithRole) => {
    if (!currentUser) return;

    setSelectedFridge(fridge);
    if (fridge.isOwner || fridge.canDelete) {
      setDeleteConfirmVisible(true);
    } else {
      setLeaveConfirmVisible(true);
    }
  };

  // 냉장고 생성
  const handleAddFridge = async (fridgeData: { name: string }) => {
    if (!currentUser || isAddingFridge) return;

    // 유효성 검사
    const validation = FridgeUtils.validateFridgeName(fridgeData.name);
    if (!validation.isValid) {
      showValidationErrorModal(validation.errors);
      return;
    }

    setIsAddingFridge(true);

    try {
      FridgeUtils.debugLog('냉장고 생성 시작', fridgeData);

      // 1. 서버 API 호출
      const response = await FridgeControllerAPI.create(fridgeData);

      // 2. 응답 검증
      if (FridgeControllerAPI.isSuccessResponse(response, 'create')) {
        // 3. 목록 새로고침
        await loadUserFridges();

        // 4. 성공 알림
        showSuccessModal(
          '성공',
          FridgeUtils.getSuccessMessage('create', fridgeData.name),
        );
        setIsAddModalVisible(false);
      } else {
        throw new Error('서버에서 예상치 못한 응답을 받았습니다.');
      }
    } catch (error: any) {
      FridgeUtils.debugLog('냉장고 생성 실패', error);
      const errorMessage = FridgeUtils.getErrorMessage(error, 'create');
      showErrorModal('생성 실패', errorMessage);
    } finally {
      setIsAddingFridge(false);
    }
  };

  // 냉장고 수정
  const handleUpdateFridge = async (updatedData: { name: string }) => {
    if (!currentUser || !editingFridge || isUpdatingFridge) return;

    // 유효성 검사
    const validation = FridgeUtils.validateFridgeName(updatedData.name);
    if (!validation.isValid) {
      showValidationErrorModal(validation.errors);
      return;
    }

    setIsUpdatingFridge(true);

    try {
      FridgeUtils.debugLog('냉장고 수정 시작', {
        fridgeId: String(editingFridge.id),
        updatedData,
      });

      // 1. 서버 API 호출
      const response = await FridgeControllerAPI.update(editingFridge.id, {
        name: updatedData.name,
      });

      // 2. 응답 검증
      if (FridgeControllerAPI.isSuccessResponse(response, 'update')) {
        // 3. 목록 새로고침
        await loadUserFridges();

        // 4. 성공 알림
        showSuccessModal(
          '성공',
          FridgeUtils.getSuccessMessage('update', updatedData.name),
        );
        setIsEditModalVisible(false);
        setEditingFridge(null);
      } else {
        throw new Error('서버에서 예상치 못한 응답을 받았습니다.');
      }
    } catch (error: any) {
      FridgeUtils.debugLog('냉장고 수정 실패', error);
      const errorMessage = FridgeUtils.getErrorMessage(error, 'update');
      showErrorModal('수정 실패', errorMessage);
    } finally {
      setIsUpdatingFridge(false);
    }
  };

  // 냉장고 삭제
  const handleDeleteConfirm = async () => {
    if (!selectedFridge || !currentUser || isDeletingFridge) return;

    setDeleteConfirmVisible(false);
    setIsDeletingFridge(true);

    try {
      FridgeUtils.debugLog('냉장고 삭제 시작', selectedFridge);

      // 1. 서버 API 호출
      const response = await FridgeControllerAPI.delete(selectedFridge.id);

      // 2. 응답 검증
      if (FridgeControllerAPI.isSuccessResponse(response, 'delete')) {
        // 3. 로컬 동기화
        await FridgeUtils.syncDeleteToLocal(selectedFridge.id, currentUser.id);

        // 4. 성공 알림
        showSuccessModal(
          '삭제 완료',
          FridgeUtils.getSuccessMessage('delete', selectedFridge.name),
        );
      } else {
        throw new Error('서버에서 예상치 못한 응답을 받았습니다.');
      }
    } catch (error: any) {
      FridgeUtils.debugLog('냉장고 삭제 실패', error);
      const errorMessage = FridgeUtils.getErrorMessage(error, 'delete');
      showErrorModal('삭제 실패', errorMessage);
    } finally {
      await loadUserFridges();
      setIsDeletingFridge(false);
      setSelectedFridge(null);
    }
  };

  // 냉장고 나가기
  const handleLeaveConfirm = async () => {
    if (!currentUser || !selectedFridge) return;

    setLeaveConfirmVisible(false);
    try {
      const success = await FridgeUtils.syncDeleteToLocal(
        selectedFridge.id,
        currentUser.id,
      );

      if (success) {
        await loadUserFridges();
        showSuccessModal('성공', '냉장고에서 나왔습니다.');
      } else {
        showErrorModal('오류', '냉장고 나가기에 실패했습니다.');
      }
    } catch (error) {
      console.error('냉장고 나가기 실패:', error);
      showErrorModal('오류', '냉장고 나가기에 실패했습니다.');
    }
    setSelectedFridge(null);
  };

  return {
    // 액션 핸들러들
    handleLogout,
    handleAddFridge,
    handleEditFridge,
    handleLeaveFridge,
    handleUpdateFridge,

    // 상태들
    isLoggingOut,
    isAddingFridge,
    isDeletingFridge,
    isUpdatingFridge,

    // 모달 관련
    modals: {
      modalTitle,
      modalMessage,
      selectedFridge,
      errorModalVisible,
      leaveConfirmVisible,
      successModalVisible,
      logoutConfirmVisible,
      notOwnerModalVisible,
      deleteConfirmVisible,
      validationErrorMessage,
      hideToggleModalVisible,
      validationErrorModalVisible,
    },
    modalHandlers: {
      handleLeaveConfirm,
      handleLogoutConfirm,
      handleDeleteConfirm,
      setErrorModalVisible,
      setLeaveConfirmVisible,
      setSuccessModalVisible,
      setDeleteConfirmVisible,
      setLogoutConfirmVisible,
      setNotOwnerModalVisible,
      setHideToggleModalVisible,
      setValidationErrorModalVisible,
    },
  };
};
