import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import CustomText from '../../components/common/CustomText';
import DeleteButton from '../FridgeHomeScreen/FridgeItemCard/DeleteButton';
import QuantityEditor from '../FridgeHomeScreen/FridgeItemCard/QuantityEditor';
import UnitSelector from '../FridgeHomeScreen/FridgeItemCard/UnitSelector';
import DatePicker from '../../components/modals/DatePicker';
import ItemCategoryModal from '../../components/modals/ItemCategoryModal';
import StorageTypeModal from '../../components/modals/StorageTypeModal';
import { ItemFormData } from './index';
import { cardStyles } from './styles';

interface AddItemCardProps {
  item: ItemFormData;
  index: number;
  isEditMode: boolean;
  showDeleteButton: boolean;
  onUpdateItem: (
    itemId: string,
    field: keyof ItemFormData,
    value: string,
  ) => void;
  onRemoveItem: (itemId: string) => void;
  focusedItemId?: string | null;
  onFocusComplete?: () => void;
}

const AddItemCard: React.FC<AddItemCardProps> = ({
  item,
  // index,
  isEditMode,
  showDeleteButton,
  onUpdateItem,
  onRemoveItem,
  focusedItemId,
  onFocusComplete,
}) => {
  const nameInputRef = useRef<TextInput>(null);
  // Modal states
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);

  // Options for modals
  const unitOptions = ['개', 'kg', 'g', 'L', 'ml'];

  // 카테고리 목록 상태 (실제로는 상위 컴포넌트나 Context에서 관리해야 함)
  const [itemCategories, setItemCategories] = useState([
    '베이커리',
    '채소 / 과일',
    '정육 / 계란',
    '가공식품',
    '수산 / 건어물',
    '쌀 / 잡곡',
    '우유 / 유제품',
    '건강식품',
    '장 / 양념 / 소스',
    '기타',
  ]);

  // 보관방법 목록 상태
  const [storageTypes, setStorageTypes] = useState(['냉장', '냉동', '실온']);

  useEffect(() => {
    if (focusedItemId === item.id && isEditMode) {
      setTimeout(() => {
        nameInputRef.current?.focus();
        onFocusComplete?.();
      }, 0); // 스크롤 애니메이션 후 포커스
    }
  }, [focusedItemId, item.id, isEditMode, onFocusComplete]);

  // Quantity handlers
  // 기존 핸들러들을 하나로 통합
  const handleQuantityChange = useCallback(
    (newQuantity: string) => {
      onUpdateItem(item.id, 'quantity', newQuantity || '0');
    },
    [item.id, onUpdateItem],
  );

  const handleQuantityBlur = useCallback(() => {
    // 빈값이면 1로 설정
    if (!item.quantity || item.quantity === '0') {
      onUpdateItem(item.id, 'quantity', '1');
    }
  }, [item.id, item.quantity, onUpdateItem]);

  // 기존의 handleIncrement, handleDecrement는 삭제

  // Delete handler
  const handleDelete = useCallback(() => {
    onRemoveItem(item.id);
  }, [item.id, onRemoveItem]);

  const getDefaultExpiryDate = (): string => {
    const today = new Date();
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const year = oneWeekLater.getFullYear();
    const month = String(oneWeekLater.getMonth() + 1).padStart(2, '0');
    const day = String(oneWeekLater.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  };

  // Date handler
  const handleDateSelect = useCallback(
    (year: number, month: number, day: number) => {
      const formattedDate = `${year}.${String(month).padStart(2, '0')}.${String(
        day,
      ).padStart(2, '0')}`;
      onUpdateItem(item.id, 'expirationDate', formattedDate);
      setShowDatePicker(false);
    },
    [item.id, onUpdateItem],
  );

  // Modal handlers
  const handleUnitSelect = useCallback(
    (unit: string) => {
      onUpdateItem(item.id, 'unit', unit);
      setShowUnitModal(false);
    },
    [item.id, onUpdateItem],
  );

  const handleStorageSelect = useCallback(
    (storage: string) => {
      onUpdateItem(item.id, 'storageType', storage);
    },
    [item.id, onUpdateItem],
  );

  const handleCategorySelect = useCallback(
    (category: string) => {
      onUpdateItem(item.id, 'itemCategory', category);
    },
    [item.id, onUpdateItem],
  );

  const handleNameChange = useCallback(
    (text: string) => {
      onUpdateItem(item.id, 'name', text);
    },
    [item.id, onUpdateItem],
  );

  // 카테고리 업데이트 핸들러
  const handleUpdateCategories = useCallback((categories: string[]) => {
    setItemCategories(categories);
    // TODO: 실제로는 상위 컴포넌트나 Context로 전달해야 함
  }, []);

  // 보관방법 업데이트 핸들러
  const handleUpdateStorageTypes = useCallback((types: string[]) => {
    setStorageTypes(types);
    // TODO: 실제로는 상위 컴포넌트나 Context로 전달해야 함
  }, []);

  return (
    <>
      <View style={cardStyles.itemCard}>
        {/* Delete Button */}
        {isEditMode && showDeleteButton && (
          <DeleteButton onPress={handleDelete} />
        )}

        {/* Image Section */}
        <View style={cardStyles.imageContainer}>
          <View style={cardStyles.imagePlaceholder} />
        </View>

        {/* Item Info */}
        <View style={cardStyles.itemInfo}>
          {/* Name Input/Display */}
          {isEditMode ? (
            <TextInput
              ref={nameInputRef}
              style={cardStyles.nameInput}
              value={item.name}
              onChangeText={handleNameChange}
              placeholder="식재료 이름 입력"
              placeholderTextColor="#999"
              accessibilityLabel="식재료 이름 입력"
              maxLength={50}
            />
          ) : (
            <CustomText style={cardStyles.itemName}>
              {item.name || '이름 없음'}
            </CustomText>
          )}

          {/* Quantity and Unit */}
          <View style={cardStyles.itemDetails}>
            {isEditMode ? (
              <QuantityEditor
                quantity={item.quantity}
                unit={item.unit}
                onQuantityChange={handleQuantityChange}
                onTextBlur={handleQuantityBlur}
                onUnitPress={() => setShowUnitModal(true)}
              />
            ) : (
              <CustomText style={cardStyles.quantityText}>
                {item.quantity} {item.unit || '개'}
              </CustomText>
            )}

            {/* Expiry Date */}
            {isEditMode ? (
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <CustomText style={cardStyles.dateButtonText}>
                  {item.expirationDate || getDefaultExpiryDate()}
                </CustomText>
              </TouchableOpacity>
            ) : (
              <CustomText style={cardStyles.expiryText}>
                {item.expirationDate || getDefaultExpiryDate()}
              </CustomText>
            )}
          </View>

          {/* Storage Type and Category */}
          <View style={cardStyles.statusRow}>
            {isEditMode ? (
              <>
                <TouchableOpacity
                  style={cardStyles.categoryButton}
                  onPress={() => setShowStorageModal(true)}
                  accessibilityLabel={`보관방법: ${item.storageType}`}
                  accessibilityRole="button"
                >
                  <CustomText style={cardStyles.categoryButtonText}>
                    {item.storageType}
                  </CustomText>
                </TouchableOpacity>

                <CustomText style={cardStyles.separator}>|</CustomText>

                <TouchableOpacity
                  style={cardStyles.categoryButton}
                  onPress={() => setShowCategoryModal(true)}
                  accessibilityLabel={`카테고리: ${item.itemCategory}`}
                  accessibilityRole="button"
                >
                  <CustomText style={cardStyles.categoryButtonText}>
                    {item.itemCategory}
                  </CustomText>
                </TouchableOpacity>
              </>
            ) : (
              <CustomText style={cardStyles.statusText}>
                {item.storageType} | {item.itemCategory}
              </CustomText>
            )}
          </View>
        </View>
      </View>

      {/* Modals */}

      {/* Unit Selector */}
      <UnitSelector
        visible={showUnitModal}
        selectedUnit={item.unit}
        options={unitOptions}
        onSelect={handleUnitSelect}
        onClose={() => setShowUnitModal(false)}
      />

      {/* Storage Type Modal */}
      <StorageTypeModal
        visible={showStorageModal}
        storageTypes={storageTypes}
        activeStorageType={item.storageType}
        onClose={() => setShowStorageModal(false)}
        onSelect={handleStorageSelect}
        onUpdateStorageTypes={handleUpdateStorageTypes}
      />

      {/* Category Modal */}
      <ItemCategoryModal
        visible={showCategoryModal}
        itemCategories={itemCategories}
        activeItemCategory={item.itemCategory}
        onClose={() => setShowCategoryModal(false)}
        onSelect={handleCategorySelect}
        onUpdateCategories={handleUpdateCategories}
      />

      {/* Date Picker */}
      <DatePicker
        visible={showDatePicker}
        initialDate={
          item.expirationDate ||
          new Date().toISOString().split('T')[0].replace(/-/g, '.')
        }
        onDateSelect={handleDateSelect}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );
};

export default AddItemCard;
