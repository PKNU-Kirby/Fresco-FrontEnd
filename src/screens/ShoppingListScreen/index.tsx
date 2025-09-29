import React, { useState, useEffect, useCallback } from 'react';
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
  id: string;
  groceryListId: string;
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
      fridgeId: string;
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
    deleteItem,
    deleteCheckedItems,
    refresh,
  } = useGroceryList(groceryListId);

  // UI 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
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
        console.log('[ShoppingList] fridgeId로 groceryListId 조회:', fridgeId);

        const response = await FridgeControllerAPI.getList();
        console.log(
          '[ShoppingList] API 응답 전체:',
          JSON.stringify(response, null, 2),
        );
        console.log('[ShoppingList] 응답 타입:', typeof response);
        console.log('[ShoppingList] 응답이 배열?:', Array.isArray(response));

        // 응답이 배열인지 확인하고 처리
        const fridges = Array.isArray(response)
          ? response
          : response?.result ||
            response?.data ||
            response?.refrigerators ||
            response?.fridges ||
            [];

        console.log('[ShoppingList] 처리된 fridges:', fridges);
        console.log('[ShoppingList] fridges 배열?:', Array.isArray(fridges));

        if (!Array.isArray(fridges)) {
          console.error('[ShoppingList] fridges가 배열이 아닙니다:', fridges);
          Alert.alert('오류', '냉장고 목록 형식이 올바르지 않습니다.');
          return;
        }

        const currentFridge = fridges.find(
          (f: any) => f.id.toString() === fridgeId,
        );

        if (currentFridge && currentFridge.groceryListId) {
          console.log(
            '[ShoppingList] groceryListId 찾음:',
            currentFridge.groceryListId,
          );
          setGroceryListId(currentFridge.groceryListId);
        } else {
          console.warn('[ShoppingList] groceryListId를 찾을 수 없음');
          console.log('[ShoppingList] currentFridge:', currentFridge);
          console.log('[ShoppingList] 사용 가능한 냉장고들:', fridges);
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

  const handleEditToggle = () => {
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
  const handleDragEnd = async ({ data }: { data: CartItem[] }) => {
    // 일단 UI 먼저 업데이트 (낙관적 업데이트)
    const updatedItems = data.map((item, index) => ({
      ...item,
      order: index,
    }));

    // TODO: 순서 변경은 서버에 반영하지 않음 (order는 FE에서만 관리)
    // 필요하다면 나중에 bulk update API 사용
  };

  // 체크박스 토글
  const handleToggleCheck = async (itemId: string) => {
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

  // 수량 변경
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      await updateSingleItem(itemId, {
        quantity: newQuantity,
      });
    } catch (error) {
      console.error('[ShoppingList] 수량 변경 실패:', error);
    }
  };

  // 단위 변경 (FE에서만 관리)
  const handleUnitChange = (itemId: string, newUnit: string) => {
    // unit은 서버에 저장하지 않으므로 로컬만 업데이트
    // TODO: 필요시 AsyncStorage에 별도 저장
    console.log('[ShoppingList] 단위 변경 (로컬만):', itemId, newUnit);
  };

  // 이름 변경
  const handleNameChange = async (itemId: string, newName: string) => {
    if (!newName.trim()) return;

    try {
      await updateSingleItem(itemId, {
        name: newName.trim(),
      });
    } catch (error) {
      console.error('[ShoppingList] 이름 변경 실패:', error);
    }
  };

  // 아이템 삭제
  const handleDeleteItem = (itemId: string) => {
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

            {/* 빈 상태에서도 추가 버튼 표시 */}
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
            renderItem={({ item, drag, isActive }) => (
              <CartItemCard
                item={item}
                isEditMode={isEditMode}
                onToggleCheck={handleToggleCheck}
                onNameChange={handleNameChange}
                onQuantityChange={handleQuantityChange}
                onUnitChange={handleUnitChange}
                onDelete={handleDeleteItem}
                onDrag={drag}
                isActive={isActive}
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
