import React from 'react';
import ConfirmModal from '../modals/ConfirmModal';
import { FridgeWithRole } from '../../types/permission';

interface ModalState {
  logoutConfirmVisible: boolean;
  deleteConfirmVisible: boolean;
  leaveConfirmVisible: boolean;
  successModalVisible: boolean;
  errorModalVisible: boolean;
  notOwnerModalVisible: boolean;
  hideToggleModalVisible: boolean;
  modalMessage: string;
  modalTitle: string;
  selectedFridge: FridgeWithRole | null;
}

interface ModalHandlers {
  setLogoutConfirmVisible: (visible: boolean) => void;
  setDeleteConfirmVisible: (visible: boolean) => void;
  setLeaveConfirmVisible: (visible: boolean) => void;
  setSuccessModalVisible: (visible: boolean) => void;
  setErrorModalVisible: (visible: boolean) => void;
  setNotOwnerModalVisible: (visible: boolean) => void;
  setHideToggleModalVisible: (visible: boolean) => void;
  handleLogoutConfirm: () => Promise<void>;
  handleDeleteConfirm: () => Promise<void>;
  handleLeaveConfirm: () => Promise<void>;
}

interface FridgeModalManagerProps {
  modals: ModalState;
  modalHandlers: ModalHandlers;
}

export const FridgeModalManager: React.FC<FridgeModalManagerProps> = ({
  modals,
  modalHandlers,
}) => {
  return (
    <>
      {/* 로그아웃 확인 */}
      <ConfirmModal
        isAlert={true}
        visible={modals.logoutConfirmVisible}
        title="로그아웃"
        message="정말 로그아웃하시겠습니까?"
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="로그아웃"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={modalHandlers.handleLogoutConfirm}
        onCancel={() => modalHandlers.setLogoutConfirmVisible(false)}
      />

      {/* 냉장고 삭제 확인 */}
      <ConfirmModal
        isAlert={true}
        visible={modals.deleteConfirmVisible}
        title="냉장고 삭제"
        message={`${modals.selectedFridge?.name}을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="삭제"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={modalHandlers.handleDeleteConfirm}
        onCancel={() => modalHandlers.setDeleteConfirmVisible(false)}
      />

      {/* 냉장고 나가기 확인 */}
      <ConfirmModal
        isAlert={true}
        visible={modals.leaveConfirmVisible}
        title="냉장고 나가기"
        message={`${modals.selectedFridge?.name}에서 나가시겠습니까?`}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="나가기"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={modalHandlers.handleLeaveConfirm}
        onCancel={() => modalHandlers.setLeaveConfirmVisible(false)}
      />

      {/* 권한 없음 */}
      <ConfirmModal
        isAlert={false}
        visible={modals.notOwnerModalVisible}
        title="알림"
        message="냉장고 소유자만 편집할 수 있습니다."
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{
          name: 'error-outline',
          color: 'tomato',
          size: 48,
        }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => modalHandlers.setNotOwnerModalVisible(false)}
        onCancel={() => modalHandlers.setNotOwnerModalVisible(false)}
      />

      {/* 성공 */}
      <ConfirmModal
        isAlert={false}
        visible={modals.successModalVisible}
        title={modals.modalTitle}
        message={modals.modalMessage}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{
          name: 'check',
          color: 'limegreen',
          size: 48,
        }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => modalHandlers.setSuccessModalVisible(false)}
        onCancel={() => modalHandlers.setSuccessModalVisible(false)}
      />

      {/* 에러 */}
      <ConfirmModal
        isAlert={false}
        visible={modals.errorModalVisible}
        title={modals.modalTitle}
        message={modals.modalMessage}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => modalHandlers.setErrorModalVisible(false)}
        onCancel={() => modalHandlers.setErrorModalVisible(false)}
      />

      {/* 숨김 토글 */}
      <ConfirmModal
        isAlert={false}
        visible={modals.hideToggleModalVisible}
        title={modals.modalTitle}
        message={modals.modalMessage}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => modalHandlers.setHideToggleModalVisible(false)}
        onCancel={() => modalHandlers.setHideToggleModalVisible(false)}
      />
    </>
  );
};
