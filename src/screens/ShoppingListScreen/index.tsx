import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  SafeAreaView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CartItemCard from '../../components/ShoppingList/CartItemCard';
import ItemDeleteConfirmModal from '../../components/ShoppingList/ItemDeleteConfirmModal';
import FlushConfirmModal from '../../components/ShoppingList/FlushConfirmModal';
import { styles, addItemStyles } from './styles';
import ShoppingListHeader from '../../components/ShoppingList/ShoppingListHeader';
import Buttons from '../../components/ShoppingList/Buttons';
import NewItemCard from '../../components/ShoppingList/NewItemCard';

export interface CartItem {
  id: string;
  groceryListId: string;
  name: string;
  quantity: number;
  purchased: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // FE fields
  unit: string;
  order: number;
}

const STORAGE_KEY = '@shopping_cart_items';

interface ShoppingListScreenProps {
  onBackPress?: () => void;
  onSettingsPress?: () => void;
  listName?: string;
}

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({
  listName = '장바구니',
}) => {
  // data
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const hasCheckedItems = cartItems.some(item => item.purchased);
  // 삭제 확인 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  // 비우기 확인 모달 상태
  const [showClearModal, setShowClearModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCartItems();
    }, [loadCartItems]),
  );

  // load data from AsyncStorage
  useEffect(() => {
    loadCartItems();
  }, []);

  // load Cart Items from AsyncStorage
  const loadCartItems = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        const sortedItems = items.sort((a, b) => {
          if (a.purchased !== b.purchased) {
            return a.purchased ? 1 : -1;
          }
          return a.order - b.order;
        });
        setCartItems(sortedItems);
      }
    } catch (error) {
      console.error('장바구니 로드 실패:', error);
    }
  }, []);
  // save data to AsyncStorage
  const saveCartItems = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('장바구니 저장 실패:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  // flush Checked Cards
  const handleClearCheckedItems = () => {
    const checkedItems = cartItems.filter(item => item.purchased);
    if (checkedItems.length === 0) return;

    setShowClearModal(true);
  };
  const handleConfirmClear = () => {
    const updatedItems = cartItems.filter(item => !item.purchased);
    setCartItems(updatedItems);
    saveCartItems(updatedItems);
    setShowClearModal(false);
  };

  const handleCancelClear = () => {
    setShowClearModal(false);
  };

  // (Drag & Drop) -> Update Items order
  const handleDragEnd = ({ data }: { data: CartItem[] }) => {
    const updatedItems = data.map((item, index) => ({
      ...item,
      order: index,
    }));

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  const handleToggleCheck = (itemId: string) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          purchased: !item.purchased,
          updatedAt: new Date(),
        };
      }
      return item;
    });

    const sortedItems = updatedItems.sort((a, b) => {
      if (a.purchased !== b.purchased) {
        return a.purchased ? 1 : -1;
      }
      return a.order - b.order;
    });

    setCartItems(sortedItems);
    saveCartItems(sortedItems);
  };

  // Change Quantity
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updatedItems = cartItems.map(item =>
      item.id === itemId
        ? {
            ...item,
            quantity: newQuantity,
            updatedAt: new Date(),
          }
        : item,
    );

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // Change Unit
  const handleUnitChange = (itemId: string, newUnit: string) => {
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, unit: newUnit } : item,
    );

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // Change Item Name
  const handleNameChange = (itemId: string, newName: string) => {
    if (!newName.trim()) return;

    const updatedItems = cartItems.map(item =>
      item.id === itemId
        ? {
            ...item,
            name: newName.trim(),
            updatedAt: new Date(),
          }
        : item,
    );

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // Delete Item
  const handleDeleteItem = (itemId: string) => {
    const itemToDeleteData = cartItems.find(item => item.id === itemId);
    if (!itemToDeleteData) return;

    setItemToDelete(itemToDeleteData);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    const updatedItems = cartItems.filter(item => item.id !== itemToDelete.id);
    setCartItems(updatedItems);
    saveCartItems(updatedItems);

    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Add New Item to Cart
  const handleStartAddItem = () => {
    setIsAddingNewItem(true);
  };

  const handleAddNewItem = (name: string, quantity: number, unit: string) => {
    if (!name.trim()) {
      Alert.alert('식재료 이름을 입력해주세요.', '');
      return;
    }

    if (quantity <= 0) {
      Alert.alert('올바른 수량을 입력해주세요.', '');
      return;
    }

    const unpurchasedItemsCount = cartItems.filter(
      item => !item.purchased,
    ).length;

    // (id 생성)
    const maxId = Math.max(
      ...cartItems.map(item => Number(item.id || '0') || 0),
      0,
    );
    const newId = maxId + 1;

    const newItem: CartItem = {
      id: newId.toString(), // (id 할당)
      groceryListId: '1',
      name: name.trim(),
      quantity,
      unit,
      purchased: false,
      order: unpurchasedItemsCount,
      createdAt: new Date(),
    };

    const updatedItems = [...cartItems];
    const reorderedItems = updatedItems.map(item => {
      if (item.purchased && item.order >= unpurchasedItemsCount) {
        return { ...item, order: item.order + 1 };
      }
      return item;
    });

    const finalItems = [...reorderedItems, newItem].sort((a, b) => {
      if (a.purchased !== b.purchased) {
        return a.purchased ? 1 : -1;
      }
      return a.order - b.order;
    });

    setCartItems(finalItems);
    saveCartItems(finalItems);
    setIsAddingNewItem(false);
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
            >
              <MaterialIcons name="add" size={32} color="#666" />
            </TouchableOpacity>
          )}
        </>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ShoppingListHeader listName={listName} />

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
