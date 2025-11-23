import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//
import { useGroceryList } from '../../hooks/useGroceryList';
import Buttons from '../../components/ShoppingList/Buttons';
import ConfirmModal from '../../components/modals/ConfirmModal';
import FlushConfirmModal from '../../components/ShoppingList/FlushConfirmModal';
import ShoppingListHeader from '../../components/ShoppingList/ShoppingListHeader';
import ItemDeleteConfirmModal from '../../components/ShoppingList/ItemDeleteConfirmModal';
//
import { useEditMode } from '../../hooks/ShoppingList/useEditMode';
import ShoppingListEmpty from '../../components/ShoppingList/ShoppingListEmpty';
import ShoppingListFooter from '../../components/ShoppingList/ShoppingListFooter';
import { useShoppingListInit } from '../../hooks/ShoppingList/useShoppingListInit';
import ShoppingListContent from '../../components/ShoppingList/ShoppingListContent';
import { useShoppingListModals } from '../../hooks/ShoppingList/useShoppingListModals';
import {
  ShoppingListScreenProps,
  CartItem,
} from '../../types/shoppingListTypes';
//
import { styles } from './styles';

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ route }) => {
  const { fridgeId, fridgeName } = route.params;

  // 모달 상태 관리
  const {
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
  } = useShoppingListModals();

  // 초기화
  const { groceryListId, isInitializing } = useShoppingListInit(
    fridgeId,
    showErrorModal,
  );

  // 장바구니 데이터 및 작업
  const {
    cartItems,
    isLoading,
    isSyncing,
    addItem,
    updateSingleItem,
    updateMultipleItems,
    deleteItem,
    deleteCheckedItems,
    refresh,
  } = useGroceryList(groceryListId);

  // 편집 모드 관리
  const {
    isEditMode,
    pendingChanges,
    itemRefs,
    handleEditToggle,
    handleNameChange,
    handleQuantityChange,
    handleUnitChange,
    clearPendingChange,
  } = useEditMode();

  const hasCheckedItems = cartItems.some(item => item.purchased);

  // 화면 포커스 시 새로고침
  useFocusEffect(
    useCallback(() => {
      if (groceryListId) {
        refresh();
      }
    }, [groceryListId, refresh]),
  );

  // 편집 모드 토글
  const onEditToggle = () => {
    handleEditToggle(updateMultipleItems, () => {
      showErrorModal('오류', '변경사항 저장에 실패했습니다.');
    });
  };

  // 체크된 아이템 삭제
  const handleClearCheckedItems = () => {
    const checkedItems = cartItems.filter(item => item.purchased);
    if (checkedItems.length === 0) return;
    openClearModal();
  };

  const handleConfirmClear = async () => {
    try {
      await deleteCheckedItems();
      closeClearModal();
    } catch (error) {
      // console.error('[ShoppingList] 체크된 아이템 삭제 실패', error);
    }
  };

  // 드래그 종료
  const handleDragEnd = ({ data }: { data: CartItem[] }) => {
    // UI만 업데이트 (서버에는 안 보냄)
  };

  // 체크박스 토글
  const handleToggleCheck = useCallback(
    async (itemId: number) => {
      const item = cartItems.find(i => i.id === itemId);
      if (!item) return;

      try {
        await updateSingleItem(itemId, {
          purchased: !item.purchased,
        });
      } catch (error) {}
    },
    [cartItems, updateSingleItem],
  );

  // 아이템 삭제
  const handleDeleteItem = useCallback(
    (itemId: number) => {
      const itemToDeleteData = cartItems.find(item => item.id === itemId);
      if (!itemToDeleteData) return;
      openDeleteModal(itemToDeleteData);
    },
    [cartItems, openDeleteModal],
  );

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete.id);
      clearPendingChange(itemToDelete.id);
      closeDeleteModal();
    } catch (error) {
      // console.error('[ShoppingList] 아이템 삭제 실패', error);
      closeDeleteModal();
    }
  };

  // 새 아이템 추가
  const handleAddNewItem = async (
    name: string,
    quantity: number,
    unit: string,
  ) => {
    if (!name.trim()) {
      showErrorModal('알림', '식재료 이름을 입력해주세요.');
      stopAddingItem();
      return;
    }

    if (quantity <= 0) {
      showErrorModal('알림', '올바른 수량을 입력해주세요.');
      stopAddingItem();
      return;
    }

    try {
      await addItem(name.trim(), quantity, unit);
      stopAddingItem();
    } catch (error) {
      // console.error('[ShoppingList] 아이템 추가 실패', error);
      showErrorModal('오류', '아이템 추가에 실패했습니다.');
      stopAddingItem();
    }
  };

  // 초기화 중 로딩
  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ShoppingListHeader listName={fridgeName} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F4858" />
          <Text style={styles.loadingText}>장바구니 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // displayItems 생성 (cartItems + pendingChanges)
  const displayItems = cartItems.map(item => {
    const changes = pendingChanges.get(item.id);
    return changes ? { ...item, ...changes } : item;
  });

  // 푸터 렌더링
  const renderFooter = () => (
    <ShoppingListFooter
      isEditMode={isEditMode}
      isAddingNewItem={isAddingNewItem}
      isSyncing={isSyncing}
      onStartAddItem={startAddingItem}
      onAddNewItem={handleAddNewItem}
      onCancelAddItem={stopAddingItem}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ShoppingListHeader listName={fridgeName} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Buttons
          isListEditMode={isEditMode}
          onEditModeToggle={onEditToggle}
          onClearCheckedItems={handleClearCheckedItems}
          hasCheckedItems={hasCheckedItems}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2F4858" />
            <Text style={styles.loadingText}>데이터 불러오는 중...</Text>
          </View>
        ) : displayItems.length === 0 ? (
          <ShoppingListEmpty
            isAddingNewItem={isAddingNewItem}
            isSyncing={isSyncing}
            onStartAddItem={startAddingItem}
            onAddNewItem={handleAddNewItem}
            onCancelAddItem={stopAddingItem}
          />
        ) : (
          <ShoppingListContent
            displayItems={displayItems}
            isEditMode={isEditMode}
            pendingChanges={pendingChanges}
            itemRefs={itemRefs}
            onToggleCheck={handleToggleCheck}
            onNameChange={handleNameChange}
            onQuantityChange={handleQuantityChange}
            onUnitChange={handleUnitChange}
            onDelete={handleDeleteItem}
            onDragEnd={handleDragEnd}
            renderFooter={renderFooter}
          />
        )}
      </KeyboardAvoidingView>

      {/* 모달들 */}
      <ItemDeleteConfirmModal
        visible={showDeleteModal}
        itemName={itemToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />

      <FlushConfirmModal
        visible={showClearModal}
        itemCount={cartItems.filter(item => item.purchased).length}
        onConfirm={handleConfirmClear}
        onCancel={closeClearModal}
      />

      <ConfirmModal
        isAlert={false}
        visible={errorModalVisible}
        title={errorModalTitle}
        message={errorModalMessage}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={closeErrorModal}
        onCancel={closeErrorModal}
      />
    </SafeAreaView>
  );
};

export default ShoppingListScreen;
