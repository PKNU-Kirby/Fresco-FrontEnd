import { useState, useCallback } from 'react';
import { CartItem } from '../../types/shoppingListTypes';

interface UseShoppingListModalsResult {
  // Delete Modal
  showDeleteModal: boolean;
  itemToDelete: CartItem | null;
  openDeleteModal: (item: CartItem) => void;
  closeDeleteModal: () => void;

  // Clear Modal
  showClearModal: boolean;
  openClearModal: () => void;
  closeClearModal: () => void;

  // Error Modal
  errorModalVisible: boolean;
  errorModalTitle: string;
  errorModalMessage: string;
  showErrorModal: (title: string, message: string) => void;
  closeErrorModal: () => void;

  // Add Item
  isAddingNewItem: boolean;
  startAddingItem: () => void;
  stopAddingItem: () => void;
}

export const useShoppingListModals = (): UseShoppingListModalsResult => {
  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  const openDeleteModal = useCallback((item: CartItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }, []);

  // Clear Modal
  const [showClearModal, setShowClearModal] = useState(false);

  const openClearModal = useCallback(() => {
    setShowClearModal(true);
  }, []);

  const closeClearModal = useCallback(() => {
    setShowClearModal(false);
  }, []);

  // Error Modal
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  const showErrorModal = useCallback((title: string, message: string) => {
    setErrorModalTitle(title);
    setErrorModalMessage(message);
    setErrorModalVisible(true);
  }, []);

  const closeErrorModal = useCallback(() => {
    setErrorModalVisible(false);
  }, []);

  // Add Item
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);

  const startAddingItem = useCallback(() => {
    setIsAddingNewItem(true);
  }, []);

  const stopAddingItem = useCallback(() => {
    setIsAddingNewItem(false);
  }, []);

  return {
    showDeleteModal,
    itemToDelete,
    openDeleteModal,
    closeDeleteModal,
    showClearModal,
    openClearModal,
    closeClearModal,
    errorModalVisible,
    errorModalTitle,
    errorModalMessage,
    showErrorModal,
    closeErrorModal,
    isAddingNewItem,
    startAddingItem,
    stopAddingItem,
  };
};
