import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import DeleteButton from '../FridgeHome/FridgeItemCard/DeleteButton';
import QuantityEditor from '../FridgeHome/FridgeItemCard/QuantityEditor';
import UnitSelector from '../FridgeHome/FridgeItemCard/UnitSelector';
import DatePicker from '../modals/DatePicker';
import ItemCategoryModal from '../modals/ItemCategoryModal';
import { ItemFormData } from '../../screens/AddItemScreen';
import { cardStyles as styles } from './styles';
// 검색 기능 추가
import {
  IngredientControllerAPI,
  AutoCompleteSearchResponse,
} from '../../services/API/ingredientControllerAPI';

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
  isEditMode,
  showDeleteButton,
  onUpdateItem,
  onRemoveItem,
  focusedItemId,
  onFocusComplete,
}) => {
  const nameInputRef = useRef<TextInput>(null);

  // 기존 Modal states
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 검색 관련 상태 추가
  const [searchResults, setSearchResults] = useState<
    AutoCompleteSearchResponse[]
  >([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
  // 포커스 처리
  useEffect(() => {
    if (focusedItemId === item.id && isEditMode) {
      setTimeout(() => {
        nameInputRef.current?.focus();
        onFocusComplete?.();
      }, 0);
    }
  }, [focusedItemId, item.id, isEditMode, onFocusComplete]);

  // 개선된 검색 기능 (디바운싱 적용 + 상세 로그)
  useEffect(() => {
    if (!item.name.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError(null);

        console.log('=== 식재료 검색 시작 ===');
        console.log('검색어:', `"${item.name}"`);
        console.log('검색어 길이:', item.name.length);
        console.log(
          '검색어 특수문자 포함 여부:',
          /[^\w가-힣\s]/.test(item.name),
        );

        const results = await IngredientControllerAPI.searchIngredients(
          item.name,
        );

        console.log('=== 검색 결과 ===');
        console.log('결과 개수:', results.length);
        console.log(
          '결과 상세:',
          results.map(r => ({
            id: r.ingredientId,
            name: r.ingredientName,
            category: r.categoryName,
          })),
        );

        setSearchResults(results);
        setShowSearchResults(results.length > 0);

        if (results.length === 0) {
          console.log('⚠️ 검색 결과 없음 - 사용자 입력 그대로 사용됨');
        }
      } catch (error) {
        console.log('=== 검색 에러 ===');
        console.error('검색 실패 상세:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });

        // 에러 타입별 처리
        let errorMessage = '검색 중 오류가 발생했습니다';
        if (error.message.includes('500')) {
          errorMessage = '서버 오류 (500) - 나중에 다시 시도해주세요';
        } else if (error.message.includes('네트워크')) {
          errorMessage = '네트워크 오류 - 연결을 확인해주세요';
        } else if (error.message.includes('timeout')) {
          errorMessage = '검색 시간 초과 - 다시 시도해주세요';
        }

        setSearchResults([]);
        setShowSearchResults(false);
        setSearchError(errorMessage);

        console.log('❌ 검색 실패로 사용자 입력 그대로 사용됨');
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [item.name]);

  // 식재료 선택 처리 (개선됨)
  const handleSelectIngredient = useCallback(
    (ingredient: AutoCompleteSearchResponse) => {
      console.log('=== 식재료 선택 ===');
      console.log('선택된 식재료:', {
        id: ingredient.ingredientId,
        name: ingredient.ingredientName,
        category: ingredient.categoryName,
      });

      // 먼저 이름과 카테고리 설정
      onUpdateItem(item.id, 'name', ingredient.ingredientName);
      onUpdateItem(item.id, 'itemCategory', ingredient.categoryName);

      // 그 다음에 선택된 식재료 정보 저장 (중요: 이게 있어야 confirmIngredients에서 API 재호출 안함)
      const selectedIngredientData = {
        ingredientId: ingredient.ingredientId,
        ingredientName: ingredient.ingredientName,
        categoryId: ingredient.categoryId || 0,
        categoryName: ingredient.categoryName,
      };

      // selectedIngredient 필드에 객체 직접 저장 (JSON.stringify 하지 않음)
      onUpdateItem(item.id, 'selectedIngredient', selectedIngredientData);

      // 검색 결과 숨기기
      setShowSearchResults(false);
      setSearchError(null);

      console.log('✅ 식재료 선택 완료 - API 재검색 없이 사용됨');
    },
    [item.id, onUpdateItem],
  );

  // 기존 핸들러들...
  const handleQuantityChange = useCallback(
    (newQuantity: string) => {
      onUpdateItem(item.id, 'quantity', newQuantity || '0');
    },
    [item.id, onUpdateItem],
  );

  const handleQuantityBlur = useCallback(() => {
    if (!item.quantity || item.quantity === '0') {
      onUpdateItem(item.id, 'quantity', '1');
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
      // 사용자가 직접 수정하는 경우 선택된 식재료 정보 초기화 (중요!)
      onUpdateItem(item.id, 'selectedIngredient', null);
      onUpdateItem(item.id, 'name', text);

      // 이름이 바뀌면 검색 결과 보이기 (빈 텍스트가 아닌 경우)
      if (text.trim()) {
        setShowSearchResults(true);
        setSearchError(null);
      }

      console.log('사용자 직접 입력:', text, '- selectedIngredient 초기화됨');
    },
    [item.id, onUpdateItem],
  );

  const handleUpdateCategories = useCallback((categories: string[]) => {
    setItemCategories(categories);
  }, []);

  // 검색 결과 아이템 렌더링 (개선됨)
  const renderSearchResult = (
    ingredient: AutoCompleteSearchResponse,
    index: number,
  ) => (
    <TouchableOpacity
      key={`${ingredient.ingredientId}-${index}`}
      style={styles.searchResultItem}
      onPress={() => handleSelectIngredient(ingredient)}
    >
      <Text style={styles.searchResultName}>{ingredient.ingredientName}</Text>
      <Text style={styles.searchResultCategory}>{ingredient.categoryName}</Text>
    </TouchableOpacity>
  );

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
                  onFocus={() => {
                    if (item.name.trim() && searchResults.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                  onBlur={() => {
                    // 약간의 딜레이를 두어 검색 결과 선택할 시간 확보
                    setTimeout(() => {
                      setShowSearchResults(false);
                      setSearchError(null);
                    }, 200);
                  }}
                />

                {/* 로딩 인디케이터 */}
                {isSearching && (
                  <View style={styles.searchLoadingIndicator}>
                    <ActivityIndicator size="small" color="#666" />
                  </View>
                )}
              </View>

              {/* 검색 결과 드롭다운 */}
              {showSearchResults && (
                <View style={styles.searchResultsContainer}>
                  {searchResults.length > 0 ? (
                    searchResults.slice(0, 5).map(renderSearchResult) // 최대 5개만 표시
                  ) : searchError ? (
                    <View style={styles.searchErrorItem}>
                      <Text style={styles.searchErrorText}>{searchError}</Text>
                      <Text style={styles.searchErrorSubText}>
                        그래도 입력하신 이름으로 추가할 수 있어요
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.searchErrorItem}>
                      <Text style={styles.searchErrorText}>
                        검색 결과가 없습니다
                      </Text>
                      <Text style={styles.searchErrorSubText}>
                        입력하신 이름으로 새로 추가됩니다
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
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
