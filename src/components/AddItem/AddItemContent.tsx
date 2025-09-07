import React, { useRef } from 'react';
import { View, ScrollView, Text } from 'react-native';
import AddItemCard from './AddItemCard';
import { ItemFormData } from '../../screens/AddItemScreen';
import { addItemStyles as styles } from './styles';

// 확인된 식재료 정보 타입
export interface ConfirmedIngredient {
  userInput: ItemFormData;
  apiResult: {
    ingredientId: number;
    ingredientName: string;
    categoryId: number;
    categoryName: string;
  };
}

interface AddItemContentProps {
  items: ItemFormData[];
  isEditMode: boolean;
  focusedItemId: string | null;
  onUpdateItem: (
    itemId: string,
    field: keyof ItemFormData,
    value: string,
  ) => void;
  onRemoveItem: (itemId: string) => void;
  onFocusComplete: () => void;
  onAddNewItem?: () => string; // 새 아이템 추가하고 ID 반환
  confirmedIngredients?: ConfirmedIngredient[]; // 확인된 식재료 정보
}

export const AddItemContent: React.FC<AddItemContentProps> = ({
  items,
  isEditMode,
  focusedItemId,
  onUpdateItem,
  onRemoveItem,
  onFocusComplete,
  onAddNewItem,
  confirmedIngredients = [],
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const handleAddNewItem = () => {
    if (onAddNewItem) {
      const newItemId = onAddNewItem();
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
    }
  };

  return (
    <View style={styles.contentContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          !isEditMode && styles.scrollContentWithOverlay,
          isEditMode && styles.scrollContentWithOverlayEditMode,
        ]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        {isEditMode
          ? // 편집 모드: 기존 카드 표시
            items.map((item, index) => (
              <AddItemCard
                key={item.id}
                item={item}
                index={index}
                isEditMode={isEditMode}
                showDeleteButton={true}
                onUpdateItem={onUpdateItem}
                onRemoveItem={onRemoveItem}
                focusedItemId={focusedItemId}
                onFocusComplete={onFocusComplete}
              />
            ))
          : // 확인 모드: 확인된 식재료 정보 표시
            confirmedIngredients.map((confirmed, index) => (
              <View key={index} style={styles.confirmationCard}>
                <View style={styles.confirmationHeader}>
                  <Text style={styles.confirmationTitle}>
                    {index + 1}번째 식재료
                  </Text>
                </View>

                <View style={styles.confirmationContent}>
                  <View style={styles.confirmationRow}>
                    <Text style={styles.confirmationLabel}>입력한 이름:</Text>
                    <Text style={styles.confirmationUserInput}>
                      "{confirmed.userInput.name}"
                    </Text>
                  </View>

                  <View style={styles.confirmationArrow}>
                    <Text style={styles.arrowText}>↓</Text>
                  </View>

                  <View style={styles.confirmationRow}>
                    <Text style={styles.confirmationLabel}>인식된 식재료:</Text>
                    <Text style={styles.confirmationApiResult}>
                      "{confirmed.apiResult.ingredientName}"
                    </Text>
                  </View>

                  <View style={styles.confirmationRow}>
                    <Text style={styles.confirmationLabel}>카테고리:</Text>
                    <Text style={styles.confirmationDetail}>
                      {confirmed.apiResult.categoryName}
                    </Text>
                  </View>

                  <View style={styles.confirmationDivider} />

                  <View style={styles.confirmationRow}>
                    <Text style={styles.confirmationLabel}>수량:</Text>
                    <Text style={styles.confirmationDetail}>
                      {confirmed.userInput.quantity}
                      {confirmed.userInput.unit}
                    </Text>
                  </View>

                  {confirmed.userInput.expirationDate && (
                    <View style={styles.confirmationRow}>
                      <Text style={styles.confirmationLabel}>유통기한:</Text>
                      <Text style={styles.confirmationDetail}>
                        {confirmed.userInput.expirationDate}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};
