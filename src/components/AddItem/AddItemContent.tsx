import React, { useRef } from 'react';
import { View, ScrollView, Text } from 'react-native';
import AddItemCard from './AddItemCard';
import { ItemFormData } from '../../screens/AddItemScreen';
import { addItemContentStyles as styles } from './styles';

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
  onAddNewItem?: () => string;
  confirmedIngredients?: ConfirmedIngredient[];
}

export const AddItemContent: React.FC<AddItemContentProps> = ({
  items,
  isEditMode,
  focusedItemId,
  onUpdateItem,
  onRemoveItem,
  onFocusComplete,
  confirmedIngredients = [],
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

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
          ? // 편집 모드 : 기존 카드 표시
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
          : // 확인 모드 : 간단한 정보만 표시
            confirmedIngredients.map((confirmed, index) => {
              let apiResult = confirmed.apiResult;
              if (typeof apiResult === 'string') {
                try {
                  apiResult = JSON.parse(apiResult);
                } catch (error) {
                  // console.error('apiResult 파싱 실패:', error);
                  apiResult = {
                    ingredientId: 0,
                    ingredientName: '',
                    categoryId: 0,
                    categoryName: '',
                  };
                }
              }

              console.log(`확인 모드 렌더링 ${index}:`, {
                userInputName: confirmed.userInput?.name,
                apiResultName: apiResult?.ingredientName,
                parsedApiResult: apiResult,
                fullUserInput: confirmed.userInput,
              });

              return (
                <View key={index} style={styles.confirmationCard}>
                  <View style={styles.confirmationHeader}>
                    <Text style={styles.confirmationTitle}>
                      {apiResult?.ingredientName ||
                        confirmed.userInput?.name ||
                        '이름 없음'}
                    </Text>
                  </View>

                  <View style={styles.confirmationContent}>
                    <View style={styles.confirmationRow}>
                      <Text style={styles.confirmationLabel}>수량:</Text>
                      <Text style={styles.confirmationDetail}>
                        {confirmed.userInput?.quantity || 1}
                        {confirmed.userInput?.unit || '개'}
                      </Text>
                    </View>

                    <View style={styles.confirmationDivider} />
                    <View style={styles.confirmationRow}>
                      <Text style={styles.confirmationLabel}>소비기한:</Text>
                      <Text style={styles.confirmationDetail}>
                        {confirmed.userInput?.expirationDate || '자동입력'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};
