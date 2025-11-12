import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  View,
  Text,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DraggableFlatList from 'react-native-draggable-flatlist';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useGroceryList } from '../../hooks/useGroceryList';
import { FridgeControllerAPI } from '../../services/API/fridgeControllerAPI';
import ConfirmModal from '../../components/modals/ConfirmModal';

import Buttons from '../../components/ShoppingList/Buttons';
import NewItemCard from '../../components/ShoppingList/NewItemCard';
import CartItemCard from '../../components/ShoppingList/CartItemCard';
import FlushConfirmModal from '../../components/ShoppingList/FlushConfirmModal';
import ShoppingListHeader from '../../components/ShoppingList/ShoppingListHeader';
import ItemDeleteConfirmModal from '../../components/ShoppingList/ItemDeleteConfirmModal';

import { styles, addItemStyles } from './styles';

export interface CartItem {
  id: number;
  groceryListId: number;
  name: string;
  quantity: number;
  purchased: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  unit: string;
  order: number;
}

interface ShoppingListScreenProps {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
    };
  };
}

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ route }) => {
  const { fridgeId, fridgeName } = route.params;

  const [groceryListId, setGroceryListId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

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

  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);

  // 편집 중인 변경사항은 로컬에 저장
  const [pendingChanges, setPendingChanges] = useState<
    Map<number, Partial<CartItem>>
  >(new Map());

  const itemRefs = useRef<Map<number, any>>(new Map());

  const hasCheckedItems = cartItems.some(item => item.purchased);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // fridgeId로 groceryListId 가져옴
  useEffect(() => {
    const fetchGroceryListId = async () => {
      try {
        setIsInitializing(true);
        const response = await FridgeControllerAPI.getList();

        const fridges = Array.isArray(response)
          ? response
          : response?.result || response?.data || [];

        if (!Array.isArray(fridges)) {
          setErrorModalTitle('오류');
          setErrorModalMessage('냉장고 목록 형식이 올바르지 않습니다.');
          setErrorModalVisible(true);
          return;
        }

        const currentFridge =
          fridges.find((f: any) => f.id === fridgeId) ||
          fridges.find((f: any) => Number(f.id) === Number(fridgeId));

        if (currentFridge?.groceryListId) {
          setGroceryListId(currentFridge.groceryListId);
        } else {
          setErrorModalTitle('오류');
          setErrorModalMessage('장바구니 정보를 찾을 수 없습니다.');
          setErrorModalVisible(true);
        }
      } catch (error) {
        // console.error('[ShoppingList] groceryListId 조회 실패', error);
        setErrorModalTitle('오류');
        setErrorModalMessage('장바구니 정보를 불러올 수 없습니다.');
        setErrorModalVisible(true);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchGroceryListId();
  }, [fridgeId]);

  useFocusEffect(
    useCallback(() => {
      if (groceryListId) {
        refresh();
      }
    }, [groceryListId, refresh]),
  );

  // 편집 모드 토글 - 완료 시 일괄 저장
  const handleEditToggle = async () => {
    if (isEditMode) {
      // 먼저 모든 아이템 forceBlur (변경사항을 pendingChanges에 추가)
      itemRefs.current.forEach(ref => {
        if (ref?.forceBlur) {
          ref.forceBlur();
        }
      });

      // Keyboard dismiss
      Keyboard.dismiss();

      // 딜레이 (300ms)
      setTimeout(async () => {
        if (pendingChanges.size > 0) {
          try {
            const updates = Array.from(pendingChanges.entries()).map(
              ([id, changes]) => ({
                id,
                updates: changes,
              }),
            );

            await updateMultipleItems(updates);
            setPendingChanges(new Map());
          } catch (error) {
            setErrorModalTitle('오류');
            setErrorModalMessage('변경사항 저장에 실패했습니다.');
            setErrorModalVisible(true);
          }
        } else {
        }
      }, 300);
    } else {
      // 편집 모드 시작 시 pendingChanges 초기화
      setPendingChanges(new Map());
    }

    setIsEditMode(!isEditMode);
  };

  const handleClearCheckedItems = () => {
    const checkedItems = cartItems.filter(item => item.purchased);
    if (checkedItems.length === 0) return;
    setShowClearModal(true);
  };

  const handleConfirmClear = async () => {
    try {
      await deleteCheckedItems();
      setShowClearModal(false);
    } catch (error) {
      // console.error('[ShoppingList] 체크된 아이템 삭제 실패', error);
    }
  };

  const handleCancelClear = () => {
    setShowClearModal(false);
  };

  const handleDragEnd = ({ data }: { data: CartItem[] }) => {
    // UI만 업데이트 (서버에는 안 보냄)
  };

  // 체크박스 토글 - 즉시 저장
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

  // 수량 변경 - 편집 모드에서는 로컬에만 저장
  const handleQuantityChange = useCallback(
    (itemId: number, newQuantity: number) => {
      if (newQuantity <= 0) return;

      setPendingChanges(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(itemId) || {};
        newMap.set(itemId, { ...existing, quantity: newQuantity });
        return newMap;
      });
    },
    [],
  );

  // 단위 변경 - 편집 모드에서는 로컬에만 저장
  const handleUnitChange = useCallback((itemId: number, newUnit: string) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || {};
      newMap.set(itemId, { ...existing, unit: newUnit });
      return newMap;
    });
  }, []);

  // 이름 변경 - 로컬에만 저장
  const handleNameChange = useCallback((itemId: number, newName: string) => {
    if (!newName.trim()) {
      return;
    }

    setPendingChanges(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || {};
      newMap.set(itemId, { ...existing, name: newName.trim() });
      return newMap;
    });
  }, []);

  const handleDeleteItem = useCallback(
    (itemId: number) => {
      const itemToDeleteData = cartItems.find(item => item.id === itemId);
      if (!itemToDeleteData) return;

      setItemToDelete(itemToDeleteData);
      setShowDeleteModal(true);
    },
    [cartItems],
  );

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete.id);

      // 삭제된 아이템의 pendingChanges도 제거
      setPendingChanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemToDelete.id);
        return newMap;
      });

      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      // console.error('[ShoppingList] 아이템 삭제 실패', error);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleStartAddItem = () => {
    setIsAddingNewItem(true);
  };

  const handleAddNewItem = async (
    name: string,
    quantity: number,
    unit: string,
  ) => {
    if (!name.trim()) {
      setErrorModalTitle('알림');
      setErrorModalMessage('식재료 이름을 입력해주세요.');
      setErrorModalVisible(true);
      setIsAddingNewItem(false);
      return;
    }

    if (quantity <= 0) {
      setErrorModalTitle('알림');
      setErrorModalMessage('올바른 수량을 입력해주세요.');
      setErrorModalVisible(true);
      setIsAddingNewItem(false);
      return;
    }

    try {
      await addItem(name.trim(), quantity, unit);
      setIsAddingNewItem(false);
    } catch (error) {
      // console.error('[ShoppingList] 아이템 추가 실패', error);
      setErrorModalTitle('오류');
      setErrorModalMessage('아이템 추가에 실패했습니다.');
      setErrorModalVisible(true);
      setIsAddingNewItem(false);
    }
  };

  const handleCancelAddItem = () => {
    setIsAddingNewItem(false);
  };

  const renderFooter = () => (
    <>
      {!isEditMode && (
        <>
          {isAddingNewItem ? (
            <NewItemCard
              onSave={handleAddNewItem}
              onCancel={handleCancelAddItem}
            />
          ) : (
            <TouchableOpacity
              style={addItemStyles.addButton}
              onPress={handleStartAddItem}
              disabled={isSyncing}
            >
              <MaterialIcons name="add" size={32} color="#666" />
            </TouchableOpacity>
          )}
        </>
      )}
    </>
  );

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

  // cartItems와 pendingChanges를 합쳐서 표시할 데이터 생성
  const displayItems = cartItems.map(item => {
    const changes = pendingChanges.get(item.id);
    return changes ? { ...item, ...changes } : item;
  });

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
          onEditModeToggle={handleEditToggle}
          onClearCheckedItems={handleClearCheckedItems}
          hasCheckedItems={hasCheckedItems}
        />
        <>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2F4858" />
              <Text style={styles.loadingText}>데이터 불러오는 중...</Text>
            </View>
          ) : displayItems.length === 0 ? (
            <>
              {isAddingNewItem && (
                <View style={styles.topInputContainer}>
                  <NewItemCard
                    onSave={handleAddNewItem}
                    onCancel={handleCancelAddItem}
                  />
                </View>
              )}
              <View style={styles.emptyContainer}>
                {!isAddingNewItem && (
                  <>
                    <MaterialIcons
                      name="shopping-cart"
                      size={80}
                      color="#ccc"
                    />
                    <Text style={styles.emptyTitle}>장바구니가 비어있어요</Text>
                    <Text style={styles.emptySubtitle}>
                      식재료를 추가해 보세요!
                    </Text>
                  </>
                )}
              </View>

              {!isAddingNewItem && (
                <View style={styles.emptyButtonContainer}>
                  <TouchableOpacity
                    style={addItemStyles.addButton}
                    onPress={handleStartAddItem}
                    disabled={isSyncing}
                  >
                    <MaterialIcons name="add" size={32} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <DraggableFlatList
              data={displayItems}
              keyExtractor={item => `cart-item-${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              activationDistance={10}
              dragItemOverflow={true}
              extraData={pendingChanges}
              renderItem={({ item, drag, isActive, getIndex }) => (
                <CartItemCard
                  ref={ref => {
                    if (ref) {
                      itemRefs.current.set(item.id, ref);
                    } else {
                      itemRefs.current.delete(item.id);
                    }
                  }}
                  item={item}
                  isEditMode={isEditMode}
                  onToggleCheck={handleToggleCheck}
                  onNameChange={handleNameChange}
                  onQuantityChange={handleQuantityChange}
                  onUnitChange={handleUnitChange}
                  onDelete={handleDeleteItem}
                  onDrag={drag}
                  isActive={isActive}
                  isFirstItem={getIndex?.() === 0}
                />
              )}
              ListFooterComponent={renderFooter}
            />
          )}
        </>
      </KeyboardAvoidingView>

      <ItemDeleteConfirmModal
        visible={showDeleteModal}
        itemName={itemToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <FlushConfirmModal
        visible={showClearModal}
        itemCount={cartItems.filter(item => item.purchased).length}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
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
        onConfirm={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ShoppingListScreen;
