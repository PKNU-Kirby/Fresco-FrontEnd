import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import { CartItem } from './index';
import { Cardstyles as styles } from './styles';

interface CartItemCardProps {
  item: CartItem;
  onToggleCheck: (itemId: string) => void;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onUnitChange: (itemId: string, newUnit: string) => void;
  onDelete: (itemId: string) => void;
  onDrag: () => void;
  isActive: boolean;
}

const UNITS = ['개', 'kg', 'g', 'L', 'ml', '봉지', '포', '상자', '병'];

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onToggleCheck,
  onQuantityChange,
  onUnitChange,
  onDelete,
  onDrag,
  isActive,
}) => {
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(item.quantity.toString());
  const [showUnitModal, setShowUnitModal] = useState(false);

  const handleQuantityEdit = () => {
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
    onQuantityChange(item.id, item.quantity + 1);
  };

  const handleQuantityDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleUnitSelect = (unit: string) => {
    onUnitChange(item.id, unit);
    setShowUnitModal(false);
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
        {/* 체크박스 (이미지 영역) */}
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
              <MaterialIcons name="check" size={24} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        {/* 아이템 정보 */}
        <View style={styles.itemInfo}>
          <CustomText
            style={[styles.itemName, item.isChecked && styles.checkedText]}
          >
            {item.name}
          </CustomText>

          <View style={styles.itemDetails}>
            {/* 수량 편집 */}
            <View style={styles.quantityContainer}>
              {!isEditingQuantity ? (
                <>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={handleQuantityDecrease}
                  >
                    <MaterialIcons name="remove" size={16} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleQuantityEdit}>
                    <CustomText
                      style={[
                        styles.quantityText,
                        item.isChecked && styles.checkedText,
                      ]}
                    >
                      {item.quantity}
                    </CustomText>
                  </TouchableOpacity>

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

            {/* 단위 선택 */}
            <TouchableOpacity
              style={styles.unitSelector}
              onPress={() => setShowUnitModal(true)}
            >
              <CustomText
                style={[styles.unitText, item.isChecked && styles.checkedText]}
              >
                {item.unit}
              </CustomText>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={14}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* 카테고리 */}
          <CustomText
            style={[styles.itemCategory, item.isChecked && styles.checkedText]}
          >
            {item.category}
          </CustomText>
        </View>

        {/* 삭제 버튼 */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
        >
          <MaterialIcons name="close" size={20} color="#999" />
        </TouchableOpacity>

        {/* 드래그 핸들 */}
        <TouchableOpacity
          style={styles.dragHandle}
          onLongPress={onDrag}
          disabled={isActive}
        >
          <MaterialIcons name="drag-handle" size={20} color="#ccc" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* 단위 선택 모달 */}
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
    </>
  );
};

export default CartItemCard;
