import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import UnitSelector from '../FridgeHomeScreen/FridgeItemCard/UnitSelector';
import QuantityEditor from '../FridgeHomeScreen/FridgeItemCard/QuantityEditor';
import { CartItem } from '../../types/CartItem';
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
}) => {
  const [tempName, setTempName] = useState(item.name);
  const [tempQuantity, setTempQuantity] = useState(item.quantity.toString());
  const [showUnitModal, setShowUnitModal] = useState(false);

  useEffect(() => {
    setTempQuantity(item.quantity.toString());
  }, [item.quantity]);

  useEffect(() => {
    setTempName(item.name);
  }, [item.name]);

  const handleNameSubmit = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== item.name) {
      onNameChange(item.id!, trimmedName);
    } else if (!trimmedName) {
      setTempName(item.name);
    }
  };

  const handleQuantityChange = (newQuantity: string) => {
    setTempQuantity(newQuantity);

    const quantity = parseInt(newQuantity, 10);
    if (!isNaN(quantity) && quantity > 0) {
      onQuantityChange(item.id!, quantity);
    }
  };
  const handleUnitSelect = (unit: string) => {
    onUnitChange(item.id!, unit);
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
        delayLongPress={100}
        style={[
          styles.itemCard,
          item.purchased && styles.checkedItemCard,
          isActive && styles.activeItemCard,
        ]}
      >
        {/* **** Check Box Section ************************************************** */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onToggleCheck(item.id!)}
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
              style={styles.nameInput}
              value={tempName}
              onChangeText={setTempName}
              onBlur={handleNameSubmit}
              onSubmitEditing={handleNameSubmit}
              selectTextOnFocus
              autoFocus
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
          onPress={() => onDelete(item.id!)}
        >
          <MaterialIcons name="close" size={20} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    </>
  );
};

export default CartItemCard;
