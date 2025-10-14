import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  SafeAreaView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  View,
  Text,
  Keyboard,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CartItemCard from '../../components/ShoppingList/CartItemCard';
import ItemDeleteConfirmModal from '../../components/ShoppingList/ItemDeleteConfirmModal';
import FlushConfirmModal from '../../components/ShoppingList/FlushConfirmModal';
import { styles, addItemStyles } from './styles';
import ShoppingListHeader from '../../components/ShoppingList/ShoppingListHeader';
import Buttons from '../../components/ShoppingList/Buttons';
import NewItemCard from '../../components/ShoppingList/NewItemCard';
import { useGroceryList } from '../../hooks/useGroceryList';
import { FridgeControllerAPI } from '../../services/API/fridgeControllerAPI';

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

  // groceryListId 상태
  const [groceryListId, setGroceryListId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // useGroceryList hook 사용
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

  // UI 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);

  // 🔥 변경사항 추적 (이름만)
  const [pendingNameChanges, setPendingNameChanges] = useState<
    Map<number, string>
  >(new Map());

  // 🔥 각 아이템의 ref 관리
  const itemRefs = useRef<Map<number, any>>(new Map());

  const hasCheckedItems = cartItems.some(item => item.purchased);

  // 삭제 확인 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  // 비우기 확인 모달 상태
  const [showClearModal, setShowClearModal] = useState(false);

  // fridgeId로 groceryListId 가져오기
  useEffect(() => {
    const fetchGroceryListId = async () => {
      try {
        setIsInitializing(true);
        const response = await FridgeControllerAPI.getList();

        const fridges = Array.isArray(response)
          ? response
          : response?.result || response?.data || [];

        if (!Array.isArray(fridges)) {
          Alert.alert('오류', '냉장고 목록 형식이 올바르지 않습니다.');
          return;
        }

        const currentFridge =
          fridges.find((f: any) => f.id === fridgeId) ||
          fridges.find((f: any) => Number(f.id) === Number(fridgeId));

        if (currentFridge?.groceryListId) {
          setGroceryListId(currentFridge.groceryListId);
        } else {
          Alert.alert('오류', '장바구니 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('[ShoppingList] groceryListId 조회 실패:', error);
        Alert.alert('오류', '장바구니 정보를 불러올 수 없습니다.');
      } finally {
        setIsInitializing(false);
      }
    };

    fetchGroceryListId();
  }, [fridgeId]);

  // 화면 포커스 시 새로고침
  useFocusEffect(
    useCallback(() => {
      if (groceryListId) {
        refresh();
      }
    }, [groceryListId, refresh]),
  );

  // 🔥 편집 모드 토글 - 완료 시 일괄 저장
  const handleEditToggle = async () => {
    console.log('=== 편집 토글 ===');
    console.log('현재 모드:', isEditMode ? '편집 중' : '일반');

    if (isEditMode) {
      // 🔥 1. 키보드 내리기 (모든 TextInput blur됨)
      Keyboard.dismiss();

      // 🔥 2. 모든 아이템 강제 blur
      console.log('모든 아이템 forceBlur 호출...');
      itemRefs.current.forEach(ref => {
        if (ref?.forceBlur) {
          ref.forceBlur();
        }
      });

      // 🔥 3. 약간의 딜레이 후 저장 (state 업데이트 대기)
      setTimeout(async () => {
        if (pendingNameChanges.size > 0) {
          console.log(
            '✅ 변경된 이름 저장 시작:',
            pendingNameChanges.size,
            '개',
          );
          console.log('변경 내역:', Array.from(pendingNameChanges.entries()));

          try {
            const updates = Array.from(pendingNameChanges.entries()).map(
              ([id, name]) => ({
                id,
                updates: { name },
              }),
            );

            await updateMultipleItems(updates);
            setPendingNameChanges(new Map());
            console.log('✅ 이름 변경 완료');
          } catch (error) {
            console.error('❌ 이름 변경 실패:', error);
            Alert.alert('오류', '이름 변경에 실패했습니다.');
          }
        } else {
          console.log('변경된 이름 없음');
        }
      }, 200);
    }

    setIsEditMode(!isEditMode);
  };

  // 체크된 아이템 비우기
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
      console.error('[ShoppingList] 체크된 아이템 삭제 실패:', error);
    }
  };

  const handleCancelClear = () => {
    setShowClearModal(false);
  };

  // Drag & Drop으로 순서 변경
  const handleDragEnd = ({ data }: { data: CartItem[] }) => {
    // UI만 업데이트 (서버에는 안 보냄)
  };

  // 체크박스 토글 - 즉시 저장
  const handleToggleCheck = async (itemId: number) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    try {
      await updateSingleItem(itemId, {
        purchased: !item.purchased,
      });
    } catch (error) {
      console.error('[ShoppingList] 체크 토글 실패:', error);
    }
  };

  // 수량 변경 - 즉시 저장
  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      await updateSingleItem(itemId, {
        quantity: newQuantity,
      });
    } catch (error) {
      console.error('[ShoppingList] 수량 변경 실패:', error);
    }
  };

  // 단위 변경 - 즉시 저장
  const handleUnitChange = async (itemId: number, newUnit: string) => {
    try {
      await updateSingleItem(itemId, { unit: newUnit });
    } catch (error) {
      console.error('[ShoppingList] 단위 변경 실패:', error);
    }
  };

  // 🔥 이름 변경 - 로컬에만 저장 (편집 완료 시 일괄 저장)
  const handleNameChange = (itemId: number, newName: string) => {
    console.log('=== 이름 변경 (로컬) ===');
    console.log('itemId:', itemId, 'newName:', newName);

    if (!newName.trim()) {
      console.log('❌ 빈 문자열');
      return;
    }

    const item = cartItems.find(i => i.id === itemId);
    if (!item) {
      console.log('❌ 아이템을 찾을 수 없음');
      return;
    }

    // 이름이 실제로 변경되었는지 확인
    if (item.name === newName.trim()) {
      console.log('⚠️ 이름이 동일함 - 저장 안 함');
      return;
    }

    console.log('✅ 변경사항 추가:', itemId, '→', newName.trim());

    // 변경사항 추적 (서버에는 아직 안 보냄)
    setPendingNameChanges(prev => {
      const newMap = new Map(prev);
      newMap.set(itemId, newName.trim());
      return newMap;
    });
  };

  // 아이템 삭제
  const handleDeleteItem = (itemId: number) => {
    const itemToDeleteData = cartItems.find(item => item.id === itemId);
    if (!itemToDeleteData) return;

    setItemToDelete(itemToDeleteData);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('[ShoppingList] 아이템 삭제 실패:', error);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // 새 아이템 추가
  const handleStartAddItem = () => {
    setIsAddingNewItem(true);
  };

  const handleAddNewItem = async (
    name: string,
    quantity: number,
    unit: string,
  ) => {
    if (!name.trim()) {
      Alert.alert('식재료 이름을 입력해주세요.', '');
      return;
    }

    if (quantity <= 0) {
      Alert.alert('올바른 수량을 입력해주세요.', '');
      return;
    }

    try {
      await addItem(name.trim(), quantity, unit);
      setIsAddingNewItem(false);
    } catch (error) {
      console.error('[ShoppingList] 아이템 추가 실패:', error);
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

  // 초기화 중일 때 로딩 화면
  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <ShoppingListHeader listName={fridgeName} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="limegreen" />
          <Text style={styles.loadingText}>장바구니 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ShoppingListHeader listName={fridgeName} />

      {/* 서버 동기화 중 표시 */}
      {isSyncing && (
        <View style={styles.syncIndicator}>
          <ActivityIndicator size="small" color="limegreen" />
          <Text style={styles.syncText}>동기화 중...</Text>
        </View>
      )}

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

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="limegreen" />
            <Text style={styles.loadingText}>데이터 불러오는 중...</Text>
          </View>
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="shopping-cart" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>장바구니가 비어있어요</Text>
            <Text style={styles.emptySubtitle}>식재료를 추가해 보세요!</Text>

            <View style={styles.emptyButtonContainer}>
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
            </View>
          </View>
        ) : (
          <DraggableFlatList
            data={cartItems}
            onDragEnd={handleDragEnd}
            keyExtractor={item => `cart-item-${item.id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            activationDistance={10}
            dragItemOverflow={true}
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
      </KeyboardAvoidingView>

      {/* 삭제 확인 모달 */}
      <ItemDeleteConfirmModal
        visible={showDeleteModal}
        itemName={itemToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* 비우기 확인 모달 */}
      <FlushConfirmModal
        visible={showClearModal}
        itemCount={cartItems.filter(item => item.purchased).length}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />
    </SafeAreaView>
  );
};

export default ShoppingListScreen;
