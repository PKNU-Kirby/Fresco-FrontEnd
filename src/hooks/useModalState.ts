import {useState} from 'react';

export const useModalState = () => {
  const [isStorageModalVisible, setIsStorageModalVisible] = useState(false);
  const [isItemCategoryModalVisible, setIsItemCategoryModalVisible] =
    useState(false);

  const openStorageModal = () => setIsStorageModalVisible(true);
  const closeStorageModal = () => setIsStorageModalVisible(false);

  const openItemCategoryModal = () => setIsItemCategoryModalVisible(true);
  const closeItemCategoryModal = () => setIsItemCategoryModalVisible(false);

  return {
    isStorageModalVisible,
    isItemCategoryModalVisible,
    openStorageModal,
    closeStorageModal,
    openItemCategoryModal,
    closeItemCategoryModal,
  };
};
