import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SliderQuantityInput from './SliderQuantityInput';
import { MainTabParamList } from '../../../App';

import { MatchedIngredientSeparate } from '../../types';
import { ingredientCardStyles as styles } from './styles';

// 장바구니 interface
interface CartItem {
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

const STORAGE_KEY = '@shopping_cart_items';

interface IngredientCardProps {
  item: MatchedIngredientSeparate;
  index: number;
  onQuantityChange: (index: number, quantity: string) => void;
  onMaxQuantityChange: (index: number, maxQuantity: number) => void;
  //onDeduct: (index: number) => void;
}
const IngredientCard: React.FC<IngredientCardProps> = ({
  item,
  index,
  onQuantityChange,
  onMaxQuantityChange,
  // onDeduct,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainTabParamList>>();

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 장바구니 추가 함수
  const addToExistingCart = async (itemData: {
    name: string;
    quantity: string;
    unit?: string;
  }): Promise<void> => {
    try {
      // 기존 장바구니 데이터 로드
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const existingItems: CartItem[] = stored ? JSON.parse(stored) : [];

      // 중복 체크 (같은 이름의 재료가 있으면 수량 합계)
      const existingIndex = existingItems.findIndex(
        cartItem => cartItem.name.toLowerCase() === itemData.name.toLowerCase(),
      );

      if (existingIndex >= 0) {
        // 기존 아이템 수량 증가 후 저장 추가
        const existingItem = existingItems[existingIndex];
        existingItems[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + parseFloat(itemData.quantity),
          updatedAt: new Date(),
        };

        // 중복 아이템 저장
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingItems));
      } else {
        // 새 아이템 추가
        const unpurchasedItemsCount = existingItems.filter(
          cartItem => !cartItem.purchased,
        ).length;

        // ID 생성
        const maxId = Math.max(
          ...existingItems.map(cartItem => Number(cartItem.id || '0') || 0),
          0,
        );
        const newId = maxId + 1;

        const newItem: CartItem = {
          id: newId.toString(),
          groceryListId: '1',
          name: itemData.name.trim(),
          quantity: parseFloat(itemData.quantity),
          unit: itemData.unit || '',
          purchased: false,
          order: unpurchasedItemsCount,
          createdAt: new Date(),
        };

        // 기존 아이템들 order 재정렬
        const reorderedItems = existingItems.map(existingItem => {
          if (
            existingItem.purchased &&
            existingItem.order >= unpurchasedItemsCount
          ) {
            return { ...existingItem, order: existingItem.order + 1 };
          }
          return existingItem;
        });

        // 최종 정렬
        const finalItems = [...reorderedItems, newItem].sort(
          (a: CartItem, b: CartItem) => {
            if (a.purchased !== b.purchased) {
              return a.purchased ? 1 : -1;
            }
            return a.order - b.order;
          },
        );

        // 새 아이템 추가 시 저장
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalItems));
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      throw error;
    }
  };

  const handleAddToShoppingList = async () => {
    setIsAddingToCart(true);
    try {
      // 수량에서 숫자만 추출 ("100g" -> "100")
      const quantityMatch = item.recipeIngredient.quantity.match(/[\d.]+/);
      const quantity = quantityMatch ? quantityMatch[0] : '1';

      // 단위 추출 ("100g" -> "g")
      const unit = item.recipeIngredient.quantity
        .replace(/[\d.\s]+/g, '')
        .trim();

      await addToExistingCart({
        name: item.recipeIngredient.name,
        quantity: quantity,
        unit: unit || '개',
      });

      Alert.alert(
        '장바구니 추가 완료! 🛒',
        `${item.recipeIngredient.name} ${item.recipeIngredient.quantity}이(가) 장바구니에 추가되었습니다.`,
        [{ text: '확인' }, {}],
      );
    } catch (error) {
      console.error('🛒 장바구니 추가 실패:', error);
      Alert.alert('오류', '장바구니 추가에 실패했습니다.');
    } finally {
      setIsAddingToCart(false);
    }
  };
  return (
    <View style={styles.ingredientCard}>
      <View style={styles.ingredientHeader}>
        <View style={styles.ingredientNameContainer}>
          <Text style={styles.ingredientName}>
            {item.recipeIngredient.name}
            {item.isMultipleOption && (
              <Text style={styles.optionBadge}> #{item.optionIndex}</Text>
            )}
          </Text>
          {item.fridgeIngredient &&
            item.fridgeIngredient.name !== item.recipeIngredient.name && (
              <Text style={styles.optionDescription}>
                {item.fridgeIngredient.name}
              </Text>
            )}
        </View>
        <View style={styles.recipeQuantity}>
          {item.isAvailable && (
            <>
              <View style={styles.availableText}>
                <View style={styles.availableIcon}>
                  <Icon name="check-circle" size={20} color="limegreen" />
                </View>
                <Text style={styles.haveOne}>
                  {' '}
                  보유: {item.fridgeIngredient?.quantity}
                  {item.fridgeIngredient?.unit}
                </Text>
              </View>
              <Text style={styles.needtext}> | </Text>
            </>
          )}
          <Text style={styles.needtext}>
            필요: {item.recipeIngredient.quantity}
          </Text>{' '}
        </View>
      </View>

      {item.isAvailable && item.fridgeIngredient ? (
        <View>
          <View style={styles.quantityEditorContainer}>
            <SliderQuantityInput
              quantity={item.userInputQuantity}
              unit={item.fridgeIngredient.unit || '개'}
              maxQuantity={item.maxUserQuantity}
              availableQuantity={parseFloat(item.fridgeIngredient.quantity)}
              isEditMode={!item.isDeducted}
              onQuantityChange={quantity => onQuantityChange(index, quantity)}
              onMaxQuantityChange={maxQuantity =>
                onMaxQuantityChange(index, maxQuantity)
              }
              onTextBlur={() => {}}
            />
          </View>
        </View>
      ) : (
        // 🛒 기존 장바구니와 연동된 추가 기능
        <View style={unavailableStyles.unavailableSection}>
          <View style={unavailableStyles.unavailableInfo}>
            <Icon name="error" size={22} color="#FF5722" />
            <Text style={unavailableStyles.unavailableText}>
              냉장고에 없는 재료예요
            </Text>
          </View>

          <TouchableOpacity
            style={[
              unavailableStyles.addToCartButton,
              isAddingToCart && unavailableStyles.addToCartButtonDisabled,
            ]}
            onPress={handleAddToShoppingList}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="add-shopping-cart" size={16} color="#f8f8f8" />
            )}
            <Text style={unavailableStyles.addToCartText}>
              {isAddingToCart ? '추가 중...' : '장바구니 담기'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// 🛒 스타일 (기존과 동일)
const unavailableStyles = {
  unavailableSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 8,
    backgroundColor: '#fae1dd',
    borderRadius: 8,
  },

  unavailableInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    gap: 8,
  },

  unavailableText: {
    fontSize: 15,
    color: 'tomato',
    fontWeight: '500' as const,
  },

  addToCartButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'tomato',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },

  addToCartButtonDisabled: {
    opacity: 0.6,
  },

  addToCartText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600' as const,
  },
};

export default IngredientCard;
