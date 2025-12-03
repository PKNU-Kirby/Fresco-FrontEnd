// FridgeHome -> FridgeItemCard
//
// TODO
// FridgeItem 타입 맞추기
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
//
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
//
import UnitSelector from './UnitSelector';
import DeleteButton from './DeleteButton';
import DatePicker from '../../modals/DatePicker';
import ConfirmModal from '../../modals/ConfirmModal';
import SliderQuantityEditor from './SliderQuantityEditor';
import { cardStyles as styles } from './styles';

// 카테고리별 아이콘,
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: { name: string; color: string } } = {
    베이커리: { name: 'bread-slice', color: '#999' },
    '채소 / 과일': { name: 'food-apple', color: '#999' },
    '정육 / 계란': { name: 'food-steak', color: '#999' },
    가공식품: { name: 'package-variant-closed', color: '#999' },
    '수산 / 건어물': { name: 'fish', color: '#999' },
    '쌀 / 잡곡': { name: 'rice', color: '#999' },
    '주류 / 음료': { name: 'cup', color: '#999' },
    '우유 / 유제품': { name: 'cheese', color: '#999' },
    건강식품: { name: 'leaf', color: '#999' },
    '장 / 양념 / 소스': { name: 'bottle-tonic', color: '#999' },
    기타: { name: 'food', color: '#999' },
  };
  return iconMap[category] || iconMap['기타'];
};

