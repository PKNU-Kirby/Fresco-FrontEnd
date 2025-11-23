import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import CartItemCard from './CartItemCard';
import { CartItem } from '../../types/shoppingListTypes';
import { styles } from './styles';

interface ShoppingListContentProps {
  isEditMode: boolean;
  displayItems: CartItem[];
  pendingChanges: Map<number, Partial<CartItem>>;
  itemRefs: React.MutableRefObject<Map<number, any>>;
  onDelete: (itemId: number) => void;
  onToggleCheck: (itemId: number) => void;
  renderFooter: () => React.ReactElement | null;
  onDragEnd: ({ data }: { data: CartItem[] }) => void;
  onNameChange: (itemId: number, newName: string) => void;
  onUnitChange: (itemId: number, newUnit: string) => void;
  onQuantityChange: (itemId: number, newQuantity: number) => void;
}

const ShoppingListContent: React.FC<ShoppingListContentProps> = ({
  isEditMode,
  displayItems,
  pendingChanges,
  itemRefs,
  onDelete,
  onToggleCheck,
  renderFooter,
  onDragEnd,
  onNameChange,
  onUnitChange,
  onQuantityChange,
}) => {
  return (
    <DraggableFlatList
      data={displayItems}
      onDragEnd={onDragEnd}
      activationDistance={10}
      dragItemOverflow={true}
      extraData={pendingChanges}
      showsVerticalScrollIndicator={false}
      keyExtractor={item => `cart-item-${item.id}`}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item, drag, isActive, getIndex }) => (
        <CartItemCard
          ref={ref => {
            if (ref) {
              itemRefs.current.set(item.id, ref);
            } else {
              itemRefs.current.delete(item.id);
            }
          }}
          item={item}
          onDrag={drag}
          onDelete={onDelete}
          isActive={isActive}
          isEditMode={isEditMode}
          onNameChange={onNameChange}
          onUnitChange={onUnitChange}
          onToggleCheck={onToggleCheck}
          isFirstItem={getIndex?.() === 0}
          onQuantityChange={onQuantityChange}
        />
      )}
      ListFooterComponent={renderFooter}
    />
  );
};

export default ShoppingListContent;
