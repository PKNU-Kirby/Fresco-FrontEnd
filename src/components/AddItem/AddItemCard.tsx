import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';
import DeleteButton from '../FridgeHome/FridgeItemCard/DeleteButton';
import QuantityEditor from '../FridgeHome/FridgeItemCard/QuantityEditor';
import UnitSelector from '../FridgeHome/FridgeItemCard/UnitSelector';
import DatePicker from '../../components/modals/DatePicker';
import ItemCategoryModal from '../../components/modals/ItemCategoryModal';
import { ItemFormData } from '../../screens/AddItemScreen';
import { cardStyles as styles } from './styles';

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

  const unitOptions = ['개', 'kg', 'g', 'L', 'ml'];

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

  useEffect(() => {
    if (focusedItemId === item.id && isEditMode) {
      setTimeout(() => {
        nameInputRef.current?.focus();
        onFocusComplete?.();
      }, 0);
    }
  }, [focusedItemId, item.id, isEditMode, onFocusComplete]);

  // Quantity handlers
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

    return `${year}-${month}-${day}`;
  };

  // Date handler
  const handleDateSelect = useCallback(
    (year: number, month: number, day: number) => {
      const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(
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

  // Category handlers
  const handleUpdateCategories = useCallback((categories: string[]) => {
    setItemCategories(categories);
    // TODO: 실제로는 상위 컴포넌트나 Context로 전달해야 함
  }, []);

  return (
    <>
      <View style={styles.itemCard}>
        {/* Delete Button */}
        {isEditMode && showDeleteButton && (
          <DeleteButton onPress={handleDelete} />
        )}

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder} />
        </View>

        {/* Item Info */}
        <View style={styles.itemInfo}>
          {/* Name Input/Display */}
          {isEditMode ? (
            <TextInput
              ref={nameInputRef}
              style={styles.nameInput}
              value={item.name}
              onChangeText={handleNameChange}
              placeholder="식재료 이름 입력"
              placeholderTextColor="#999"
              accessibilityLabel="식재료 이름 입력"
              maxLength={20}
            />
          ) : (
            <Text style={styles.itemName}>{item.name || '이름 없음'}</Text>
          )}

          {/* Quantity and Unit */}
          <View style={styles.itemDetails}>
            {isEditMode ? (
              <QuantityEditor
                quantity={item.quantity}
                unit={item.unit}
                onQuantityChange={handleQuantityChange}
                onTextBlur={handleQuantityBlur}
                onUnitPress={() => setShowUnitModal(true)}
              />
            ) : (
              <Text style={styles.quantityText}>
                {item.quantity} {item.unit || '개'}
              </Text>
            )}

            {/* Expiry Date */}
            {isEditMode ? (
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {item.expirationDate || getDefaultExpiryDate()}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.expiryText}>
                {item.expirationDate || getDefaultExpiryDate()}
              </Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.statusRow}>
            {isEditMode ? (
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategoryModal(true)}
                accessibilityLabel={`카테고리: ${item.itemCategory}`}
                accessibilityRole="button"
              >
                <Text style={styles.categoryButtonText}>
                  {item.itemCategory}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.statusText}>{item.itemCategory}</Text>
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
