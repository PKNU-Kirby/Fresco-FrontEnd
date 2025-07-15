import React, {useState} from 'react';
import {View, TouchableOpacity, Alert} from 'react-native';
import CustomText from '../../common/CustomText';
import DatePicker from '../../modals/DatePicker';
import QuantityEditor from './QuantityEditor';
import UnitSelector from './UnitSelector';
import DeleteButton from './DeleteButton';
import {cardStyles as styles} from './styles';

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
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [previousQuantity, setPreviousQuantity] = useState(item.quantity);

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
    if (newQuantity === '') {
      setLocalQuantity(newQuantity);
      return;
    }

    if (newQuantity === '0') {
      setPreviousQuantity(localQuantity);
      setLocalQuantity(newQuantity);
      handleDeleteConfirm(item.name);
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
          setLocalQuantity(previousQuantity);
        },
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          onDeleteItem?.(item.id);
        },
      },
    ]);
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
          <CustomText style={styles.itemName}>{item.name}</CustomText>

          <View style={styles.itemDetails}>
            {isEditMode ? (
              <QuantityEditor
                quantity={localQuantity}
                unit={localUnit}
                onQuantityChange={handleQuantityChange}
                onTextBlur={handleTextInputBlur}
                onUnitPress={() => setShowUnitModal(true)}
              />
            ) : (
              <CustomText style={styles.itemQuantity}>
                {item.quantity} {item.unit || '개'}
              </CustomText>
            )}

            {isEditMode ? (
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <CustomText style={[styles.itemExpiry, styles.editableExpiry]}>
                  {localExpiryDate}
                </CustomText>
              </TouchableOpacity>
            ) : (
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
    </>
  );
};

export default FridgeItemCard;
