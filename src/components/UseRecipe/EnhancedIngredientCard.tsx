import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SliderQuantityInput from './SliderQuantityInput';
import { ingredientCardStyles as styles, unavailableStyles } from './styles';

interface EnhancedMatchedIngredientSeparate {
  recipeIngredient: {
    name: string;
    quantity: string;
  };
  fridgeIngredient: any | null;
  isAvailable: boolean;
  userInputQuantity: string;
  maxUserQuantity: number;
  isDeducted: boolean;
  isCompletelyConsumed?: boolean;
  isMultipleOption?: boolean;
  optionIndex?: number;
  isAlternativeUsed?: boolean;
  originalRecipeName?: string;
}

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
  item: EnhancedMatchedIngredientSeparate;
  index: number;
  onQuantityChange: (index: number, quantity: string) => void;
  onMaxQuantityChange: (index: number, maxQuantity: number) => void;
}

const EnhancedIngredientCard: React.FC<IngredientCardProps> = ({
  item,
  index,
  onQuantityChange,
  onMaxQuantityChange,
}) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 장바구니 추가 함수
  const addToExistingCart = async (itemData: {
    name: string;
    quantity: string;
    unit?: string;
  }): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const existingItems: CartItem[] = stored ? JSON.parse(stored) : [];

      const existingIndex = existingItems.findIndex(
        cartItem => cartItem.name.toLowerCase() === itemData.name.toLowerCase(),
      );

      if (existingIndex >= 0) {
        const existingItem = existingItems[existingIndex];
        existingItems[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + parseFloat(itemData.quantity),
          updatedAt: new Date(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingItems));
      } else {
        const unpurchasedItemsCount = existingItems.filter(
          cartItem => !cartItem.purchased,
        ).length;

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

        const reorderedItems = existingItems.map(existingItem => {
          if (
            existingItem.purchased &&
            existingItem.order >= unpurchasedItemsCount
          ) {
            return { ...existingItem, order: existingItem.order + 1 };
          }
          return existingItem;
        });

        const finalItems = [...reorderedItems, newItem].sort(
          (a: CartItem, b: CartItem) => {
            if (a.purchased !== b.purchased) {
              return a.purchased ? 1 : -1;
            }
            return a.order - b.order;
          },
        );

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
      // 원래 레시피 재료명 사용 (대체재인 경우)
      const itemName = item.originalRecipeName || item.recipeIngredient.name;

      const quantityMatch = item.recipeIngredient.quantity.match(/[\d.]+/);
      const quantity = quantityMatch ? quantityMatch[0] : '1';

      const unit = item.recipeIngredient.quantity
        .replace(/[\d.\s]+/g, '')
        .trim();

      await addToExistingCart({
        name: itemName,
        quantity: quantity,
        unit: unit || '개',
      });

      Alert.alert(
        '장바구니 추가 완료!',
        `${itemName} ${item.recipeIngredient.quantity}이(가) 장바구니에 추가되었습니다.`,
        [{ text: '확인' }],
      );
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      Alert.alert('오류', '장바구니 추가에 실패했습니다.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 대체재 정보
  const renderAlternativeInfo = () => {
    if (!item.isAlternativeUsed || !item.originalRecipeName) {
      return null;
    }

    return (
      <View style={styles.alternativeInfoBanner}>
        <Icon name="swap-horiz" size={24} color="#FF9800" />
        <Text style={styles.alternativeInfoText}>
          {item.originalRecipeName}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.ingredientCard}>
      {/* 대체재 정보 배너 */}
      {renderAlternativeInfo()}

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
              <Text>{item.fridgeIngredient.name}</Text>
            )}
        </View>
        <View style={styles.recipeQuantity}>
          {item.isAvailable && (
            <>
              <View style={styles.availableText}>
                <View style={styles.availableIcon}>
                  <Icon
                    name="check-circle"
                    size={20}
                    color={item.isAlternativeUsed ? '#FF9800' : 'limegreen'}
                  />
                </View>
                <Text
                  style={
                    item.isAlternativeUsed
                      ? styles.alternativeOne
                      : styles.haveOne
                  }
                >
                  보유:{' '}
                  {Number(item.fridgeIngredient?.quantity) % 1 === 0
                    ? parseInt(item.fridgeIngredient?.quantity, 10).toString()
                    : parseFloat(item.fridgeIngredient?.quantity).toFixed(2)}
                  {item.fridgeIngredient?.unit}
                </Text>
              </View>
              <Text style={styles.needtext}> | </Text>
            </>
          )}
          <Text style={styles.needtext}>
            필요: {item.recipeIngredient.quantity}
          </Text>
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
        // 냉장고에 없는 재료 - 장바구니 담기
        <View style={unavailableStyles.unavailableSection}>
          <View style={unavailableStyles.unavailableInfo}>
            <Icon name="error" size={22} color="#FF5722" />
            <Text style={unavailableStyles.unavailableText}>
              냉장고에 없는 재료입니다
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
              {isAddingToCart ? ' 추가 중...' : ' 장바구니에 담기'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default EnhancedIngredientCard;
