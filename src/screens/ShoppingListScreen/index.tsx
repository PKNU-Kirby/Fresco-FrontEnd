import React, { useState, useEffect } from 'react';
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
import CartItemCard from './CartItemCard';
import { styles, addItemStyles } from './styles';
import ShoppingListHeader from './ShoppingListHeader';
import Buttons from './Buttons';
import NewItemCard from './NewItemCard';

export interface CartItem {
  id?: number;
  groceryListId: number;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      groceryListId: 1,
      name: '양배추',
      quantity: 1,
      unit: '개',
      purchased: false,
      order: 0,
      createdAt: new Date(),
    },
    {
      id: 2,
      groceryListId: 1,
      name: '당가슴살',
      quantity: 500,
      unit: 'g',
      purchased: false,
      order: 1,
      createdAt: new Date(),
    },
    {
      id: 3,
      groceryListId: 1,
      name: '우유',
      quantity: 1000,
      unit: 'ml',
      purchased: true,
      order: 2,
      createdAt: new Date(),
    },
  ]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const hasCheckedItems = cartItems.some(item => item.purchased);

  // load data from AsyncStorage
  useEffect(() => {
    loadCartItems();
  }, []);

  // load Cart Items from AsyncStorage
  const loadCartItems = async () => {
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
  };

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

    Alert.alert(`체크된 ${checkedItems.length}개의 아이템을 삭제합니다.`, ``, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          const updatedItems = cartItems.filter(item => !item.purchased);
          setCartItems(updatedItems);
          saveCartItems(updatedItems);
        },
      },
    ]);
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

  const handleToggleCheck = (itemId: number) => {
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
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
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
  const handleUnitChange = (itemId: number, newUnit: string) => {
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, unit: newUnit } : item,
    );

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // Change Item Name
  const handleNameChange = (itemId: number, newName: string) => {
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
  const handleDeleteItem = (itemId: number) => {
    const itemToDelete = cartItems.find(item => item.id === itemId);
    if (!itemToDelete) return;

    Alert.alert(`"${itemToDelete.name}"을(를) 장바구니에서 삭제합니다.`, ``, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          const updatedItems = cartItems.filter(item => item.id !== itemId);
          setCartItems(updatedItems);
          saveCartItems(updatedItems);
        },
      },
    ]);
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
    const maxId = Math.max(...cartItems.map(item => item.id || 0), 0);
    const newId = maxId + 1;

    const newItem: CartItem = {
      id: newId, // (id 할당)
      groceryListId: 1,
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

      <Buttons
        isListEditMode={isEditMode}
        onEditModeToggle={handleEditToggle}
        onClearCheckedItems={handleClearCheckedItems}
        hasCheckedItems={hasCheckedItems}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
    </SafeAreaView>
  );
};

export default ShoppingListScreen;
