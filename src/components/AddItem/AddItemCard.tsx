import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
//
import DatePicker from '../modals/DatePicker';
import { ItemFormData } from '../../screens/AddItemScreen';
import ItemCategoryModal from '../modals/ItemCategoryModal';
import IngredientSearchDropdown from './IngredientSearchDropdown';
import DeleteButton from '../FridgeHome/FridgeItemCard/DeleteButton';
import UnitSelector from '../FridgeHome/FridgeItemCard/UnitSelector';
import { useIngredientSearch } from '../../hooks/useIngredientSearch';
import QuantityEditor from '../FridgeHome/FridgeItemCard/QuantityEditor';
import { AutoCompleteSearchResponse } from '../../services/API/ingredientControllerAPI';
//
import { addItemCardStyles as styles } from './styles';

interface AddItemCardProps {
  index: number;
  item: ItemFormData;
  isEditMode: boolean;
  showDeleteButton: boolean;
  focusedItemId?: number;
  onUpdateItem: (
    itemId: number,
    field: keyof ItemFormData,
    value: string,
  ) => void;
  onFocusComplete?: () => void;
  onRemoveItem: (itemId: number) => void;
}

const AddItemCard: React.FC<AddItemCardProps> = ({
  item,
  isEditMode,
  focusedItemId,
  showDeleteButton,
  onUpdateItem,
  onRemoveItem,
  onFocusComplete,
}) => {
  const nameInputRef = useRef<TextInput>(null);

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
    '주류 / 음료',
    '우유 / 유제품',
    '건강식품',
    '장 / 양념 / 소스',
  ]);

  // 식재료 검색 Hook
  const handleIngredientSelect = useCallback(
    (ingredient: AutoCompleteSearchResponse) => {
      // 이름, 카테고리 설정
      onUpdateItem(item.id, 'name', ingredient.ingredientName);
      onUpdateItem(item.id, 'itemCategory', ingredient.categoryName);

      // 선택된 식재료 정보 저장
      const selectedIngredientData = {
        ingredientId: ingredient.ingredientId,
        ingredientName: ingredient.ingredientName,
        categoryId: ingredient.categoryId || 0,
        categoryName: ingredient.categoryName,
      };

      // selectedIngredient 필드에 객체를 JSON 문자열로 변환 저장
      onUpdateItem(
        item.id,
        'selectedIngredient',
        JSON.stringify(selectedIngredientData),
      );
    },
    [item.id, onUpdateItem],
  );

  const {
    searchResults,
    showSearchResults,
    isSearching,
    searchError,
    handleSelectIngredient,
    handleFocus,
    handleBlur,
    resetSearch,
  } = useIngredientSearch({
    searchQuery: item.name,
    onSelect: handleIngredientSelect,
  });

  // 포커스 처리
  useEffect(() => {
    if (focusedItemId === item.id && isEditMode) {
      setTimeout(() => {
        nameInputRef.current?.focus();
        onFocusComplete?.();
      }, 0);
    }
  }, [focusedItemId, item.id, isEditMode, onFocusComplete]);

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      onUpdateItem(item.id, 'quantity', newQuantity || 0);
    },
    [item.id, onUpdateItem],
  );

  const handleQuantityBlur = useCallback(() => {
    if (!item.quantity || item.quantity === 0) {
      onUpdateItem(item.id, 'quantity', 1);
    }
  }, [item.id, item.quantity, onUpdateItem]);

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
      // 사용자가 직접 수정 -> 선택된 식재료 정보 초기화
      onUpdateItem(item.id, 'selectedIngredient', '');
      onUpdateItem(item.id, 'name', text);

      // 이름이 바뀌면 검색 결과 보이기
      if (text.trim()) {
        resetSearch();
      }

      console.log('사용자 직접 입력:', text, '- selectedIngredient 초기화됨');
    },
    [item.id, onUpdateItem, resetSearch],
  );

  const handleUpdateCategories = useCallback((categories: string[]) => {
    setItemCategories(categories);
  }, []);

  return (
    <>
      <View style={styles.itemCard}>
        {/* Delete Button */}
        {isEditMode && showDeleteButton && (
          <DeleteButton onPress={handleDelete} />
        )}

        {/* Item Info */}
        <View style={styles.itemInfo}>
          {/* Name Input/Display with Search */}
          {isEditMode ? (
            <View style={styles.nameInputContainer}>
              <View style={styles.nameInputWrapper}>
                <TextInput
                  ref={nameInputRef}
                  style={styles.nameInput}
                  value={item.name}
                  onChangeText={handleNameChange}
                  placeholder="식재료 이름 입력"
                  placeholderTextColor="#999"
                  accessibilityLabel="식재료 이름 입력"
                  maxLength={20}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

                {/* Loading Indicator */}
                {isSearching && (
                  <View style={styles.searchLoadingIndicator}>
                    <ActivityIndicator size="small" color="#2F4858" />
                  </View>
                )}
              </View>

              {/* Search Result Dropdown */}
              {showSearchResults && (
                <IngredientSearchDropdown
                  searchResults={searchResults}
                  searchError={searchError}
                  onSelect={handleSelectIngredient}
                />
              )}
            </View>
          ) : (
            <Text style={styles.itemName}>{item.name || '이름 없음'}</Text>
          )}

          <View style={styles.itemDetails}>
            {/* Expiry Date */}
            {isEditMode ? (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <FontAwesome6
                  name="calendar-days"
                  size={16}
                  color="#2F4858"
                  style={styles.dateButtonIcon}
                />
                <Text style={styles.dateButtonText}>
                  {item.expirationDate || getDefaultExpiryDate()}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.expiryText}>
                {item.expirationDate || getDefaultExpiryDate()}
              </Text>
            )}

            {/* Quantity and Unit */}
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
      <UnitSelector
        visible={showUnitModal}
        selectedUnit={item.unit}
        options={unitOptions}
        onSelect={handleUnitSelect}
        onClose={() => setShowUnitModal(false)}
      />

      <ItemCategoryModal
        visible={showCategoryModal}
        itemCategories={itemCategories}
        activeItemCategory={item.itemCategory}
        onClose={() => setShowCategoryModal(false)}
        onSelect={handleCategorySelect}
        onUpdateCategories={handleUpdateCategories}
      />

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
