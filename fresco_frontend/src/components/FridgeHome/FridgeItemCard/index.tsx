import React, {useState} from 'react';
import {View, TouchableOpacity, TextInput, Modal, Alert} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
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
  const [previousQuantity, setPreviousQuantity] = useState(item.quantity); // 이전 수량 저장

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
    // 빈 문자열이면 일단 설정하고 넘어감 (사용자가 입력 중일 수 있음)
    if (newQuantity === '') {
      setLocalQuantity(newQuantity);
      return;
    }

    // 0이 되면 삭제 확인 모달 표시
    if (newQuantity === '0') {
      setPreviousQuantity(localQuantity); // 현재 수량을 저장
      setLocalQuantity(newQuantity);
      handleDeleteConfirm(item.name); // 함수 호출 수정
      return;
    }

    setLocalQuantity(newQuantity);
    onQuantityChange?.(item.id, newQuantity);
  };

  const handleDeleteConfirm = (name: string) => {
    Alert.alert('', `식재료 [${name}] 을(를) 삭제합니다.`, [
      {
        text: '취소',
        style: 'cancel',
        onPress: () => {
          setShowDeleteConfirm(false);
          // 이전 수량으로 복구
          setLocalQuantity(previousQuantity);
        },
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setShowDeleteConfirm(false);
          onDeleteItem?.(item.id);
        },
      },
    ]);
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

  // TextInput에서 포커스를 잃었을 때 처리
  const handleTextInputBlur = () => {
    // 빈 문자열이면 1로 설정
    if (localQuantity === '') {
      setLocalQuantity('1');
      onQuantityChange?.(item.id, '1');
    }
  };

  return (
    <>
      <CardComponent style={styles.itemCard} onPress={onPress}>
        {isEditMode && (
          <TouchableOpacity
            style={styles.deleteItemButton}
            activeOpacity={1}
            onPress={() => handleDeleteConfirm(item.name)}>
            <FontAwesome6 name="circle-xmark" size={24} color="#666" solid />
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
                  <FontAwesome6 name="circle-minus" size={25} color="#666" />
                </TouchableOpacity>

                <TextInput
                  style={styles.quantityInput}
                  value={localQuantity}
                  onChangeText={handleTextChange}
                  onBlur={handleTextInputBlur} // 포커스 잃었을 때 처리 추가
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
                  <FontAwesome6 name="circle-plus" size={24} color="#666" />
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
    </>
  );
};

export default FridgeItemCard;
