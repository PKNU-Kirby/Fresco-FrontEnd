import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmModal from '../modals/ConfirmModal';
import SliderQuantityInput from './SliderQuantityInput';
import { ingredientCardStyles as styles, unavailableStyles } from './styles';
import { GroceryListAPI } from '../../services/API/GroceryListAPI';

interface EnhancedMatchedIngredientSeparate {
  recipeIngredient: {
    name: string;
    quantity: number;
  };
  fridgeIngredient: any | null;
  isAvailable: boolean;
  userInputQuantity: number;
  maxUserQuantity: number;
  isDeducted: boolean;
  isCompletelyConsumed?: boolean;
  isMultipleOption?: boolean;
  optionIndex?: number;
  isAlternativeUsed?: boolean;
  originalRecipeName?: string;
}

interface CartItem {
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

const STORAGE_KEY = '@shopping_cart_items';

interface IngredientCardProps {
  item: EnhancedMatchedIngredientSeparate;
  index: number;
  onQuantityChange: (index: number, quantity: number) => void;
  onMaxQuantityChange: (index: number, maxQuantity: number) => void;
  fridgeId: number;
}

const EnhancedIngredientCard: React.FC<IngredientCardProps> = ({
  item,
  index,
  onQuantityChange,
  onMaxQuantityChange,
  fridgeId,
}) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // ConfirmModal 상태들
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [offlineSuccessModalVisible, setOfflineSuccessModalVisible] =
    useState(false);
  const [offlineSuccessMessage, setOfflineSuccessMessage] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // AsyncStorage에 저장 (백업용)
  const addToLocalCart = async (itemData: {
    name: string;
    quantity: number;
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
          quantity: existingItem.quantity + itemData.quantity,
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
          id: newId,
          groceryListId: 1, // 임시값, 실제 groceryListId는 서버에서 관리
          name: itemData.name.trim(),
          quantity: itemData.quantity,
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

      console.log('✅ 로컬 저장 성공');
    } catch (error) {
      console.error('❌ 로컬 저장 실패:', error);
      throw error;
    }
  };

  // 장바구니 추가 메인 함수
  const handleAddToShoppingList = async () => {
    setIsAddingToCart(true);
    try {
      // 재료 정보 파싱
      const itemName = item.originalRecipeName || item.recipeIngredient.name;

      const quantityMatch = item.recipeIngredient.quantity
        .toString()
        .match(/[\d.]+/);
      const quantity = quantityMatch ? parseFloat(quantityMatch[0]) : 1;

      const unit = item.recipeIngredient.quantity
        .toString()
        .replace(/[\d.\s]+/g, '')
        .trim();

      console.log('🛒 장바구니 추가 시작:', {
        itemName,
        quantity,
        unit,
        fridgeId,
      });

      let groceryListId: number;
      try {
        groceryListId = await GroceryListAPI.getGroceryListIdByFridge(fridgeId);
        console.log('✅ 장바구니 ID 조회 성공:', groceryListId);
      } catch (error) {
        console.error('❌ 장바구니 ID 조회 실패:', error);
        throw new Error('장바구니 정보를 가져올 수 없습니다.');
      }

      // 2️⃣ 서버에 아이템 추가
      try {
        await GroceryListAPI.createItem({
          name: itemName,
          quantity: quantity,
          unit: unit || '개',
          purchased: false,
          groceryListId: groceryListId,
        });
        console.log('✅ 서버 추가 성공');

        // 3️⃣ 로컬에도 백업 저장
        try {
          await addToLocalCart({
            name: itemName,
            quantity: quantity,
            unit: unit || '개',
          });
        } catch (localError) {
          console.warn('⚠️ 로컬 저장 실패 (무시):', localError);
        }

        // 성공 알림
        setSuccessMessage(
          `${itemName} ${item.recipeIngredient.quantity}이(가) 장바구니에 추가되었습니다.`,
        );
        setSuccessModalVisible(true);
      } catch (serverError) {
        console.error('❌ 서버 추가 실패:', serverError);

        // 서버 실패 시 로컬만 저장 (오프라인 모드)
        console.log('📱 오프라인 모드: 로컬에만 저장');
        await addToLocalCart({
          name: itemName,
          quantity: quantity,
          unit: unit || '개',
        });

        setOfflineSuccessMessage(
          `${itemName}이(가) 장바구니에 추가되었습니다.\n(오프라인 상태)`,
        );
        setOfflineSuccessModalVisible(true);
      }
    } catch (error) {
      console.error('❌ 장바구니 추가 실패:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '장바구니 추가에 실패했습니다.',
      );
      setErrorModalVisible(true);
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
    <>
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
                      ? parseFloat(item.fridgeIngredient?.quantity)
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
                onQuantityChange={quantity =>
                  onQuantityChange(index, parseFloat(quantity))
                }
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

      {/* 장바구니 추가 성공 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={successModalVisible}
        title="장바구니 추가 완료!"
        message={successMessage}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setSuccessModalVisible(false)}
        onCancel={() => setSuccessModalVisible(false)}
      />

      {/* 오프라인 모드 성공 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={offlineSuccessModalVisible}
        title="장바구니 추가 완료"
        message={offlineSuccessMessage}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setOfflineSuccessModalVisible(false)}
        onCancel={() => setOfflineSuccessModalVisible(false)}
      />

      {/* 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={errorModalVisible}
        title="오류"
        message={errorMessage}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
      />
    </>
  );
};

export default EnhancedIngredientCard;
