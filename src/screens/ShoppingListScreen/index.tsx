import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Alert } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CartItemCard from './CartItemCard';
import { RootStackParamList } from '../../../App';
import CustomText from '../../components/common/CustomText';
import BackButton from '../../components/common/BackButton';
import ActionToggleButton from '../../components/common/ActionToggleButton';
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

type ShoppingListHeaderProps = {
  listName: string;
  isEditMode: boolean;
  onEditToggle: () => void;
};

const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({
  listName,
  isEditMode,
  onEditToggle,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.header}>
      {/* LEFT : Back button */}
      <View style={styles.leftSection}>
        <BackButton onPress={handleBack} />
      </View>

      {/* MID : List name */}
      <View style={styles.centerSection}>
        <CustomText
          style={styles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {listName}
        </CustomText>
      </View>

      {/* Right Section : Edit Toggle Button */}
      <View style={styles.rightSection}>
        <ActionToggleButton
          isActive={isEditMode}
          onPress={onEditToggle}
          activeText="완료"
          inactiveText="편집"
          style={styles.editButton}
          textStyle={styles.editButtonText}
        />
      </View>
    </View>
  );
};

const STORAGE_KEY = '@shopping_cart_items';

interface ShoppingListScreenProps {
  onSettingsPress?: () => void;
  listName?: string;
}

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({
  listName = '장바구니',
}) => {
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

  // edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // load data from AsyncStorage
  useEffect(() => {
    loadCartItems();
  }, []);

  // load cart item from AsyncStorage
  const loadCartItems = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        const sortedItems = items.sort((a, b) => {
          if (a.isChecked !== b.isChecked) {
            return a.isChecked ? 1 : -1;
          }
          return a.order - b.order;
        });
        setCartItems(sortedItems);
      }
    } catch (error) {
      console.error('FAILED - load cart :', error);
    }
  };

  // save data to AsyncStorage
  const saveCartItems = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('FAILED - save cart :', error);
    }
  };

  // toggle : EDIT mode
  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  // order item list : after drag item
  const handleDragEnd = ({ data }: { data: CartItem[] }) => {
    const updatedItems = data.map((item, index) => ({
      ...item,
      order: index,
    }));

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // toggle : check box
  const handleToggleCheck = (itemId: string) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    });

    // order item list : after check item
    const sortedItems = updatedItems.sort((a, b) => {
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? 1 : -1;
      }
      return a.order - b.order;
    });

    setCartItems(sortedItems);
    saveCartItems(sortedItems);
  };

  const handleNameChange = (itemId: string, newName: string) => {
    if (!isEditMode || !newName.trim()) return;

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, name: newName.trim() } : item,
    );

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // change quantity (EDIT MODE)
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (!isEditMode || newQuantity <= 0) return;

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item,
    );

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // change unit (EDIT MODE)
  const handleUnitChange = (itemId: string, newUnit: string) => {
    if (!isEditMode) return;

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, unit: newUnit } : item,
    );

    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  // delete item
  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = cartItems.find(item => item.id === itemId);
    if (!itemToDelete) return;

    Alert.alert(
      '',
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

  // data : for test
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
      <ShoppingListHeader
        listName={listName}
        isEditMode={isEditMode}
        onEditToggle={handleEditToggle}
      />

      <View style={styles.content}>
        <DraggableFlatList
          data={cartItems}
          onDragEnd={handleDragEnd}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          activationDistance={0}
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
        />
      </View>
    </SafeAreaView>
  );
};

export default ShoppingListScreen;
