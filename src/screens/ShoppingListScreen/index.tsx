import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Alert } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CartItemCard from './CartItemCard';
import { styles } from './styles';

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  imageUrl?: string;
  isChecked: boolean;
  order: number;
  createdAt: Date;
}

const STORAGE_KEY = '@shopping_cart_items';

const ShoppingListScreen: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: '양배추',
      quantity: 1,
      unit: '개',
      category: '야채',
      isChecked: false,
      order: 0,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: '당가슴살',
      quantity: 500,
      unit: 'g',
      category: '육류',
      isChecked: false,
      order: 1,
      createdAt: new Date(),
    },
    {
      id: '3',
      name: '우유',
      quantity: 1000,
      unit: 'ml',
      category: '유제품',
      isChecked: true,
      order: 2,
      createdAt: new Date(),
    },
  ]);

  // AsyncStorage에서 데이터 로드
  useEffect(() => {
    loadCartItems();
  }, []);

  // AsyncStorage에서 장바구니 아이템 로드
  const loadCartItems = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        // 체크된 항목은 하단으로, 체크 안된 항목은 order 순으로 정렬
        const sortedItems = items.sort((a, b) => {
          if (a.isChecked !== b.isChecked) {
            return a.isChecked ? 1 : -1; // 체크된 항목을 뒤로
          }
          return a.order - b.order;
        });
        setCartItems(sortedItems);
      }
    } catch (error) {
      console.error('장바구니 로드 실패:', error);
    }
  };

  // AsyncStorage에 데이터 저장
  const saveCartItems = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('장바구니 저장 실패:', error);
    }
  };

  // 드래그 완료 시 순서 업데이트
  const handleDragEnd = ({ data }: { data: CartItem[] }) => {
    // 체크 상태별로 order 재정렬
    const updatedItems = data.map((item, index) => ({
      ...item,
      order: index,
    }));

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // 체크박스 토글
  const handleToggleCheck = (itemId: string) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    });

    // 체크 상태 변경 후 정렬 (체크된 항목을 하단으로)
    const sortedItems = updatedItems.sort((a, b) => {
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? 1 : -1;
      }
      return a.order - b.order;
    });

    setCartItems(sortedItems);
    saveCartItems(sortedItems);
  };

  // 수량 변경
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item,
    );

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // 단위 변경
  const handleUnitChange = (itemId: string, newUnit: string) => {
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, unit: newUnit } : item,
    );

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // 아이템 삭제
  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = cartItems.find(item => item.id === itemId);
    if (!itemToDelete) return;

    Alert.alert(
      '삭제 확인',
      `"${itemToDelete.name}"을(를) 장바구니에서 삭제하시겠습니까?`,
      [
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
      ],
    );
  };

  // 테스트용 더미 데이터 추가 (개발 중에만 사용)
  const addTestItem = () => {
    const testItem: CartItem = {
      id: Date.now().toString(),
      name: `테스트 식재료 ${cartItems.length + 1}`,
      quantity: 1,
      unit: '개',
      category: '야채',
      isChecked: false,
      order: cartItems.length,
      createdAt: new Date(),
    };

    const updatedItems = [...cartItems, testItem];
    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 임시 테스트 버튼 - 나중에 제거 */}
        {/* <TouchableOpacity style={styles.testButton} onPress={addTestItem}>
          <CustomText style={styles.testButtonText}>테스트 아이템 추가</CustomText>
        </TouchableOpacity> */}

        <DraggableFlatList
          data={cartItems}
          onDragEnd={handleDragEnd}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, drag, isActive }) => (
            <CartItemCard
              item={item}
              onToggleCheck={handleToggleCheck}
              onQuantityChange={handleQuantityChange}
              onUnitChange={handleUnitChange}
              onDelete={handleDeleteItem}
              onDrag={drag}
              isActive={isActive}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default ShoppingListScreen;
