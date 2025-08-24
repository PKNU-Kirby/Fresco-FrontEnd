import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import AddItemCard from './AddItemCard';
import { ItemFormData } from './index';
import { addItemStyles as styles } from './styles';

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
}

export const AddItemContent: React.FC<AddItemContentProps> = ({
  items,
  isEditMode,
  focusedItemId,
  onUpdateItem,
  onRemoveItem,
  onFocusComplete,
  onAddNewItem,
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
        {items.map((item, index) => (
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
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};
