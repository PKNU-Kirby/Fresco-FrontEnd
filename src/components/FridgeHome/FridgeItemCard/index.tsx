import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import DatePicker from '../../Recipe/modals/DatePicker';
import SliderQuantityEditor from './SliderQuantityEditor';
import UnitSelector from './UnitSelector';
import DeleteButton from './DeleteButton';
import ConfirmModal from '../../Recipe/modals/ConfirmModal';
import { cardStyles as styles } from './styles';

type FridgeItem = {
  id: string;
  fridgeId: string;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  itemCategory: string;
  unit?: string;
  maxQuantity?: number;
};

type FridgeItemCardProps = {
  item: FridgeItem;
  isEditMode?: boolean;
  useSlider?: boolean;
  onPress?: () => void;
  onQuantityChange?: (itemId: string, newQuantity: string) => void;
  onExpiryDateChange?: (itemId: string, newDate: string) => void;
  onUnitChange?: (itemId: string, newUnit: string) => void;
  onDeleteItem?: (itemId: string) => void;
  onMaxQuantityChange?: (itemId: string, newMaxQuantity: number) => void;
};

const FridgeItemCard: React.FC<FridgeItemCardProps> = ({
  item,
  isEditMode = false,
  onPress,
  onQuantityChange,
  onUnitChange,
  onExpiryDateChange,
  onDeleteItem,
  onMaxQuantityChange,
}) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [localUnit, setLocalUnit] = useState(item.unit || '개');
  const [localExpiryDate, setLocalExpiryDate] = useState(item.expiryDate);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previousQuantity, setPreviousQuantity] = useState(item.quantity);
  const [maxQuantity, setMaxQuantity] = useState(
    item.maxQuantity || parseFloat(item.quantity) || 10,
  );

  const CardComponent: React.ComponentType<any> =
    onPress && !isEditMode ? TouchableOpacity : View;
  const unitOptions = ['개', 'ml', 'g', 'kg', 'L'];

  // (!EditMode -> EditMode) : init maxQuantity
  useEffect(() => {
    if (isEditMode) {
      const currentQuantity = parseFloat(item.quantity) || 10;
      const initialMaxQuantity = Math.max(
        item.maxQuantity || currentQuantity,
        currentQuantity,
      );
      setMaxQuantity(initialMaxQuantity);
    }
  }, [isEditMode]);

  // item.quantity prop 변경 -> localQuantity 동기화
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  // item.maxQuantity prop 변경 시 maxQuantity 동기화 (외부에서 변경된 경우만)
  useEffect(() => {
    if (item.maxQuantity !== undefined && item.maxQuantity !== maxQuantity) {
      setMaxQuantity(item.maxQuantity);
    }
  }, [item.maxQuantity]);

  const handleUnitSelect = (unit: string) => {
    setLocalUnit(unit);
    setShowUnitModal(false);
    onUnitChange?.(item.id, unit);
  };

  const handleDateSelect = (year: number, month: number, day: number) => {
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;
    setLocalExpiryDate(formattedDate);
    setShowDatePicker(false);
    onExpiryDateChange?.(item.id, formattedDate);
  };

  const handleQuantityChange = (newQuantity: string) => {
    if (newQuantity === '') {
      setLocalQuantity(newQuantity);
      return;
    }
    if (newQuantity === '0') {
      setPreviousQuantity(localQuantity);
      setLocalQuantity(newQuantity);
      setShowDeleteModal(true); // Alert 대신 모달 표시
      return;
    }

    setLocalQuantity(newQuantity);
    onQuantityChange?.(item.id, newQuantity);
  };

  const handleMaxQuantityChange = (newMaxQuantity: number) => {
    if (newMaxQuantity > maxQuantity) {
      setMaxQuantity(newMaxQuantity);
      onMaxQuantityChange?.(item.id, newMaxQuantity);
    }
  };

  const handleDeleteConfirm = (_name: string) => {
    setShowDeleteModal(true); // Alert 대신 모달 표시
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onDeleteItem?.(item.id);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    // 수량이 0으로 변경되어서 삭제 모달이 나타난 경우, 이전 수량으로 복원
    if (localQuantity === '0') {
      setLocalQuantity(previousQuantity);
    }
  };

  const handleTextInputBlur = () => {
    if (localQuantity === '') {
      setLocalQuantity('1');
      onQuantityChange?.(item.id, '1');
    }
  };

  return (
    <>
      <CardComponent style={styles.itemCard} onPress={onPress}>
        {isEditMode && (
          <DeleteButton onPress={() => handleDeleteConfirm(item.name)} />
        )}

        <View style={styles.itemImageContainer}>
          <View style={styles.itemImagePlaceholder} />
        </View>

        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            {isEditMode && (
              <TouchableOpacity
                style={styles.expiaryContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.itemExpiry, styles.editableExpiry]}>
                  [{localExpiryDate}]
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditMode ? (
            <View style={styles.itemDetails}>
              <SliderQuantityEditor
                quantity={localQuantity}
                unit={localUnit}
                maxQuantity={maxQuantity}
                isEditMode={isEditMode}
                onQuantityChange={handleQuantityChange}
                onMaxQuantityChange={handleMaxQuantityChange}
                onTextBlur={handleTextInputBlur}
                onUnitPress={() => setShowUnitModal(true)}
              />
            </View>
          ) : (
            <>
              <View style={styles.itemDetails}>
                <Text style={styles.itemQuantity}>
                  {item.quantity} {item.unit || '개'}
                </Text>
                <Text style={styles.itemExpiry}>{item.expiryDate}</Text>
              </View>
              <Text style={styles.itemStatus}>{item.itemCategory}</Text>
            </>
          )}
        </View>
      </CardComponent>

      {/* 기존 모달들 */}
      <UnitSelector
        visible={showUnitModal}
        selectedUnit={localUnit}
        options={unitOptions}
        onSelect={handleUnitSelect}
        onClose={() => setShowUnitModal(false)}
      />

      <DatePicker
        visible={showDatePicker}
        initialDate={localExpiryDate}
        onDateSelect={handleDateSelect}
        onClose={() => setShowDatePicker(false)}
      />

      {/* 새로운 삭제 확인 모달 */}
      <ConfirmModal
        visible={showDeleteModal}
        title="식재료 삭제"
        message={
          <Text style={styles.message}>
            식재료 <Text style={styles.emphmessage}>{item.name}</Text> 을(를)
            삭제합니다.
          </Text>
        }
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'delete-outline', color: '#FF6B6B', size: 48 }}
        confirmText="삭제"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default FridgeItemCard;
