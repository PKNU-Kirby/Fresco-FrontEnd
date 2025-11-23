import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  memo,
} from 'react';
import { View, TouchableOpacity, TextInput, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
//
import { CartItem } from '../../types/CartItem';
import UnitSelector from '../FridgeHome/FridgeItemCard/UnitSelector';
import QuantityEditor from '../FridgeHome/FridgeItemCard/QuantityEditor';
//
import { cardStyles as styles } from './styles';

interface CartItemCardProps {
  item: CartItem;
  isEditMode?: boolean;
  onToggleCheck: (itemId: number) => void;
  onNameChange: (itemId: number, newName: string) => void;
  onQuantityChange: (itemId: number, newQuantity: number) => void;
  onUnitChange: (itemId: number, newUnit: string) => void;
  onDelete: (itemId: number) => void;
  onDrag: () => void;
  isActive: boolean;
  isFirstItem?: boolean;
}

const UNITS = ['개', 'ml', 'g', 'kg', 'L'];

const CartItemCard = forwardRef<any, CartItemCardProps>(
  (
    {
      item,
      isEditMode = false,
      onToggleCheck,
      onNameChange,
      onQuantityChange,
      onUnitChange,
      onDelete,
      onDrag,
      isActive,
      isFirstItem = false,
    },
    ref,
  ) => {
    const [tempName, setTempName] = useState(item.name);
    const [tempQuantity, setTempQuantity] = useState(item.quantity);
    const [showUnitModal, setShowUnitModal] = useState(false);

    const nameInputRef = useRef<TextInput>(null);

    // blur 후 직접 onChange 호출
    useImperativeHandle(ref, () => ({
      forceBlur: () => {
        // console.log('[CartItemCard] forceBlur 호출 ', item.id, tempName);

        // TextInput blur
        nameInputRef.current?.blur();

        // 즉시 변경사항 전달
        if (tempName.trim() && tempName !== item.name) {
          onNameChange(item.id, tempName.trim());
        }

        // 수량 체크
        if (tempQuantity !== item.quantity) {
          onQuantityChange(item.id, tempQuantity);
        }
      },
    }));

    useEffect(() => {
      setTempQuantity(item.quantity);
    }, [item.quantity]);

    useEffect(() => {
      setTempName(item.name);
    }, [item.name]);

    useEffect(() => {
      if (isEditMode && isFirstItem) {
        const timer = setTimeout(() => {
          nameInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [isEditMode, isFirstItem]);

    const handleNameSubmit = () => {
      const trimmedName = tempName.trim();
      if (trimmedName && trimmedName !== item.name) {
        // console.log('onNameChange 호출:', item.id, trimmedName);
        onNameChange(item.id, trimmedName);
      } else if (!trimmedName) {
        // console.log('빈 문자열 -> 원래 이름으로 복구');
        setTempName(item.name);
      } else {
        // console.log('이름이 동일 -> API 호출 안 함');
      }
    };

    // 수량 변경 핸들러
    const handleQuantityChange = (newQuantity: number) => {
      setTempQuantity(newQuantity);
      const quantity = newQuantity;
      if (!isNaN(quantity) && quantity > 0) {
        onQuantityChange(item.id, quantity);
      }
    };

    const handleUnitSelect = (unit: string) => {
      onUnitChange(item.id, unit);
      setShowUnitModal(false);
    };

    const handleUnitModalOpen = () => {
      if (!isEditMode) return;
      setShowUnitModal(true);
    };

    return (
      <>
        <TouchableOpacity
          onLongPress={onDrag}
          disabled={isActive}
          delayLongPress={150}
          style={[
            styles.itemCard,
            item.purchased && styles.checkedItemCard,
            isActive && styles.activeItemCard,
          ]}
        >
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => onToggleCheck(item.id)}
          >
            <View
              style={[
                styles.itemImagePlaceholder,
                item.purchased && styles.checkedImagePlaceholder,
              ]}
            >
              {item.purchased && (
                <MaterialIcons name="check" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.itemInfo}>
            {isEditMode ? (
              <TextInput
                ref={nameInputRef}
                style={styles.nameInput}
                value={tempName}
                onChangeText={setTempName}
                onBlur={handleNameSubmit}
                onSubmitEditing={handleNameSubmit}
                selectTextOnFocus
                returnKeyType="done"
              />
            ) : (
              <Text
                style={[styles.itemName, item.purchased && styles.checkedText]}
              >
                {item.name}
              </Text>
            )}

            <View style={styles.itemDetails}>
              {isEditMode ? (
                <QuantityEditor
                  quantity={tempQuantity}
                  unit={item.unit}
                  onQuantityChange={handleQuantityChange}
                  onTextBlur={() => {}}
                  onUnitPress={handleUnitModalOpen}
                />
              ) : (
                <Text
                  style={[
                    styles.simpleQuantityText,
                    item.purchased && styles.checkedText,
                  ]}
                >
                  {item.quantity} {item.unit}
                </Text>
              )}

              {isEditMode && (
                <UnitSelector
                  visible={showUnitModal}
                  selectedUnit={item.unit}
                  options={UNITS}
                  onSelect={handleUnitSelect}
                  onClose={() => setShowUnitModal(false)}
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(item.id)}
          >
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        </TouchableOpacity>
      </>
    );
  },
);

export default memo(CartItemCard, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.quantity === nextProps.item.quantity &&
    prevProps.item.unit === nextProps.item.unit &&
    prevProps.item.purchased === nextProps.item.purchased &&
    prevProps.isEditMode === nextProps.isEditMode &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isFirstItem === nextProps.isFirstItem
  );
});
