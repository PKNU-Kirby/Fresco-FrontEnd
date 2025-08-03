import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import CustomText from '../../components/common/CustomText';
import UnitSelector from '../FridgeHomeScreen/FridgeItemCard/UnitSelector';
import DatePicker from '../../components/modals/DatePicker';
import { ItemFormData } from './index';
import { cardStyles } from './styles';

interface AddItemCardProps {
  item: ItemFormData;
  isEditMode: boolean;
  showDeleteButton: boolean;
  onUpdateItem: (
    itemId: string,
    field: keyof ItemFormData,
    value: string,
  ) => void;
  onRemoveItem: (itemId: string) => void;
}

const AddItemCard: React.FC<AddItemCardProps> = ({
  item,
  isEditMode,
  showDeleteButton,
  onUpdateItem,
  onRemoveItem,
}) => {
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);

  const unitOptions = ['개', 'kg', 'g', 'L', 'ml', '봉지', '포', '상자', '병'];
  const storageTypes = ['냉장', '냉동', '실온'];
  const categories = [
    '야채',
    '과일',
    '육류',
    '해산물',
    '유제품',
    '조미료',
    '기타',
  ];

  // 수량 조절
  const handleQuantityChange = (newQuantity: string) => {
    const numericText = newQuantity.replace(/[^0-9]/g, '');
    onUpdateItem(item.id, 'quantity', numericText || '1');
  };

  const handleIncrement = () => {
    const currentNum = parseInt(item.quantity) || 0;
    onUpdateItem(item.id, 'quantity', (currentNum + 1).toString());
  };

  const handleDecrement = () => {
    const currentNum = parseInt(item.quantity) || 0;
    onUpdateItem(item.id, 'quantity', Math.max(1, currentNum - 1).toString());
  };

  // 삭제 확인
  const handleDelete = () => {
    Alert.alert('삭제 확인', '이 식재료를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => onRemoveItem(item.id),
      },
    ]);
  };

  // 날짜 변경 (DatePicker 컴포넌트용)
  const handleDateSelect = (year: number, month: number, day: number) => {
    const formattedDate = `${year}.${String(month).padStart(2, '0')}.${String(
      day,
    ).padStart(2, '0')}`;
    onUpdateItem(item.id, 'expiryDate', formattedDate);
    setShowDatePicker(false);
  };

  // 카메라 열기
  const openCamera = () => {
    // TODO: 카메라 화면으로 이동
    console.log('카메라 열기');
  };

  return (
    <>
      <View style={cardStyles.itemCard}>
        {/* 삭제 버튼 */}
        {isEditMode && showDeleteButton && (
          <TouchableOpacity
            style={cardStyles.deleteButton}
            onPress={handleDelete}
          >
            <FontAwesome6 name="circle-xmark" size={24} color="#666" solid />
          </TouchableOpacity>
        )}

        {/* 사진 영역 */}
        <TouchableOpacity
          style={cardStyles.imageContainer}
          onPress={isEditMode ? openCamera : undefined}
          disabled={!isEditMode}
        >
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={cardStyles.itemImage} />
          ) : (
            <View style={cardStyles.imagePlaceholder}>
              <MaterialIcons
                name={isEditMode ? 'add-a-photo' : 'image'}
                size={24}
                color="#999"
              />
            </View>
          )}
        </TouchableOpacity>

        {/* 아이템 정보 */}
        <View style={cardStyles.itemInfo}>
          {/* 식재료 이름 */}
          {isEditMode ? (
            <TextInput
              style={cardStyles.nameInput}
              value={item.name}
              onChangeText={text => onUpdateItem(item.id, 'name', text)}
              placeholder="식재료 이름"
              placeholderTextColor="#999"
            />
          ) : (
            <CustomText style={cardStyles.itemName}>{item.name}</CustomText>
          )}

          {/* 수량 및 단위 */}
          <View style={cardStyles.itemDetails}>
            {isEditMode ? (
              <View style={cardStyles.quantityContainer}>
                <TouchableOpacity
                  style={cardStyles.quantityButton}
                  onPress={handleDecrement}
                >
                  <FontAwesome6 name="circle-minus" size={20} color="#666" />
                </TouchableOpacity>

                <TextInput
                  style={cardStyles.quantityInput}
                  value={item.quantity}
                  onChangeText={handleQuantityChange}
                  keyboardType="numeric"
                  selectTextOnFocus
                />

                <TouchableOpacity
                  style={cardStyles.unitSelector}
                  onPress={() => setShowUnitModal(true)}
                >
                  <CustomText style={cardStyles.unitText}>
                    {item.unit}
                  </CustomText>
                  <CustomText style={cardStyles.dropdownIcon}>▼</CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={cardStyles.quantityButton}
                  onPress={handleIncrement}
                >
                  <FontAwesome6 name="circle-plus" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ) : (
              <CustomText style={cardStyles.quantityText}>
                {item.quantity} {item.unit}
              </CustomText>
            )}

            {/* 유통기한 */}
            {isEditMode ? (
              <TouchableOpacity
                style={cardStyles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <CustomText style={cardStyles.dateButtonText}>
                  {item.expiryDate || '유통기한 선택'}
                </CustomText>
              </TouchableOpacity>
            ) : (
              <CustomText style={cardStyles.expiryText}>
                {item.expiryDate}
              </CustomText>
            )}
          </View>

          {/* 보관방법 및 카테고리 */}
          <View style={cardStyles.statusRow}>
            {isEditMode ? (
              <>
                <TouchableOpacity
                  style={cardStyles.categoryButton}
                  onPress={() => setShowStorageModal(true)}
                >
                  <CustomText style={cardStyles.categoryButtonText}>
                    {item.storageType}
                  </CustomText>
                </TouchableOpacity>

                <CustomText style={cardStyles.separator}>|</CustomText>

                <TouchableOpacity
                  style={cardStyles.categoryButton}
                  onPress={() => setShowCategoryModal(true)}
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

      {/* 단위 선택 모달 */}
      <UnitSelector
        visible={showUnitModal}
        selectedUnit={item.unit}
        options={unitOptions}
        onSelect={unit => {
          onUpdateItem(item.id, 'unit', unit);
          setShowUnitModal(false);
        }}
        onClose={() => setShowUnitModal(false)}
      />

      {/* 보관방법 선택 모달 */}
      <UnitSelector
        visible={showStorageModal}
        selectedUnit={item.storageType}
        options={storageTypes}
        onSelect={storage => {
          onUpdateItem(item.id, 'storageType', storage);
          setShowStorageModal(false);
        }}
        onClose={() => setShowStorageModal(false)}
      />

      {/* 카테고리 선택 모달 */}
      <UnitSelector
        visible={showCategoryModal}
        selectedUnit={item.itemCategory}
        options={categories}
        onSelect={category => {
          onUpdateItem(item.id, 'itemCategory', category);
          setShowCategoryModal(false);
        }}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* 날짜 선택기 */}
      <DatePicker
        visible={showDatePicker}
        initialDate={
          item.expiryDate ||
          new Date().toISOString().split('T')[0].replace(/-/g, '.')
        }
        onDateSelect={handleDateSelect}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );
};

export default AddItemCard;
