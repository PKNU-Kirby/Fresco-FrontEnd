import React, {useState} from 'react';
import {View, TouchableOpacity, TextInput, Modal} from 'react-native';
import CustomText from '../../common/CustomText';
import DatePicker from '../../modals/DatePicker';
import {styles} from './styles';

type FridgeItem = {
  id: number;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  storageType: string;
  itemCategory: string;
  fridgeId: number;
  unit?: string;
};

type FridgeItemCardProps = {
  item: FridgeItem;
  isEditMode?: boolean;
  onPress?: () => void;
  onQuantityChange?: (itemId: number, newQuantity: string) => void;
  onExpiryDateChange?: (itemId: number, newDate: string) => void;
  onUnitChange?: (itemId: number, newUnit: string) => void;
  onDeleteItem?: (itemId: number) => void;
};

const FridgeItemCard: React.FC<FridgeItemCardProps> = ({
  item,
  isEditMode = false,
  onPress,
  onQuantityChange,
  onUnitChange,
  onExpiryDateChange,
  onDeleteItem,
}) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [localUnit, setLocalUnit] = useState(item.unit || '개');
  const [localExpiryDate, setLocalExpiryDate] = useState(item.expiryDate);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const CardComponent = onPress && !isEditMode ? TouchableOpacity : View;

  const unitOptions = ['개', 'ml', 'g', 'kg', 'L'];

  const handleUnitSelect = (unit: string) => {
    setLocalUnit(unit);
    setShowUnitModal(false);
    onUnitChange?.(item.id, unit);
  };

  const handleDateSelect = (year: number, month: number, day: number) => {
    const formattedDate = `${year}.${month.toString().padStart(2, '0')}.${day
      .toString()
      .padStart(2, '0')}`;
    setLocalExpiryDate(formattedDate);
    setShowDatePicker(false);
    onExpiryDateChange?.(item.id, formattedDate);
  };

  const handleQuantityChange = (newQuantity: string) => {
    // 0이 되면 삭제 확인 모달 표시
    if (newQuantity === '0' || newQuantity === '') {
      setShowDeleteConfirm(true);
      return;
    }

    setLocalQuantity(newQuantity);
    onQuantityChange?.(item.id, newQuantity);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDeleteItem?.(item.id);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    // 원래 수량으로 복구
    setLocalQuantity(localQuantity === '0' ? '1' : localQuantity);
  };

  const handleIncrement = () => {
    const currentNum = parseInt(localQuantity) || 0;
    const newQuantity = (currentNum + 1).toString();
    handleQuantityChange(newQuantity);
  };

  const handleDecrement = () => {
    const currentNum = parseInt(localQuantity) || 0;
    const newQuantity = Math.max(0, currentNum - 1).toString();
    handleQuantityChange(newQuantity);
  };

  const handleTextChange = (text: string) => {
    // 숫자만 입력 가능하도록 필터링
    const numericText = text.replace(/[^0-9]/g, '');
    handleQuantityChange(numericText);
  };

  return (
    <>
      <CardComponent style={styles.itemCard} onPress={onPress}>
        {isEditMode && (
          <TouchableOpacity
            style={styles.deleteItemButton}
            activeOpacity={1}
            onPress={() => onDeleteItem?.(item.id)}>
            <CustomText style={styles.deleteItemButtonText}>✕</CustomText>
          </TouchableOpacity>
        )}

        <View style={styles.itemImageContainer}>
          <View style={styles.itemImagePlaceholder} />
        </View>

        <View style={styles.itemInfo}>
          <CustomText style={styles.itemName}>{item.name}</CustomText>

          <View style={styles.itemDetails}>
            {isEditMode ? (
              // 편집 모드: +/- 버튼과 입력 가능한 개수
              <View style={styles.quantityEditContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  activeOpacity={1}
                  onPress={handleDecrement}>
                  <CustomText style={styles.quantityButtonText}>−</CustomText>
                </TouchableOpacity>

                <TextInput
                  style={styles.quantityInput}
                  value={localQuantity}
                  onChangeText={handleTextChange}
                  keyboardType="numeric"
                  selectTextOnFocus
                />

                <TouchableOpacity
                  style={styles.unitSelector}
                  onPress={() => setShowUnitModal(true)}>
                  <CustomText style={styles.quantityUnit}>
                    {localUnit}
                  </CustomText>
                  <CustomText style={styles.unitDropdownIcon}>▼</CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quantityButton}
                  activeOpacity={1}
                  onPress={handleIncrement}>
                  <CustomText style={styles.quantityButtonText}>+</CustomText>
                </TouchableOpacity>
              </View>
            ) : (
              // 일반 모드: 기존 표시
              <CustomText style={styles.itemQuantity}>
                {item.quantity} {item.unit || '개'}
              </CustomText>
            )}

            {isEditMode ? (
              // 편집 모드: 클릭 가능한 소비기한
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <CustomText style={[styles.itemExpiry, styles.editableExpiry]}>
                  {localExpiryDate}
                </CustomText>
              </TouchableOpacity>
            ) : (
              // 일반 모드: 기존 표시
              <CustomText style={styles.itemExpiry}>
                {item.expiryDate}
              </CustomText>
            )}
          </View>

          <CustomText style={styles.itemStatus}>
            {item.storageType} | {item.itemCategory}
          </CustomText>
        </View>
      </CardComponent>

      {/* 단위 선택 모달 */}
      <Modal
        visible={showUnitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnitModal(false)}>
        <View style={styles.unitModalOverlay}>
          <View style={styles.unitModalContent}>
            <CustomText style={styles.unitModalTitle}>단위 선택</CustomText>

            <View style={styles.unitOptionsContainer}>
              {unitOptions.map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitOption,
                    localUnit === unit && styles.unitOptionSelected,
                  ]}
                  onPress={() => handleUnitSelect(unit)}>
                  <CustomText
                    style={[
                      styles.unitOptionText,
                      localUnit === unit && styles.unitOptionTextSelected,
                    ]}>
                    {unit}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.unitModalCloseButton}
              onPress={() => setShowUnitModal(false)}>
              <CustomText style={styles.unitModalCloseText}>닫기</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 날짜 피커 모달 */}
      <DatePicker
        visible={showDatePicker}
        initialDate={localExpiryDate}
        onDateSelect={handleDateSelect}
        onClose={() => setShowDatePicker(false)}
      />

      {/* 삭제 확인 모달 */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={handleDeleteCancel}>
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <CustomText style={styles.deleteModalTitle}>식재료 삭제</CustomText>
            <CustomText style={styles.deleteModalMessage}>
              "{item.name}"을 삭제할까요?
            </CustomText>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={handleDeleteCancel}>
                <CustomText style={styles.deleteModalCancelText}>
                  취소
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteModalConfirmButton}
                onPress={handleDeleteConfirm}>
                <CustomText style={styles.deleteModalConfirmText}>
                  삭제
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default FridgeItemCard;
