import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, TextInput, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import UnitSelector from '../FridgeHome/FridgeItemCard/UnitSelector';
import QuantityEditor from '../FridgeHome/FridgeItemCard/QuantityEditor';
import { CartItem } from '../../types/CartItem';
import { cardStyles as styles } from './styles';

interface CartItemCardProps {
  item: CartItem;
  isEditMode?: boolean;
  onToggleCheck: (itemId: string) => void;
  onNameChange: (itemId: string, newName: string) => void;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onUnitChange: (itemId: string, newUnit: string) => void;
  onDelete: (itemId: string) => void;
  onDrag: () => void;
  isActive: boolean;
  isFirstItem?: boolean; // 첫 번째 아이템인지 확인하는 prop
}

const UNITS = ['개', 'ml', 'g', 'kg', 'L'];

const CartItemCard: React.FC<CartItemCardProps> = ({
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
}) => {
  const [tempName, setTempName] = useState(item.name);
  const [tempQuantity, setTempQuantity] = useState(item.quantity);
  const [showUnitModal, setShowUnitModal] = useState(false);

  // TextInput ref 추가
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTempQuantity(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    setTempName(item.name);
  }, [item.name]);

  // 편집모드가 켜지고 첫 번째 아이템일 때 포커스
  useEffect(() => {
    if (isEditMode && isFirstItem) {
      // 약간의 딜레이를 주어 렌더링이 완료된 후 포커스
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isEditMode, isFirstItem]);

  const handleNameSubmit = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== item.name) {
      onNameChange(item.id!.toString(), trimmedName);
    } else if (!trimmedName) {
      setTempName(item.name);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setTempQuantity(newQuantity);

    const quantity = newQuantity;
    if (!isNaN(quantity) && quantity > 0) {
      onQuantityChange(item.id!.toString(), quantity);
    }
  };

  const handleUnitSelect = (unit: string) => {
    onUnitChange(item.id!.toString(), unit);
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
        {/* **** Check Box Section ************************************************** */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onToggleCheck(item.id!.toString())}
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

        {/* **** Item Info ********************************************************** */}
        <View style={styles.itemInfo}>
          {isEditMode ? (
            <TextInput
              ref={nameInputRef} // ref 연결
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
            {/* Edit Quantity */}
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

            {/* Edit Unit */}
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

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id!.toString())}
        >
          <MaterialIcons name="close" size={20} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    </>
  );
};

export default CartItemCard;