type FridgeItem = {
  id: number;
  fridgeId: number;
  name: string;
  quantity: number;
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
  onQuantityChange?: (itemId: number, newQuantity: number) => void;
  onExpiryDateChange?: (itemId: number, newDate: string) => void;
  onUnitChange?: (itemId: number, newUnit: string) => void;
  onDeleteItem?: (itemId: number) => void;
  onMaxQuantityChange?: (itemId: number, newMaxQuantity: number) => void;
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
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localUnit, setLocalUnit] = useState(item.unit || '개');
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [previousQuantity, setPreviousQuantity] = useState(item.quantity);
  const [localExpiryDate, setLocalExpiryDate] = useState(item.expiryDate);
  const [maxQuantity, setMaxQuantity] = useState(
    item.maxQuantity || item.quantity || 10,
  );

  const CardComponent: React.ComponentType<any> =
    onPress && !isEditMode ? TouchableOpacity : View;
  const unitOptions = ['개', 'ml', 'g', 'kg', 'L'];

  // 소비기한 계산 함수
  const getDaysUntilExpiry = (expiryDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // 소비기한 상태 계산 : isExpiringSoon / isExpired
  const daysLeft = getDaysUntilExpiry(localExpiryDate);
  const isExpiringSoon = daysLeft <= 3 && daysLeft >= 0; // 3일 이하
  const isExpired = daysLeft < 0; // 지남

  // 소비기한 경고 텍스트
  const getExpiryWarningText = (): string => {
    if (isExpired) return '기한만료';
    if (daysLeft === 0) return '오늘까지';
    if (daysLeft === 1) return '내일까지';
    return `${daysLeft}일 남음`;
  };

  // 편집 모드 소비기한 버튼 스타일 결정
  const getEditExpiryStyle = () => {
    if (isExpired) {
      return styles.editableExpiryExpired;
    }
    if (isExpiringSoon) {
      return styles.editableExpirySoon;
    }
    return styles.editableExpiry;
  };

  // Quantity 포맷 -> 정수면 소수점 없이, 소수면 둘째자리까지
  const formatQuantity = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';

    if (numValue % 1 === 0) {
      return Math.round(numValue).toString();
    } else {
      return numValue.toFixed(2);
    }
  };

  // 🔥 편집 모드 진입 시 maxQuantity 초기화 (한 번만!)
  useEffect(() => {
    if (isEditMode) {
      const currentQuantity = item.quantity || 10;
      const initialMaxQuantity = Math.max(
        item.maxQuantity || currentQuantity,
        currentQuantity,
      );
      console.log(
        '🔵 [편집 모드 진입] maxQuantity 초기화:',
        initialMaxQuantity,
      );
      setMaxQuantity(initialMaxQuantity);
    }
  }, [isEditMode]); // 🔥 item.quantity, item.maxQuantity 제거!

  // item.quantity prop 변경 -> localQuantity 동기화
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  // 🔥 maxQuantity 변경 감지 (디버깅용)
  useEffect(() => {
    console.log('🔴 [maxQuantity 변경됨]:', maxQuantity);
    console.trace(); // 호출 스택 추적
  }, [maxQuantity]);

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

  // 🔥 Handle : Quantity 변경 (maxQuantity 업데이트 제거)
  const handleQuantityChange = (newQuantity: number) => {
    console.log(
      '🟢 [Quantity 변경]:',
      newQuantity,
      'maxQuantity:',
      maxQuantity,
    );

    if (newQuantity === 0) {
      setLocalQuantity(newQuantity);
      return;
    }

    setLocalQuantity(newQuantity);
    onQuantityChange?.(item.id, newQuantity);
  };

  // Handle : 식재료 삭제
  const handleDeleteRequest = () => {
    // SliderQuantityEditor에서 0이 되면 호출됨
    setPreviousQuantity(localQuantity);
    setShowDeleteModal(true);
  };

  // Modal : 식제료 삭제 확인
  const handleDeleteConfirm = (_name: string) => {
    setShowDeleteModal(true);
  };

  // Handle : 식재료 삭제 [확인]
  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onDeleteItem?.(item.id);
  };

  // Handle : 식제료 삭제 [취소]
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    // 삭제 취소 시 이전 수량으로 복원
    if (localQuantity === 0 || localQuantity === 0) {
      setLocalQuantity(previousQuantity);
      onQuantityChange?.(item.id, previousQuantity);
    }
  };

  const handleTextInputBlur = () => {
    // TextInput blur 시 처리 (필요시)
  };

  return (
    <>
      <CardComponent
        style={[
          styles.itemCard,
          isExpiringSoon && styles.cardExpiringSoon,
          isExpired && styles.cardExpired,
        ]}
        onPress={onPress}
      >
        {isEditMode && (
          <DeleteButton onPress={() => handleDeleteConfirm(item.name)} />
        )}

        {/* 소비기한 경고 배지 ( !isEditMode ) */}
        {!isEditMode && (isExpiringSoon || isExpired) && (
          <View style={[styles.expiryBadge, isExpired && styles.expiredBadge]}>
            <Text style={styles.expiryBadgeText}>{getExpiryWarningText()}</Text>
          </View>
        )}

        {/* 카테고리별 아이콘 이미지 */}
        <View style={styles.itemImageContainer}>
          <View style={styles.itemImagePlaceholder}>
            <Icon
              name={getCategoryIcon(item.itemCategory).name}
              size={40}
              color={getCategoryIcon(item.itemCategory).color}
            />
          </View>
        </View>

        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>

            {isEditMode ? (
              <TouchableOpacity
                style={styles.expiaryContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={[
                    styles.itemExpiryNormal,
                    isExpiringSoon && styles.itemExpiringSoon,
                    isExpired && styles.itemExpired,
                    getEditExpiryStyle(),
                  ]}
                >
                  {localExpiryDate}
                </Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
          </View>

          {/* 슬라이더 수량 편집기 (isEditMode) */}
          {isEditMode ? (
            <View style={styles.itemDetails}>
              <SliderQuantityEditor
                quantity={localQuantity}
                unit={localUnit}
                maxQuantity={maxQuantity}
                isEditMode={isEditMode}
                onQuantityChange={handleQuantityChange}
                onTextBlur={handleTextInputBlur}
                onUnitPress={() => setShowUnitModal(true)}
                onDeleteRequest={handleDeleteRequest}
              />
            </View>
          ) : (
            <>
              <View style={styles.itemDetails}>
                <View style={styles.itemQuantityContainer}>
                  <Text style={styles.itemQuantity}>
                    {formatQuantity(item.quantity)} {item.unit || '개'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.itemExpiary,
                    isExpiringSoon && styles.expiryTextSoon,
                    isExpired && styles.expiryTextExpired,
                  ]}
                >
                  {item.expiryDate}
                </Text>
              </View>
              <Text style={styles.itemStatus}>{item.itemCategory}</Text>
            </>
          )}
        </View>
      </CardComponent>

      {/* Modals */}
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
      <ConfirmModal
        visible={showDeleteModal}
        title="식재료 삭제"
        message={
          <Text style={styles.message}>
            식재료 <Text style={styles.emphmessage}>{item.name}</Text> 을(를)
            삭제합니다.
          </Text>
        }
        iconContainer={{ backgroundColor: '#e8f5e9' }}
        icon={{
          name: 'delete-outline',
          color: 'rgba(47, 72, 88, 1)',
          size: 48,
        }}
        confirmText="삭제"
        cancelText="취소"
        confirmButtonStyle="general"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default FridgeItemCard;
