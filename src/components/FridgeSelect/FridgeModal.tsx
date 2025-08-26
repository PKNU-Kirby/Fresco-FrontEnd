import React from 'react';
import FridgeModalForm from './FridgeModalForm';
import { FridgeWithRole } from '../../services/AsyncStorageService';

interface FridgeModalsProps {
  isAddModalVisible: boolean;
  isEditModalVisible: boolean;
  editingFridge: FridgeWithRole | null;
  onCloseAddModal: () => void;
  onCloseEditModal: () => void;
  onAddFridge: (fridgeData: { name: string }) => void;
  onUpdateFridge: (updatedData: { name: string }) => void;
}

export const FridgeModals: React.FC<FridgeModalsProps> = ({
  isAddModalVisible,
  isEditModalVisible,
  editingFridge,
  onCloseAddModal,
  onCloseEditModal,
  onAddFridge,
  onUpdateFridge,
}) => {
  return (
    <>
      {isAddModalVisible && (
        <FridgeModalForm onClose={onCloseAddModal} onAddFridge={onAddFridge} />
      )}

      {isEditModalVisible && editingFridge && (
        <FridgeModalForm
          onClose={onCloseEditModal}
          onAddFridge={onUpdateFridge}
          editMode={true}
          initialFridge={editingFridge}
        />
      )}
    </>
  );
};
