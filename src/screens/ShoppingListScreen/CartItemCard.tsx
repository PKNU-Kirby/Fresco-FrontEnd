import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import { CartItem } from './index';
import { Cardstyles as styles } from './styles';

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
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(item.quantity.toString());
  const [showUnitModal, setShowUnitModal] = useState(false);

  useEffect(() => {
    setTempName(item.name);
  }, [item.name]);

  const handleNameSubmit = () => {
    if (tempName.trim() && tempName.trim() !== item.name) {
      onNameChange(item.id, tempName.trim());
    } else {
      setTempName(item.name);
    }
  };

  const handleQuantityEdit = () => {
    if (!isEditMode) return;
    setTempQuantity(item.quantity.toString());
    setIsEditingQuantity(true);
  };

  const handleQuantitySubmit = () => {
    const newQuantity = parseInt(tempQuantity, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onQuantityChange(item.id, newQuantity);
    } else {
      setTempQuantity(item.quantity.toString());
    }
    setIsEditingQuantity(false);
  };

  const handleQuantityIncrease = () => {
    if (!isEditMode) return;
    onQuantityChange(item.id, item.quantity + 1);
  };

  const handleQuantityDecrease = () => {
    if (!isEditMode) return;
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
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
        style={[
          styles.itemCard,
          item.isChecked && styles.checkedItemCard,
          isActive && styles.activeItemCard,
        ]}
      >
        {/* Check Box Section */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onToggleCheck(item.id)}
        >
          <View
            style={[
              styles.itemImagePlaceholder,
              item.isChecked && styles.checkedImagePlaceholder,
            ]}
          >
            {item.isChecked && (
              <MaterialIcons name="check" size={16} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        {/* Item Info */}
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
            <CustomText
              style={[styles.itemName, item.isChecked && styles.checkedText]}
            >
              {item.name}
            </CustomText>
          )}

          <View style={styles.itemDetails}>
            {/* Edit Quantity */}
            {isEditMode ? (
              <View style={styles.quantityContainer}>
                {!isEditingQuantity ? (
                  <>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={handleQuantityDecrease}
                    >
                      <MaterialIcons name="remove" size={16} color="#666" />
                    </TouchableOpacity>

                    {isEditMode ? (
                      <TextInput
                        style={styles.quantityInput}
                        value={tempQuantity}
                        onChangeText={setTempQuantity}
                        onBlur={handleQuantitySubmit}
                        onSubmitEditing={handleQuantitySubmit}
                        keyboardType="numeric"
                        selectTextOnFocus
                        returnKeyType="done"
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={handleQuantityEdit}
                        style={styles.quantityTextContainer}
                      >
                        <CustomText
                          style={[
                            styles.quantityText,
                            item.isChecked && styles.checkedText,
                          ]}
                        >
                          {item.quantity}
                        </CustomText>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={handleQuantityIncrease}
                    >
                      <MaterialIcons name="add" size={16} color="#666" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TextInput
                    style={styles.quantityInput}
                    value={tempQuantity}
                    onChangeText={setTempQuantity}
                    onBlur={handleQuantitySubmit}
                    onSubmitEditing={handleQuantitySubmit}
                    keyboardType="numeric"
                    selectTextOnFocus
                    autoFocus
                  />
                )}
              </View>
            ) : (
              <CustomText
                style={[
                  styles.simpleQuantityText,
                  item.isChecked && styles.checkedText,
                ]}
              >
                {item.quantity}
              </CustomText>
            )}

            {/* Edit Unit */}
            {isEditMode ? (
              <TouchableOpacity
                style={styles.unitSelector}
                onPress={handleUnitModalOpen}
              >
                <CustomText
                  style={[
                    styles.unitText,
                    item.isChecked && styles.checkedText,
                  ]}
                >
                  {item.unit}
                </CustomText>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={14}
                  color="#666"
                />
              </TouchableOpacity>
            ) : (
              <CustomText
                style={[
                  styles.simpleUnitText,
                  item.isChecked && styles.checkedText,
                ]}
              >
                {item.unit}
              </CustomText>
            )}
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
        >
          <MaterialIcons name="close" size={20} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* 단위 선택 모달 - 편집 모드일 때만 동작 */}
      {isEditMode && (
        <Modal
          visible={showUnitModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowUnitModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <CustomText style={styles.modalTitle}>단위 선택</CustomText>

              <View style={styles.unitOptions}>
                {UNITS.map(unit => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitOption,
                      unit === item.unit && styles.selectedUnitOption,
                    ]}
                    onPress={() => handleUnitSelect(unit)}
                  >
                    <CustomText
                      style={[
                        styles.unitOptionText,
                        unit === item.unit && styles.selectedUnitOptionText,
                      ]}
                    >
                      {unit}
                    </CustomText>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowUnitModal(false)}
              >
                <CustomText style={styles.modalCloseText}>닫기</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default CartItemCard;
