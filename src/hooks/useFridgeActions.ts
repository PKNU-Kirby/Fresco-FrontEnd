import { useState } from 'react';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../services/AsyncStorageService';
import { User } from '../types/auth';

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
  navigation,
}: UseFridgeActionsParams) => {
  // 모달 상태들
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [notOwnerModalVisible, setNotOwnerModalVisible] = useState(false);
  const [hideToggleModalVisible, setHideToggleModalVisible] = useState(false);

  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [selectedFridge, setSelectedFridge] = useState<FridgeWithRole | null>(
    null,
  );

  const handleLogout = () => {
    setLogoutConfirmVisible(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutConfirmVisible(false);
    await AsyncStorageService.clearCurrentUser();
    navigation.replace('Login');
  };

  const handleEditFridge = (fridge: FridgeWithRole) => {
    if (!fridge.isOwner) {
      setNotOwnerModalVisible(true);
      return;
    }
    setEditingFridge(fridge);
    setIsEditModalVisible(true);
  };

  const handleLeaveFridge = (fridge: FridgeWithRole) => {
    if (!currentUser) return;

    setSelectedFridge(fridge);
    if (fridge.isOwner) {
      setDeleteConfirmVisible(true);
    } else {
      setLeaveConfirmVisible(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFridge) return;

    setDeleteConfirmVisible(false);
    try {
      const success = await AsyncStorageService.deleteRefrigerator(
        parseInt(selectedFridge.id, 10),
      );
      if (success) {
        await loadUserFridges();
        setModalTitle('성공');
        setModalMessage('냉장고가 삭제되었습니다.');
        setSuccessModalVisible(true);
      } else {
        setModalTitle('오류');
        setModalMessage('냉장고 삭제에 실패했습니다.');
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error('Delete fridge error:', error);
      setModalTitle('오류');
      setModalMessage('냉장고 삭제에 실패했습니다.');
      setErrorModalVisible(true);
    }
    setSelectedFridge(null);
  };

  const handleLeaveConfirm = async () => {
    if (!currentUser || !selectedFridge) return;

    setLeaveConfirmVisible(false);
    try {
      const success = await AsyncStorageService.removeUserFromRefrigerator(
        parseInt(selectedFridge.id, 10),
        parseInt(currentUser.id, 10),
      );
      if (success) {
        await loadUserFridges();
        setModalTitle('성공');
        setModalMessage('냉장고에서 나왔습니다.');
        setSuccessModalVisible(true);
      } else {
        setModalTitle('오류');
        setModalMessage('냉장고 나가기에 실패했습니다.');
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error('Leave fridge error:', error);
      setModalTitle('오류');
      setModalMessage('냉장고 나가기에 실패했습니다.');
      setErrorModalVisible(true);
    }
    setSelectedFridge(null);
  };

  const handleToggleHidden = async (fridge: FridgeWithRole) => {
    if (!currentUser) return;

    try {
      await AsyncStorageService.setFridgeHidden(
        parseInt(currentUser.id, 10),
        parseInt(fridge.id, 10),
        !fridge.isHidden,
      );
      await loadUserFridges();

      const message = fridge.isHidden
        ? '냉장고를 표시했습니다.'
        : '냉장고를 숨겼습니다.';
      setModalTitle('성공');
      setModalMessage(message);
      setHideToggleModalVisible(true);
    } catch (error) {
      console.error('Toggle hidden error:', error);
      setModalTitle('오류');
      setModalMessage('냉장고 숨김 설정에 실패했습니다.');
      setErrorModalVisible(true);
    }
  };

  const handleAddFridge = async (fridgeData: { name: string }) => {
    if (!currentUser) return;

    try {
      const result = await AsyncStorageService.createRefrigerator(
        fridgeData.name,
        parseInt(currentUser.id, 10),
      );

      if (result) {
        await loadUserFridges();
        setModalTitle('성공');
        setModalMessage('새 냉장고가 생성되었습니다.');
        setSuccessModalVisible(true);
        setIsAddModalVisible(false);
      }
    } catch (error) {
      console.error('Add fridge error:', error);
      setModalTitle('오류');
      setModalMessage('냉장고 생성에 실패했습니다.');
      setErrorModalVisible(true);
    }
  };

  const handleUpdateFridge = async (updatedData: { name: string }) => {
    if (!currentUser || !editingFridge) return;

    try {
      await AsyncStorageService.updateRefrigerator(
        parseInt(editingFridge.id, 10),
        {
          name: updatedData.name,
        },
      );

      await loadUserFridges();
      setModalTitle('성공');
      setModalMessage('냉장고 정보가 업데이트되었습니다.');
      setSuccessModalVisible(true);
      setIsEditModalVisible(false);
      setEditingFridge(null);
    } catch (error) {
      console.error('Update fridge error:', error);
      setModalTitle('오류');
      setModalMessage('냉장고 정보 업데이트에 실패했습니다.');
      setErrorModalVisible(true);
    }
  };

  return {
    handleLogout,
    handleEditFridge,
    handleLeaveFridge,
    handleToggleHidden,
    handleAddFridge,
    handleUpdateFridge,
    // 모달 상태와 핸들러들
    modals: {
      logoutConfirmVisible,
      deleteConfirmVisible,
      leaveConfirmVisible,
      successModalVisible,
      errorModalVisible,
      notOwnerModalVisible,
      hideToggleModalVisible,
      modalMessage,
      modalTitle,
      selectedFridge,
    },
    modalHandlers: {
      setLogoutConfirmVisible,
      setDeleteConfirmVisible,
      setLeaveConfirmVisible,
      setSuccessModalVisible,
      setErrorModalVisible,
      setNotOwnerModalVisible,
      setHideToggleModalVisible,
      handleLogoutConfirm,
      handleDeleteConfirm,
      handleLeaveConfirm,
    },
  };
};
